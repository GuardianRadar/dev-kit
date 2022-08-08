package main

import (
	"crypto/tls"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

const webPort int = 80
const corePort int = 8002

var coreEndpoint string = "localhost"

var trackConfig TrackConfig
var updateTrackConfig chan bool
var updateRadarConfig chan bool

var trackId uint16 = 1
var tracks []Track
var previousTime time.Time

var websocketFrame WebsocketFrame
var websocketMutex sync.Mutex
var websocketCond *sync.Cond = sync.NewCond(&websocketMutex)

//Entry point for the demo
func main() {

	coreEndpointPtr := flag.String("ip", coreEndpoint, "Sets the IP for the Dev-Kit")
	flag.Parse()
	coreEndpoint = *coreEndpointPtr

	trackConfig = getTrackConfig()
	updateTrackConfig = make(chan bool)
	updateRadarConfig = make(chan bool)

	go runServer()
	go coreWebsocket()

	//prevent the main program from exiting
	select {}
}

//Communicates with the core program
func coreWebsocket() {
	url := fmt.Sprintf("wss://%s:%d/connectWebsocket", coreEndpoint, corePort)
	for {
		//retry until successful connection
		var ws *websocket.Conn
		var err error
		for {
			time.Sleep(5 * time.Second)
			dialer := *websocket.DefaultDialer
			dialer.TLSClientConfig = &tls.Config{InsecureSkipVerify: true}
			ws, _, err = dialer.Dial(url, nil)
			if err != nil {
				fmt.Println(err)
			} else {
				break
			}
		}

		ws.WriteJSON(getRadarConfig())

		//read and process the frame data
		var frame CoreFrame
		for {
			select {
			case yes := <-updateRadarConfig:
				if yes {
					ws.WriteJSON(getRadarConfig())
				}
			default:
			}

			err = ws.ReadJSON(&frame)
			if err != nil {
				fmt.Println("Error:", err)
				break
			}

			select {
			case yes := <-updateTrackConfig:
				if yes {
					trackConfig = getTrackConfig()
				}
			default:
			}
			processFrame(frame)
		}
		ws.Close()
	}
}

//Hosts webserver for displaying tracking information
func runServer() {
	methods := handlers.AllowedMethods([]string{"*", "GET", "POST", "UPDATE", "DELETE", "OPTIONS"})
	origins := handlers.AllowedOrigins([]string{"*"})
	headers := handlers.AllowedHeaders([]string{"*", "Accept", "Accept-Language", "Connection", "Host", "Referer", "User-Agent", "Access-Control-Allow-Origin", "Origin", "Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization"})

	router := mux.NewRouter()
	router.HandleFunc("/output/connectWebsocket", connectWebsocketHandler)
	router.HandleFunc("/api/radarConfigUser", radarConfigUserHandler).Methods("GET", "POST")
	router.HandleFunc("/api/radarConfigDefault", radarConfigDefaultHandler).Methods("GET")
	router.HandleFunc("/api/trackConfigUser", trackConfigUserHandler).Methods("GET", "POST")
	router.HandleFunc("/api/trackConfigDefault", trackConfigDefaultHandler).Methods("GET")
	router.HandleFunc("/api/version", versionHandler).Methods("GET")
	router.PathPrefix("/").Handler(http.StripPrefix("/", http.FileServer(http.Dir("./webpage/src"))))
	err := http.ListenAndServe(fmt.Sprintf(":%d", webPort), handlers.CORS(methods, origins, headers)(router))
	if err != nil {
		fmt.Println(err)
	}
}

//Upgrades to websocket connection from endpoint
func connectWebsocketHandler(w http.ResponseWriter, r *http.Request) {
	ws, err := websocket.Upgrade(w, r, nil, 1024, 1024)
	if _, isHandshakeError := err.(websocket.HandshakeError); isHandshakeError {
		http.Error(w, "Not a websocket handshake", 400)
		return
	} else if err != nil {
		fmt.Println(err)
		return
	}
	serverWebsocket(ws)
	ws.Close()
}

//Handles transmitting messages over websocket
func serverWebsocket(ws *websocket.Conn) {
	for {
		websocketMutex.Lock()
		websocketCond.Wait()
		var websocketFrameCopy WebsocketFrame = websocketFrame
		websocketMutex.Unlock()

		err := ws.WriteJSON(websocketFrameCopy)
		if err != nil {
			fmt.Println(err)
			break
			// see RFC 6455 section 7.4
			if err == websocket.ErrCloseSent || websocket.IsCloseError(err, 1000, 1001, 1002, 1003, 1006, 1007, 1008, 1009, 1010) {
				break
			}
		}
	}
}

func getTrackConfig() TrackConfig {
	bytesDefault, err := ioutil.ReadFile("src/configs/trackConfigDefault.json")
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	mapDefault := map[string]interface{}{}
	err = json.Unmarshal(bytesDefault, &mapDefault)
	if err != nil {
		panic(err)
	}

	bytesUser, err := ioutil.ReadFile("src/configs/trackConfigUser.json")
	if err != nil {
		trackConfig := TrackConfig{}
		err = json.Unmarshal(bytesDefault, &trackConfig)
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}
		return trackConfig
	}
	mapUser := map[string]interface{}{}
	err = json.Unmarshal(bytesUser, &mapUser)
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	mapMerged := merge(mapUser, mapDefault)
	bytesMerged, err := json.Marshal(mapMerged)
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	trackConfig := TrackConfig{}
	err = json.Unmarshal(bytesMerged, &trackConfig)
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	return trackConfig
}

func getRadarConfig() RadarConfig {
	bytesDefault, err := ioutil.ReadFile("src/configs/radarConfigDefault.json")
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	mapDefault := map[string]interface{}{}
	err = json.Unmarshal(bytesDefault, &mapDefault)
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	bytesUser, err := ioutil.ReadFile("src/configs/radarConfigUser.json")
	if err != nil {
		radarConfig := RadarConfig{}
		err = json.Unmarshal(bytesDefault, &radarConfig)
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}
		return radarConfig
	}
	mapUser := map[string]interface{}{}
	err = json.Unmarshal(bytesUser, &mapUser)
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	mapMerged := merge(mapUser, mapDefault)
	bytesMerged, err := json.Marshal(mapMerged)
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	radarConfig := RadarConfig{}
	err = json.Unmarshal(bytesMerged, &radarConfig)
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	return radarConfig
}
