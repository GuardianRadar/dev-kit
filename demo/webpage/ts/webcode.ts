const protocol = location.protocol;
const hostname = location.hostname;
const port = location.port;

function getRadarConfigDefaultHttp(): Promise<RadarConfig> {
    return new Promise((resolve, reject) => {
        const url = `${protocol}//${hostname}:${port}/api/radarConfigDefault`;
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = function () {
            switch (xhr.status) {
                case 200:
                    resolve(JSON.parse(xhr.response));
                    break;
                default:
                    reject("error");
                    break;
            }
        };
        xhr.send();
    });
}
function getRadarConfigUserHttp(): Promise<RecursivePartial<RadarConfig>> {
    return new Promise((resolve, reject) => {
        const url = `${protocol}//${hostname}:${port}/api/radarConfigUser`;
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = function () {
            switch (xhr.status) {
                case 200:
                    try {
                        resolve(JSON.parse(xhr.response));
                    } catch (e) {
                        reject(e);
                    }
                    break;
                case 404:
                    resolve({});
                    break;
                default:
                    reject("error");
                    break;
            }
        };
        xhr.send();
    });
}
function postRadarConfigUserHttp(radarConfig: RecursivePartial<RadarConfig>): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const url = `${protocol}//${hostname}:${port}/api/radarConfigUser`;
        const body = JSON.stringify(radarConfig);
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.onload = function () {
            switch (xhr.status) {
                case 200:
                    resolve(xhr.response);
                    break;
                default:
                    reject("error");
                    break;
            }
        };
        xhr.send(body);
    });
}
function getTrackConfigDefaultHttp(): Promise<TrackConfig> {
    return new Promise((resolve, reject) => {
        const url = `${protocol}//${hostname}:${port}/api/trackConfigDefault`;
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = function () {
            switch (xhr.status) {
                case 200:
                    try {
                        resolve(JSON.parse(xhr.response));
                    } catch (e) {
                        reject(e);
                    }
                    break;
                default:
                    reject("error");
                    break;
            }
        };
        xhr.send();
    });
}
function getTrackConfigUserHttp(): Promise<RecursivePartial<TrackConfig>> {
    return new Promise((resolve, reject) => {
        const url = `${protocol}//${hostname}:${port}/api/trackConfigUser`;
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = function () {
            switch (xhr.status) {
                case 200:
                    try {
                        resolve(JSON.parse(xhr.response));
                    } catch (e) {
                        reject(e);
                    }
                    break;
                case 404:
                    resolve({});
                    break;
                default:
                    reject("error");
                    break;
            }
        };
        xhr.send();
    });
}
function postTrackConfigUserHttp(trackConfig: RecursivePartial<TrackConfig>): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const url = `${protocol}//${hostname}:${port}/api/trackConfigUser`;
        const body = JSON.stringify(trackConfig);
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.onload = function () {
            switch (xhr.status) {
                case 200:
                    resolve(xhr.response);
                    break;
                default:
                    reject("error");
                    break;
            }
        };
        xhr.send(body);
    });
}

function getVersionHttp(): Promise<string> {
    return new Promise((resolve, reject) => {
        const url = `${protocol}//${hostname}:${port}/api/version`;
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = function () {
            switch (xhr.status) {
                case 200:
                    resolve(xhr.response);
                    break;
                default:
                    reject("error");
                    break;
            }
        };
        xhr.send();
    });
}