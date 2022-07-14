
const wsPort = protocol === "https:" ? 443 : 80;
const wsProtocol = protocol === "https:" ? "wss:" : "ws:";

const timeoutMin = 250;
const timeoutMax = 5000;
let timeout: number = timeoutMin;


function startWS() {
    const url = `${wsProtocol}//${hostname}:${wsPort}/output/connectWebsocket`;
    const websocket = new WebSocket(url);

    websocket.onopen = function () {
        console.log("[onopen] connected to websocket");
        timeout = timeoutMin;
        frameNumber = 0;
        websocket.send(
            JSON.stringify({
                Action: "requireConnect",
            })
        );
        connectionStatusAfter.style.color = "yellow";
        connectionStatusAfter.innerHTML = "Waiting For Data";
    };

    websocket.onmessage = function (e) {
        const message = JSON.parse(e.data);
        handleMessage(message);
    };

    websocket.onerror = function (e) {
        console.log(`[onerror] error: ${e}`);
        websocket.close();
    };

    websocket.onclose = function () {
        connectionStatusAfter.style.color = "red";
        connectionStatusAfter.innerHTML = "Not Connected";
        setTimeout(function() {
            startWS();
        }, Math.min(timeoutMax, timeout += timeout));
    };

    return websocket;
}

function handleMessage(message: any) {
    if (radarProperties === undefined) {
        const resinfo = message["ResolutionInfo"];
        radarProperties = {
            rangeBinCount: resinfo["RangeBinCount"],
            dopplerBinCount: resinfo["DopplerBinCount"],
            rangeResolution: resinfo["RangeResolution"],
            dopplerResolution: resinfo["DopplerResolution"],
        }
        mapProperties.maxRange =
            radarProperties.rangeBinCount * radarProperties.rangeResolution;
        mapProperties.m_per_px = mapProperties.maxRange / zoomScale / mapProperties.height;
        mapProperties.px_per_m = 1 / mapProperties.m_per_px;

        $("radarPropertyRangeResolution")!.innerText = `${radarProperties.rangeResolution}`;
        $("radarPropertyRangeBinCount")!.innerText = `${radarProperties.rangeBinCount}`;
        $("radarPropertyDopplerResolution")!.innerText = `${radarProperties.dopplerResolution}`;
        $("radarPropertyDopplerBinCount")!.innerText = `${radarProperties.dopplerBinCount}`;
    }
    connectionStatusAfter.style.color = "lime";
    connectionStatusAfter.innerHTML = "Connected";
    frameNumber = message["FrameNumber"];
    if (message["RDM"] != null) {
        ($("rdm") as HTMLImageElement).src = `data:image/png;base64,${message["RDM"]}`;
    }

    radarOutputs.detections = message["Detections"]?.map((detection: any) => parseDetection(detection)) ?? [];
    radarOutputs.clusters = message["Clusters"]?.map((cluster: any) => parseCluster(cluster)) ?? [];
    radarOutputs.tracks = message["Tracks"]?.map((track: any) => parseTrack(track)) ?? [];

    console.log(`----------frame #: ${frameNumber} START-----------`);
    console.log(message);
    console.log(`----------frame #: ${frameNumber} END-------------`);
    redrawRadarMap();
}

function parseDetection(
    websocketDetection: any
): Detection {
    return {
        id: websocketDetection["Id"],
        position: {
            x: websocketDetection["X"],
            y: websocketDetection["Y"],
        },
        velocity: {
            x: websocketDetection["VelocityX"],
            y: websocketDetection["VelocityY"],
        },
        rangeSNRdB: websocketDetection["RangeSnr"],
        dopplerSNRdB: websocketDetection["DopplerSnr"],
    };
}
function parseCluster(websocketCluster: any): Cluster {
    return {
        id: websocketCluster["Id"],
        detectionIds: websocketCluster["DetectionIds"],
        position: {
            x: websocketCluster["X"],
            y: websocketCluster["Y"],
        },
        velocity: {
            x: websocketCluster["VelocityX"],
            y: websocketCluster["VelocityY"],
        },
        width: websocketCluster["Width"],
        height: websocketCluster["Height"],
    };
}
function parseTrack(websocketTrack: any): Track {
    return {
        id: websocketTrack["Id"],
        clusterId: websocketTrack["ClusterId"],
        position: {
            x: websocketTrack["X"],
            y: websocketTrack["Y"],
        },
        velocity: {
            x: websocketTrack["VelocityX"],
            y: websocketTrack["VelocityY"],
        },
        age: websocketTrack["Age"],
    };
}
