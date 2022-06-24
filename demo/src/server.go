package main

import (
	"io/ioutil"
	"net/http"
	"bytes"
	"crypto/tls"
	"fmt"

)

func radarConfigUserHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("entering radar config user")
	switch r.Method {
	case "GET":
		fmt.Println("entering radar config user GET")
		bytesUser, err := ioutil.ReadFile("src/configs/radarConfigUser.json")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write(bytesUser)
	case "POST":
		fmt.Println("entering radar config user Post")

		bytesNew, err := ioutil.ReadAll(r.Body)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		r.Body.Close()
		err = ioutil.WriteFile("src/configs/radarConfigUser.json", bytesNew, 0777)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		response, err := Get("http://localhost:8001/radarConfigUpdate/")
		if err != nil {
			fmt.Println("send userconfig update notification to core failed")
		} else {
			response.Body.Close()
		}

		w.WriteHeader(http.StatusOK)
		w.Write(bytesNew)
		updateRadarConfig <- true
	}
}

func radarConfigDefaultHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		bytesDefault, err := ioutil.ReadFile("src/configs/radarConfigDefault.json")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write(bytesDefault)
	}
}

func trackConfigUserHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		bytesUser, err := ioutil.ReadFile("src/configs/trackConfigUser.json")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write(bytesUser)
	case "POST":
		bytesNew, err := ioutil.ReadAll(r.Body)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		r.Body.Close()
		err = ioutil.WriteFile("src/configs/trackConfigUser.json", bytesNew, 0777)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write(bytesNew)
		updateTrackConfig <- true
	}
}

func trackConfigDefaultHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		bytesDefault, err := ioutil.ReadFile("src/configs/trackConfigDefault.json")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write(bytesDefault)
	}
}

func merge(a map[string]interface{}, b map[string]interface{}) map[string]interface{} {
	merged := b
	for key, value := range a {
		subMergeA, okA := value.(map[string]interface{})
		subMergeB, okB := merged[key].(map[string]interface{})
		if okA && okB {
			merged[key] = merge(subMergeA, subMergeB)
		} else {
			merged[key] = value
		}
	}
	return merged
}


func Get(url string) (resp *http.Response, err error) {
	response, err := http.Get(url)
	return response, err
}
func GetInsecure(url string) (resp *http.Response, err error) {
	transport := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}
	client := &http.Client{Transport: transport}
	response, err := client.Get(url)
	return response, err
}

func Post(url string, contentType string, body []byte) (resp *http.Response, err error) {
	response, err := http.Post(url, contentType, bytes.NewBuffer(body))
	return response, err
}
func PostInsecure(url string, contentType string, body []byte) (resp *http.Response, err error) {
	transport := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}
	client := &http.Client{Transport: transport}
	response, err := client.Post(url, contentType, bytes.NewBuffer(body))
	return response, err
}
