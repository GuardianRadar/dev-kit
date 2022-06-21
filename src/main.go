package main

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"math"
	"net/http"
	"os"
	"sort"
	"sync"
	"time"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

const port string = "8002"

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

	trackConfig = getTrackConfig()
	updateTrackConfig = make(chan bool)

	go runServer()
	go coreWebsocket()

	//prevent the main program from exiting
	<-make(chan bool)
}

//Communicates with the core program
func coreWebsocket() {
	url := "wss://localhost:" + port + "/connectWebsocket"
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
				fmt.Println("Terminator")
				fmt.Println(err)
				break
			}
			select {
			case yes := <-updateTrackConfig:
				if yes {
					trackConfig = getTrackConfig()
				}
			default:
			}
			//fmt.Println("frame is", frame)
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

	port := 80
	router := mux.NewRouter()
	router.HandleFunc("/output/connectWebsocket", connectWebsocketHandler)
	router.HandleFunc("/api/radarConfigUser", radarConfigUserHandler).Methods("GET", "POST")
	router.HandleFunc("/api/resetRadarConfigDefaults", resetRadarConfigDefaultsHandler).Methods("GET")
	router.HandleFunc("/api/radarConfigDefault", radarConfigDefaultHandler).Methods("GET")
	router.HandleFunc("/api/trackConfigUser", trackConfigUserHandler).Methods("GET", "POST")
	router.HandleFunc("/api/trackConfigDefault", trackConfigDefaultHandler).Methods("GET")
	router.HandleFunc("/api/health", trackConfigDefaultHandler).Methods("GET")
	router.PathPrefix("/").Handler(http.StripPrefix("/", http.FileServer(http.Dir("./webpage"))))
	err := http.ListenAndServe(fmt.Sprintf(":%d", port), handlers.CORS(methods, origins, headers)(router))
	if err != nil {
		fmt.Println(err)
	}
}

func resetRadarConfigDefaultsHandler(w http.ResponseWriter, r *http.Request) {
	file, err := os.Create("src/configs/radarConfigUser.json")
	//var bytesDefault []byte
	emptyMapDefault := []byte("{}")
	// err = json.Unmarshal(bytesDefault, &emptyMapDefault)
	// if err != nil {
	// 	fmt.Println(err)
	// 	os.Exit(1)
	// }
	_, err2 := file.Write(emptyMapDefault)
	if err != nil {
		fmt.Println(err2)
		os.Exit(1)
	}
	response, err := Get("http://localhost:8001/radarConfigUpdate/")
	if err != nil {
		fmt.Println("send userconfig update notification to core failed")
	} else {
		response.Body.Close()
	}
	updateRadarConfig <- true
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
		fmt.Println(err)
		os.Exit(1)
	}

	bytesUser, err := ioutil.ReadFile("src/configs/trackConfigUser.json")
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
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
		fmt.Println(err)
		os.Exit(1)
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

//Handles receiving messages from core websocket
func processFrame(coreFrame CoreFrame) {
	if coreFrame.ResolutionInfo.RangeBinCount == 0 {
		fmt.Println("waiting for resolution info...")
		previousTime = time.Now()
		return
	}

	var currentTime time.Time = time.Now()
	var deltaTime time.Duration = currentTime.Sub(previousTime)
	previousTime = currentTime

	var detections []Detection = translateCoreDetections(coreFrame.Detections, coreFrame.ResolutionInfo.DopplerResolution)

	var clusters []Cluster = generateClusters(detections)

	tracks = updateTracks(tracks, clusters, deltaTime.Seconds())

	websocketFrame = WebsocketFrame{
		FrameNumber:    coreFrame.FrameNumber,
		ResolutionInfo: coreFrame.ResolutionInfo,
		Detections:     detections,
		Clusters:       clusters,
		Tracks:         filterTracks(tracks),
	}

	websocketMutex.Lock()
	websocketCond.Broadcast()
	websocketMutex.Unlock()

	fmt.Println("detections:", len(detections), "clusters:", len(clusters), "tracks:", len(tracks))
	fmt.Println("---end---")
}

