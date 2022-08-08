package main

import (
	"io/ioutil"
	"net/http"
)

func radarConfigUserHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		bytesUser, err := ioutil.ReadFile("src/configs/radarConfigUser.json")
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
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
		err = ioutil.WriteFile("src/configs/radarConfigUser.json", bytesNew, 0777)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		updateRadarConfig <- true
		w.WriteHeader(http.StatusOK)
		w.Write(bytesNew)

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
			w.WriteHeader(http.StatusNotFound)
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

func versionHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		bytesVersion, err := ioutil.ReadFile("../version.md")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write(bytesVersion)
	}
}
