
function $(id) {
    return document.getElementById(id);
}
const protocol = location.protocol;
const hostname = location.hostname;
const port = location.port;
let defaultRadarConfig;
let userRadarConfig;

const init = async function () {
    checkboxes = document.querySelectorAll("input[type='checkbox']");

    const defaultRadarConfigJson = await getDefaultRadarConfigHttp();
    const userRadarConfigJson = await getUserRadarConfigHttp();
    try {
        defaultRadarConfig = JSON.parse(defaultRadarConfigJson);
        userRadarConfig = JSON.parse(userRadarConfigJson);
        console.log(defaultRadarConfig);
        console.log(userRadarConfig);
        buildDom(defaultRadarConfig, userRadarConfig);
        updateDom(userRadarConfig);
        $("saveConfig").onclick = () => {
            setUserRadarConfigHttp(userRadarConfig);
        };
    } catch (e) {
        alert(e);
    }
};
init();

function buildDom(defaultRadarConfig, userRadarConfig) {
    const div = $("radarConfigPage");

    const sectionUnsorted = document.createElement("section");
    div.appendChild(sectionUnsorted);
    Object.keys(defaultRadarConfig).forEach((field) => {
        const section = document.createElement("section");
        div.appendChild(section);
        if (typeof defaultRadarConfig[field] === "object") {
            const heading = document.createElement("h3");
            heading.innerText = field;
            section.appendChild(heading);
            Object.keys(defaultRadarConfig[field]).forEach((subfield) => {
                appendField(
                    section,
                    subfield,
                    defaultRadarConfig[field][subfield],
                    `${field}-${subfield}`
                );
                $(`input-${field}-${subfield}`).onchange = (e) => {
                    let value;
                    if (e.target.type === "number") {
                        value = parseFloat(e.target.value);
                    } else if (e.target.type == "checkbox") {
                        value = e.target.checked;
                    }
                    if (userRadarConfig[field] == undefined) {
                        userRadarConfig[field] = {};
                    }
                    userRadarConfig[field][subfield] = value;
                    if (defaultRadarConfig[field][subfield] === value) {
                        $(`label-${field}-${subfield}`).style.fontWeight = "";
                    } else {
                        $(`label-${field}-${subfield}`).style.fontWeight = "bold";
                    }
                };
            });
        } else {
            appendField(
                sectionUnsorted,
                field,
                defaultRadarConfig[field],
                `${field}`
            );
            $(`input-${field}`).onchange = (e) => {
                let value;
                if (e.target.type === "number") {
                    value = parseFloat(e.target.value);
                } else if (e.target.type == "checkbox") {
                    value = e.target.checked;
                }
                if (userConfig[field] == undefined) {
                    userConfig[field] = {};
                }
                userRadarConfig[field] = value;
                if (defaultRadarConfig[field] === value) {
                    $(`label-${field}`).style.fontWeight = "";
                } else {
                    $(`label-${field}`).style.fontWeight = "bold";
                }
            };
        }
    });
}
function updateDom(radarConfig) {
    for (field in radarConfig) {
        if (typeof radarConfig[field] === "object") {
            for (subfield in radarConfig[field]) {
                updateField(`${field}-${subfield}`, radarConfig[field][subfield]);
                if (defaultRadarConfig[field][subfield] === radarConfig[field][subfield]) {
                    $(`label-${field}-${subfield}`).style.fontWeight = "";
                } else {
                    $(`label-${field}-${subfield}`).style.fontWeight = "bold";
                }
            }
        } else {
            updateField(`${field}`, radarConfig[field]);
            if (defaultRadarConfig[field] === radarConfig[field]) {
                $(`label-${field}`).style.fontWeight = "";
            } else {
                $(`label-${field}`).style.fontWeight = "bold";
            }
        }
    }
}
function updateField(id, value) {
    $(`input-${id}`).value = value;
}
function appendField(parent, field, value, id) {
    const label = document.createElement("label");
    label.innerText = `${field}:`;
    label.id = `label-${id}`;
    parent.appendChild(label);
    const input = document.createElement("input");
    input.id = `input-${id}`;
    if (typeof value == "boolean") {
        input.type = "checkbox";
        input.checked = value;
    } else {
        input.type = "number";
        input.value = value;
    }
    parent.appendChild(input);
    const br = document.createElement("br");
    parent.appendChild(br);
}

function getDefaultRadarConfigHttp() {
    const promise = new Promise((resolve, reject) => {
        const url = `${protocol}//${hostname}:${port}/external/getDefaultRadarConfig`;
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
function getUserRadarConfigHttp() {
    const promise = new Promise((resolve, reject) => {
        const url = `${protocol}//${hostname}:${port}/external/getUserRadarConfig`;
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
function setUserRadarConfigHttp(userRadarConfig) {
    const promise = new Promise((resolve, reject) => {
        const url = `${protocol}//${hostname}:${port}/external/setUserRadarConfig`;
        const body = JSON.stringify(userRadarConfig);
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
    return promise;
}