//Translates the core detections into format for the tracking algorithmn
func translateCoreDetections(coreDetections []CoreDetection, dopplerResolution float64) []Detection {
	//unique identifier for each detection this frame
	var id uint16 = 1
	var detections []Detection
	for _, coreDetection := range coreDetections {

		//convert from doppler index to x and y velocity
		var velocity float64 = float64(coreDetection.DopplerIndex) * dopplerResolution
		var velocityX float64 = velocity * coreDetection.SinAzim
		var velocityY float64 = math.Sqrt(velocity*velocity - velocityX*velocityX)
		if velocity < 0 {
			velocityY = velocityY * -1
		}

		var detection Detection = Detection{
			Id:         id,
			X:          coreDetection.X,
			Y:          coreDetection.Y,
			VelocityX:  velocityX,
			VelocityY:  velocityY,
			RangeSnr:   coreDetection.RangeSnr,
			DopplerSnr: coreDetection.DopplerSnr,
		}
		id += 1
		detections = append(detections, detection)
	}
	return detections
}

//Clusters together detections within range
func generateClusters(detections []Detection) []Cluster {
	//unique identifier for each cluster this frame
	var id uint16 = 1
	var clusters []Cluster
	var indices []int
	for i, _ := range detections {
		indices = append(indices, i)
	}
	for i, detection := range detections {

		if !containsValueInt(indices, i) {
			continue
		}

		//group detections into cluster
		var detectionIds []uint16
		detectionIds = append(detectionIds, detections[i].Id)
		indices = removeValueInt(indices, i)

		var neighborIndices []int = findNeighbors(detection, indices, detections)

		for _, neighborIndex := range neighborIndices {
			detectionIds = append(detectionIds, detections[neighborIndex].Id)
			indices = removeValueInt(indices, neighborIndex)
		}

		//compute cluster values from detections
		var sumX float64 = detection.X
		var sumY float64 = detection.Y
		var sumVelocityX float64 = detection.VelocityX
		var sumVelocityY float64 = detection.VelocityY
		var maxX float64 = detection.X
		var maxY float64 = detection.Y
		var minX float64 = detection.X
		var minY float64 = detection.Y
		for _, neighborIndex := range neighborIndices {
			var x float64 = detections[neighborIndex].X
			var y float64 = detections[neighborIndex].Y
			sumX += x
			sumY += y
			sumVelocityX += detections[neighborIndex].VelocityX
			sumVelocityY += detections[neighborIndex].VelocityY
			maxX = math.Max(maxX, x)
			maxY = math.Max(maxY, y)
			minX = math.Min(minX, x)
			minY = math.Min(minY, y)
		}
		var averageX float64 = sumX / float64(len(neighborIndices)+1)
		var averageY float64 = sumY / float64(len(neighborIndices)+1)
		var averageVelocityX float64 = sumVelocityX / float64(len(neighborIndices)+1)
		var averageVelocityY float64 = sumVelocityY / float64(len(neighborIndices)+1)
		var width float64 = maxX - minX
		var height float64 = maxY - minY

		var cluster Cluster = Cluster{
			Id:           id,
			DetectionIds: detectionIds,
			X:            averageX,
			Y:            averageY,
			VelocityX:    averageVelocityX,
			VelocityY:    averageVelocityY,
			Width:        width,
			Height:       height,
		}
		id += 1
		clusters = append(clusters, cluster)
	}
	return clusters
}

