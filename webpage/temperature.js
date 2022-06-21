const protocol = location.protocol;
const hostname = location.hostname;
const port = location.port;

window.onload = function () {
    getRpiTemperatureLogHttp().then((result) => {
        const temperatureFile = JSON.parse(result).result;
        if (temperatureFile === "") {
            return;
        }
        const temperatureData = parseTemperatureLog(temperatureFile);
        const labels = temperatureData.times;
        const data = {
            labels: labels,
            datasets: [
                {
                    label: "device temperature",
                    backgroundColor: "rgb(255, 99, 132)",
                    borderColor: "rgb(255, 99, 132)",
                    data: temperatureData.temperatures,
                },
            ],
        };
        const config = {
            type: "line",
            data: data,
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        };
        const myChart = new Chart(document.getElementById("rpiCanvas"), config);
        document.getElementById("rpiMax").innerText +=
            temperatureData.maxTemperature;
        document.getElementById("rpiMin").innerText +=
            temperatureData.minTemperature;
    });
    getAwrTemperatureLogHttp().then((result) => {
        const temperatureFile = JSON.parse(result).result;
        if (temperatureFile === "") {
            return;
        }
        const temperatureData = parseTemperatureLog(temperatureFile);
        const labels = temperatureData.times;
        const data = {
            labels: labels,
            datasets: [
                {
                    label: "radar temperature",
                    backgroundColor: "rgb(43, 99, 132)",
                    borderColor: "rgb(43, 99, 132)",
                    data: temperatureData.temperatures,
                },
            ],
        };
        const config = {
            type: "line",
            data: data,
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        };
        const myChart = new Chart(document.getElementById("awrCanvas"), config);
        document.getElementById("awrMax").innerText +=
            temperatureData.maxTemperature;
        document.getElementById("awrMin").innerText +=
            temperatureData.minTemperature;
    });
    getRpiTemperatureHttp().then((result) => {
        const temperature = JSON.parse(result).temperature;
        document.getElementById("rpiCurrent").innerText += temperature;
    });
    getAwrTemperatureHttp().then((result) => {
        const temperature = JSON.parse(result).temperature;
        document.getElementById("awrCurrent").innerText += temperature;
    });
};
function getRpiTemperatureLogHttp() {
    return getHttpTemplate("external/getRpiTemperatureLog");
}
function getAwrTemperatureLogHttp() {
    return getHttpTemplate("external/getAwrTemperatureLog");
}
function getRpiTemperatureHttp() {
    return getHttpTemplate("external/getRpiTemperature");
}
function getAwrTemperatureHttp() {
    return getHttpTemplate("external/getAwrTemperature");
}
function getHttpTemplate(pathMethod) {
    const promise = new Promise((resolve, reject) => {
        const url = `${protocol}//${hostname}:${port}/${pathMethod}`;

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
    return promise;
}
function parseTemperatureLog(log) {
    const lines = log.split("\n");
    const maxSpaces = lines[0].split(" ");
    const maxTemperature = maxSpaces[maxSpaces.length - 1];
    const minSpaces = lines[1].split(" ");
    const minTemperature = minSpaces[minSpaces.length - 1];
    const temperatures = [];
    const times = [];
    for (let i = 3; i < lines.length; ++i) {
        const spaces = lines[i].split(" ");
        const colons = lines[i].split(":");
        temperatures.push(spaces[spaces.length - 1]);
        times.push(colons[0]);
    }
    return {
        temperatures: temperatures
            .map((temperature) => parseFloat(temperature))
            .reverse(),
        times: times.reverse(),
        maxTemperature: maxTemperature,
        minTemperature: minTemperature,
    };
}
