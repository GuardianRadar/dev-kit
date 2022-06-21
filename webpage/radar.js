
const protocol = location.protocol;
const hostname = location.hostname;
const port = location.port;
const wsPort = protocol === "https:" ? 443 : 80;
const wsProtocol = protocol === "https:" ? "wss:" : "ws:";

let zoomScale = 1.0;
let radarProperties = undefined;
const radarOutputs = {};
const mapProperties = {};

let frameNumber = 0;
const timeoutMax = 5000;
const timeoutMin = 250;
let timeout = timeoutMin;

const px_per_rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

const detectionDisplayLength = 30;

/** @type {HTMLElement} */
let detectionCloneableTableRow;
/** @type {HTMLElement} */
let detectionTableBody;
/** @type {HTMLElement} */
let detectionDisplayTypeCheckbox;
/** @type {HTMLElement} */
let clusterTableBody;
/** @type {HTMLElement} */
let clusterDisplayTypeCheckbox;
/** @type {HTMLElement} */
let clusterCloneableTableRow;
/** @type {HTMLElement} */
let trackTableBody;
/** @type {HTMLElement} */
let trackDisplayTypeCheckbox;
/** @type {HTMLElement} */
let trackCloneableTableRow;
/** @type {HTMLElement} */
let connectionStatusAfter;
/** @type {HTMLElement} */
let root;
/** @type {HTMLElement} */
let header;
/** @type {HTMLElement} */
let body;
/** @type {HTMLElement} */
let footer;
/** @type {HTMLElement} */
let radarMapContainer;


let trackTrails = [];
const track_count_max = 24;
const track_trail_count_max = 40;
for (let i = 0; i < track_count_max; ++i) {
    trackTrails.push([]);
}

window.onload = async function () {

    root = $("root");
    header = $("header");
    body = $("body");
    footer = $("footer");

    connectionStatusAfter = $("connectionStatusAfter");

    const radarMap = $("radarMap");
    radarMapContainer = $('radarMapContainer')

    sizeRadarMap();
    mapProperties.width = radarMap.width;
    mapProperties.height = radarMap.height;

    radarMap.onwheel = function (event) {
        if (radarProperties) {
            event.preventDefault();
            zoomScale += event.deltaY * -0.001;
            zoomScale = Math.min(Math.max(1, zoomScale), 4);
            mapProperties.m_per_px = mapProperties.maxRange / zoomScale / mapProperties.height;
            mapProperties.px_per_m = 1 / mapProperties.m_per_px;
        }
    }
    radarMap.onmousemove = function (event) {
        if (radarProperties) {
            const rect = event.target.getBoundingClientRect();
            mapProperties.mousePosition = {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            }
        }
    }

    document.querySelectorAll(".switch").forEach(element => {
        element.querySelector("input").addEventListener("input", (event) => {
            element.nextElementSibling.style.color = event.target.checked ? '#1e7aa5' : '#777';
            toggleVisible($(element.dataset.containerId));
        });
    });

    detectionCloneableTableRow = $("detectionCloneableTableRow");
    clusterCloneableTableRow = $("clusterCloneableTableRow");
    trackCloneableTableRow = $("trackCloneableTableRow");

    detectionTableBody = $("detectionTable").querySelector("tbody");
    clusterTableBody = $("clusterTable").querySelector("tbody");
    trackTableBody = $("trackTable").querySelector("tbody");

    detectionDisplayTypeCheckbox = $("detectionDisplayTypeCheckbox");
    clusterDisplayTypeCheckbox = $("clusterDisplayTypeCheckbox");
    trackDisplayTypeCheckbox = $("trackDisplayTypeCheckbox");

    new ResizeObserver(function(mutations) {
        sizeRdmCanvas();
    }).observe($('rdmContainer'), {attributes: true})

    const draggableHeaders = document.querySelectorAll(".draggableHeader");
    for (const draggableHeader of draggableHeaders) {
        dragElement(draggableHeader);
    }

    clearCanvas(radarMap.getContext("2d"));
    startWS();

};
window.onresize = function () {
    sizeRadarMap();
    sizeRdmCanvas();
}