//Creates, Deletes, and Updates tracks
func updateTracks(tracks []Track, clusters []Cluster, deltaTime float64) []Track {

	//find each cluster that has not been associated
	var unassignedIndices []int
	for i := range clusters {
		unassignedIndices = append(unassignedIndices, i)
	}
	//update and delete tracks
	for i := 0; i < len(tracks); i++ {
		var track *Track = &tracks[i]

		//move the track according to its velocity
		track.X = track.X + track.VelocityX*deltaTime
		track.Y = track.Y + track.VelocityY*deltaTime

		var clusterIndex int = findTrackAssociate(*track, unassignedIndices, clusters)
		if clusterIndex == -1 {
			track.Age += 1
			track.Ticks -= 1
			track.ClusterId = 0
			if track.Age > trackConfig.Tracking.MaxAge || track.Ticks == 0 {
				tracks = removeValueTrack(tracks, *track)
			}
		} else {

			track.Age = 0
			track.Ticks += 1
			var cluster Cluster = clusters[clusterIndex]
			var alpha float64 = trackConfig.Tracking.ClusterWeight
			track.X = track.X*(1-alpha) + cluster.X*alpha
			track.Y = track.Y*(1-alpha) + cluster.Y*alpha
			track.VelocityX = track.VelocityX*(1-alpha) + cluster.VelocityX*alpha
			track.VelocityY = track.VelocityY*(1-alpha) + cluster.VelocityY*alpha
			track.ClusterId = cluster.Id

			unassignedIndices = removeValueInt(unassignedIndices, clusterIndex)
		}
	}
	//create new tracks from remaining clusters
	for _, unassignedIndex := range unassignedIndices {
		if len(tracks) == int(trackConfig.Tracking.MaxCount) {
			break
		}
		var cluster Cluster = clusters[unassignedIndex]
		var track Track = Track{
			Id:        trackId,
			ClusterId: cluster.Id,
			X:         cluster.X,
			Y:         cluster.Y,
			VelocityX: cluster.VelocityX,
			VelocityY: cluster.VelocityY,
			Age:       0,
			Ticks:     1,
		}
		trackId += 1
		if trackId > 999 {
			trackId = 1
		}
		tracks = append(tracks, track)
	}

	//older tracks have priority to associate with clusters
	sort.Sort(sort.Reverse(ByAge(tracks)))
	return tracks
}

func filterTracks(tracks []Track) []Track {
	var filteredTracks []Track
	for i := 0; i < len(tracks); i++ {
		var track Track = tracks[i]
		if track.Ticks >= trackConfig.Tracking.MinimumTicks {
			filteredTracks = append(filteredTracks, track)
		}
	}
	return filteredTracks
}

func findNeighbors(targetDetection Detection, searchIndices []int, detections []Detection) []int {
	var neighborIndices []int
	for _, neighborIndex := range searchIndices {
		var neighborDetection Detection = detections[neighborIndex]
		var distance float64 = magnitude(neighborDetection.X-targetDetection.X, neighborDetection.Y-targetDetection.Y)
		if distance > trackConfig.Clustering.AssociateDistance {
			continue
		}
		neighborIndices = append(neighborIndices, neighborIndex)
	}
	return neighborIndices
}

func findTrackAssociate(track Track, searchIndices []int, clusters []Cluster) int {
	var index int = -1
	var nearestDistance float64 = math.MaxFloat64
	for _, searchIndex := range searchIndices {
		var cluster Cluster = clusters[searchIndex]
		var distance float64 = magnitude(cluster.X-track.X, cluster.Y-track.Y)
		if distance >= nearestDistance {
			continue
		}
		nearestDistance = distance
		index = searchIndex
	}
	if nearestDistance > trackConfig.Tracking.AssociateDistance {
		index = -1
	}
	return index
}

type ByAge []Track

func (a ByAge) Len() int           { return len(a) }
func (a ByAge) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a ByAge) Less(i, j int) bool { return a[i].Age < a[j].Age }

func containsValueInt(values []int, value int) bool {
	for _, _value := range values {
		if _value == value {
			return true
		}
	}
	return false
}
func removeValueInt(values []int, value int) []int {
	for i, _value := range values {
		if _value == value {
			return removeIndexInt(values, i)
		}
	}
	return values
}
func removeIndexInt(values []int, index int) []int {
	values[index] = values[len(values)-1]
	return values[:len(values)-1]
}
func removeIndexTrack(values []Track, index int) []Track {
	values[index] = values[len(values)-1]
	return values[:len(values)-1]
}
func removeValueTrack(values []Track, value Track) []Track {
	for i, _value := range values {
		if _value.Id == value.Id {
			return removeIndexTrack(values, i)
		}
	}
	return values
}
func magnitude(x float64, y float64) float64 {
	return math.Sqrt(x*x + y*y)
}