function sizeRadarMap() {
    const width = window.innerWidth - 30 * px_per_rem;
    const height = window.innerHeight - header.clientHeight - footer.clientHeight;


    radarMap.width = 1200;
    radarMap.height = 600;

    mapProperties.width = radarMap.width;
    mapProperties.height = radarMap.height;
    mapProperties.m_per_px = mapProperties.maxRange / zoomScale / mapProperties.height;
    mapProperties.px_per_m = 1 / mapProperties.m_per_px;
}
    
function sizeRdmCanvas() {
    const rdmCanvas = $('rdmCanvas');
    rdmCanvas.width = $('rdmContainer').querySelector('img').clientWidth;

    /**
     * @type {CanvasRenderingContext2D}
     */
    const ctx = rdmCanvas.getContext("2d");

    const width = rdmCanvas.width;
    const height = rdmCanvas.height;

    const m_per_px = mapProperties.maxRange / width;

    const tick = 10;

    ctx.clearRect(0, 0, width, height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.beginPath();
    for (let i = 0; i < m_per_px * width; i += tick) {
        ctx.moveTo(i / m_per_px, 0);
        ctx.lineTo(i / m_per_px, height);
    }
    ctx.stroke();
    ctx.closePath();

}

function redrawRadarMap() {
    const radarMap = $("radarMap");
    const ctx = radarMap.getContext("2d");

    clearCanvas(ctx);
    drawBaseMap(ctx);
    drawRadarOutputs(ctx);
    drawWhiteCover(ctx);
}

function clearCanvas(ctx) {
    //draw background color
    ctx.clearRect(0, 0, mapProperties.width, mapProperties.height);
    ctx.rect(0, 0, mapProperties.width, mapProperties.height);
    ctx.fillStyle = "#fff";
    ctx.fill();

    //draw semicircle
    ctx.beginPath();
    ctx.arc(mapProperties.width / 2, mapProperties.height, mapProperties.height, 0, Math.PI, true);
    ctx.fillStyle = "#333";
    ctx.fill();
    ctx.closePath();
}

function drawBaseMap(ctx) {
    const width = mapProperties.width;
    const height = mapProperties.height;
    const m_per_px = mapProperties.m_per_px;
    const px_per_m = mapProperties.px_per_m;

    //draw major angle lines
    const majorAngleAmount = 30;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#777";
    for (let i = 90 % majorAngleAmount; i < 180; i += majorAngleAmount) {
        const radians = (i * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(width / 2, height);
        ctx.lineTo(
            width / 2 + height * Math.cos(radians),
            height - height * Math.sin(radians)
        );
        ctx.stroke();
        ctx.closePath();
    }

    //draw minor angle lines
    const minorAngleAmount = 5;
    const textPadding = 10;
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#555";
    for (let i = 90 % minorAngleAmount; i <= 180; i += minorAngleAmount) {
        const radians = (i * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(width / 2, height);
        ctx.lineTo(
            width / 2 + height * Math.cos(radians),
            height - height * Math.sin(radians)
        );
        ctx.stroke();
        ctx.closePath();
    }

    //draw minor range lines
    const minorMetersAmount = 1;
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#555";
    for (
        let i = minorMetersAmount;
        i < mapProperties.maxRange;
        i += minorMetersAmount
    ) {
        ctx.beginPath();
        ctx.arc(width / 2, height, i / m_per_px, 0, Math.PI, true);
        ctx.stroke();
        ctx.closePath();
    }

    //major range lines every 10 m
    const majorMetersAmount = 10;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#777";
    ctx.font = "10px sans-serif";
    ctx.font = "10px sans-serif";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (
        let i = majorMetersAmount;
        i < mapProperties.maxRange;
        i += majorMetersAmount
    ) {
        ctx.beginPath();
        ctx.arc(width / 2, height, i / m_per_px, 0, Math.PI, true);
        ctx.stroke();
        ctx.closePath();
    }

    //draw range text and angle text
    ctx.font = "10px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = 90 % minorAngleAmount; i <= 180; i += minorAngleAmount) {
        const radians = (i * Math.PI) / 180;
        ctx.fillText(
            `${90 - i}`,
            width / 2 + (height - textPadding) * Math.cos(radians),
            height - (height - textPadding) * Math.sin(radians)
        );
    }
    for (
        let i = majorMetersAmount;
        i < mapProperties.maxRange;
        i += majorMetersAmount
    ) {
        ctx.fillText(`${i}`, width / 2, height - i / m_per_px);
    }
}

function drawRadarOutputs(ctx) {
    drawDetections(ctx);
    drawClusters(ctx);
    drawTracks(ctx);
}

function drawDetections(ctx) {
    const mp = mapProperties;

    //draw detections
    ctx.strokeStyle = "rgba(0,255,0,1)";
    ctx.lineWidth = 1;
    for (const detection of radarOutputs.detections) {
        ctx.fillStyle = "rgba(0,255,0,1)";

        const x = mp.width / 2 + detection.x * mp.px_per_m;
        const y = mp.height - detection.y * mp.px_per_m;

        ctx.beginPath();
        ctx.arc(
            x,
            y,
            (radarProperties.rangeResolution / 2) * mp.px_per_m,
            0,
            2 * Math.PI,
            false
        );
        ctx.fill();
        ctx.closePath();
    }

    let removeAmount = 0;
    if (detectionDisplayTypeCheckbox.checked) {
        removeAmount = detectionTableBody.children.length - 1;
    } else {
        removeAmount = radarOutputs.detections.length + (detectionTableBody.children.length - 1 - detectionDisplayLength);
    }
    for (let i = 0; i < removeAmount; ++i) {
        detectionTableBody.removeChild(detectionTableBody.lastChild);
    }
    for (const detection of radarOutputs.detections) {
        const clonedTableRow = detectionCloneableTableRow.cloneNode(true);
        clonedTableRow.removeAttribute('id');
        clonedTableRow.removeAttribute('style');
        clonedTableRow.children[0].innerHTML = `${detection.id}`;
        clonedTableRow.children[1].innerHTML = `${detection.x}`;
        clonedTableRow.children[2].innerHTML = `${detection.y}`;
        clonedTableRow.children[3].innerHTML = `${detection.velocityX}`;
        clonedTableRow.children[4].innerHTML = `${detection.velocityY}`;
        clonedTableRow.children[5].innerHTML = `${detection.rangeSNRdB}`;
        clonedTableRow.children[6].innerHTML = `${detection.dopplerSNRdB}`;
        detectionTableBody.insertBefore(clonedTableRow, detectionTableBody.children[1]);
    }
    
}

function drawClusters(ctx) {
    const mp = mapProperties;
    ctx.lineWidth = 2;
    for (const cluster of radarOutputs.clusters) {
        ctx.strokeStyle = "#ff0080";

        const center = {};
        center.x = cluster.x;
        center.y = cluster.y;
        const size = {
            width: cluster.width == 0 ? radarProperties.rangeResolution : cluster.width,
            height: cluster.width == 0 ? radarProperties.rangeResolution : cluster.height,
        };
        const x = mp.width / 2 + (center.x - size.width / 2) * mp.px_per_m;
        const y = mp.height - (center.y + size.height / 2) * mp.px_per_m;
        const width = size.width * mp.px_per_m;
        const height = size.height * mp.px_per_m;

        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.stroke();
        ctx.closePath();

        const velocity = {};
        velocity.x = cluster.velocityX;
        velocity.y = cluster.velocityY;
        ctx.beginPath();
        ctx.moveTo(
            mp.width / 2 + center.x * mp.px_per_m,
            mp.height - center.y * mp.px_per_m
        );
        ctx.lineTo(
            mp.width / 2 + (center.x + velocity.x) * mp.px_per_m,
            mp.height - (center.y + velocity.y) * mp.px_per_m
        );
        ctx.stroke();
        ctx.closePath();

        ctx.font = "10px Arial";
        ctx.fillStyle = "white";
        ctx.textBaseline = "bottom";
        ctx.beginPath();
        ctx.fillText(cluster.id, x + width, y);
        ctx.closePath();
        ctx.textBaseline = "middle";

        for (const detection of radarOutputs.detections) {
            if (cluster.detectionIds.includes(detection.id)) {
                const x = mp.width / 2 + detection.x * mp.px_per_m;
                const y = mp.height - detection.y * mp.px_per_m;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(
                    mp.width / 2 + center.x * mp.px_per_m,
                    mp.height - center.y * mp.px_per_m
                );
                ctx.stroke();
                ctx.closePath();
            }
        }
    }

    
    let removeAmount = 0;
    if (clusterDisplayTypeCheckbox.checked) {
        removeAmount = clusterTableBody.children.length - 1;
    } else {
        removeAmount = radarOutputs.clusters.length + (clusterTableBody.children.length - 1 - detectionDisplayLength);
    }
    for (let i = 0; i < removeAmount; ++i) {
        clusterTableBody.removeChild(clusterTableBody.lastChild);
    }
    for (const cluster of radarOutputs.clusters) {
        const clonedTableRow = clusterCloneableTableRow.cloneNode(true);
        clonedTableRow.removeAttribute('id');
        clonedTableRow.removeAttribute('style');
        clonedTableRow.children[0].innerHTML = `${cluster.id}`;
        clonedTableRow.children[1].innerHTML = `${cluster.detectionIds}`;
        clonedTableRow.children[2].innerHTML = `${cluster.x}`;
        clonedTableRow.children[3].innerHTML = `${cluster.y}`;
        clonedTableRow.children[4].innerHTML = `${cluster.velocityX}`;
        clonedTableRow.children[5].innerHTML = `${cluster.velocityY}`;
        clonedTableRow.children[6].innerHTML = `${cluster.width}`;
        clonedTableRow.children[7].innerHTML = `${cluster.height}`;
        clusterTableBody.insertBefore(clonedTableRow, clusterTableBody.children[1]);
    }

}

function drawTracks(ctx) {
    const mp = mapProperties;

    const halfDiamondSize = Math.max(
        10,
        radarProperties.rangeResolution * mp.px_per_m
    );

    ctx.lineWidth = 2;
    ctx.font = "10px Arial";
    for (const track of radarOutputs.tracks) {
        const color = track.clusterId == 0 ? "#9c953a" : "#ffee00";

        ctx.strokeStyle = color;
        const x = [
            track.x * mp.px_per_m - halfDiamondSize,
            track.x * mp.px_per_m,
            track.x * mp.px_per_m + halfDiamondSize,
            track.x * mp.px_per_m,
        ];
        const y = [
            track.y * mp.px_per_m,
            track.y * mp.px_per_m + halfDiamondSize,
            track.y * mp.px_per_m,
            track.y * mp.px_per_m - halfDiamondSize,
        ];
        for (let i = 0; i < 4; ++i) {
            ctx.beginPath();
            ctx.moveTo(mp.width / 2 + x[i], mp.height - y[i]);
            ctx.lineTo(
                mp.width / 2 + x[(i + 1) % 4],
                mp.height - y[(i + 1) % 4]
            );
            ctx.stroke();
            ctx.closePath();
        }

        //velocity
        ctx.beginPath();
        ctx.moveTo(
            mp.width / 2 + track.x * mp.px_per_m,
            mp.height - track.y * mp.px_per_m
        );
        ctx.lineTo(
            mp.width / 2 + (track.x + track.velocityX) * mp.px_per_m,
            mp.height - (track.y + track.velocityY) * mp.px_per_m
        );
        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle = color;

        //id
        ctx.beginPath();
        ctx.fillText(
            track.id,
            mp.width / 2 + x[1] + halfDiamondSize,
            mp.height - y[0] - halfDiamondSize
        );
        ctx.closePath();

        //rcs
        // ctx.beginPath();
        // ctx.fillText(track.rcs, mp.width / 2 + x[2], mp.height - y[3]);
        // ctx.closePath();
    }

    let removeAmount = 0;
    if (trackDisplayTypeCheckbox.checked) {
        removeAmount = trackTableBody.children.length - 1;
    } else {
        removeAmount = radarOutputs.tracks.length + (trackTableBody.children.length - 1 - detectionDisplayLength);
    }
    for (let i = 0; i < removeAmount; ++i) {
        trackTableBody.removeChild(trackTableBody.lastChild);
    }
    for (const track of radarOutputs.tracks) {
        const clonedTableRow = trackCloneableTableRow.cloneNode(true);
        clonedTableRow.removeAttribute('id');
        clonedTableRow.removeAttribute('style');
        clonedTableRow.children[0].innerHTML = `${track.id}`;
        clonedTableRow.children[1].innerHTML = `${track.clusterId}`;
        clonedTableRow.children[2].innerHTML = `${track.x}`;
        clonedTableRow.children[3].innerHTML = `${track.y}`;
        clonedTableRow.children[4].innerHTML = `${track.velocityX}`;
        clonedTableRow.children[5].innerHTML = `${track.velocityY}`;
        clonedTableRow.children[6].innerHTML = `${track.age}`;
        clonedTableRow.children[7].innerHTML = `${track.ticks}`;
        trackTableBody.insertBefore(clonedTableRow, trackTableBody.children[1]);
    }
}

function drawWhiteCover(ctx) {
    //draw semicircle
    ctx.beginPath();
    ctx.arc(mapProperties.width / 2, mapProperties.height, mapProperties.height, 0, Math.PI, true);
    ctx.lineTo(0, 0);
    ctx.lineTo(mapProperties.width, 0);
    ctx.closePath();
    ctx.fillStyle = "#fff";
    ctx.fill();
}

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

            $(
                "radarPropertyRangeResolution"
            ).innerText += `${radarProperties.rangeResolution}`;
            $(
                "radarPropertyRangeBinCount"
            ).innerText += `${radarProperties.rangeBinCount}`;
            $(
                "radarPropertyDopplerResolution"
            ).innerText += `${radarProperties.dopplerResolution}`;
            $(
                "radarPropertyDopplerBinCount"
            ).innerText += `${radarProperties.dopplerBinCount}`;
        }
        connectionStatusAfter.style.color = "lime";
        connectionStatusAfter.innerHTML = "Connected";
        frameNumber = message["FrameNumber"];
        console.log(`----------frame #: ${frameNumber} START-----------`);
        console.log(message);
        if (message["Img64"] != null) {
            $("rdm").src = `data:image/png;base64,${message["Img64"]}`;
        }

        radarOutputs.detections = message["Detections"]
            ? message["Detections"].map((detection) => parseDetection(detection))
            : [];
        radarOutputs.clusters = message["Clusters"]
            ? message["Clusters"].map((cluster) => parseCluster(cluster))
            : [];
        radarOutputs.tracks = message["Tracks"]
            ? message["Tracks"].map((track) => parseTrack(track))
            : [];

        console.log(`----------frame #: ${frameNumber} END-------------`);
        redrawRadarMap();
    };

    websocket.onerror = function (e) {
        console.log(`[onerror] error: ${e.error}`);
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

function parseDetection(
    websocketDetection
) {
    const parsedDetection = {
        id: websocketDetection["Id"],
        x: websocketDetection["X"],
        y: websocketDetection["Y"],
        velocityX: websocketDetection["VelocityX"],
        velocityY: websocketDetection["VelocityY"],
        rangeSNRdB: websocketDetection["RangeSnr"],
        dopplerSNRdB: websocketDetection["DopplerSnr"],
    };
    return parsedDetection;
}
function parseCluster(websocketCluster) {
    const cluster = {
        id: websocketCluster["Id"],
        detectionIds: websocketCluster["DetectionIds"],
        x: websocketCluster["X"],
        y: websocketCluster["Y"],
        velocityX: websocketCluster["VelocityX"],
        velocityY: websocketCluster["VelocityY"],
        width: websocketCluster["Width"],
        height: websocketCluster["Height"],
    };
    return cluster;
}
function parseTrack(websocketTrack) {
    const track = {
        id: websocketTrack["Id"],
        clusterId: websocketTrack["ClusterId"],
        x: websocketTrack["X"],
        y: websocketTrack["Y"],
        velocityX: websocketTrack["VelocityX"],
        velocityY: websocketTrack["VelocityY"],
        age: websocketTrack["Age"],
    };
    return track;
}

function dragElement(element) {
    let startPosition = {};

    element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        startPosition = {
            x: e.clientX,
            y: e.clientY,
        };
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
        const dragElement = element.parentNode;
        dragElement.classList.remove("fixedContainer");
        dragElement.classList.add("floatingContainer");
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        const dragElement = element.parentNode;

        dragElement.style.top =
        dragElement.offsetTop - (startPosition.y - e.clientY) + "px";
            dragElement.style.left =
        dragElement.offsetLeft -
            (startPosition.x - e.clientX) +
            "px";
        startPosition = {
            x: e.clientX,
            y: e.clientY,
        };
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}