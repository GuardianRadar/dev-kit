
function $(id) {
    return document.getElementById(id);
}
const protocol = location.protocol;
const hostname = location.hostname;
const port = location.port;
let radarConfigDefault;
let userRadarConfig;

window.onload = async function () {
    const radarConfigDefaultJson = await getRadarConfigDefaultHttp();
    const radarConfigUserJson = await getRadarConfigUserHttp();
    $('input-ProfileCfg-IdleTime').oninput = (e) => {
        $('span-ProfileCfg-IdleTime').innerText = `${e.target.value} usec`;
    };
    try {
        radarConfigDefault = JSON.parse(radarConfigDefaultJson);
        const radarConfigUser = JSON.parse(radarConfigUserJson);

        updatePage(radarConfigDefault, radarConfigUser);

    } catch (e) {
        alert(e);
    }

    $("saveConfig").onclick = () => {
        const newUserConfig = updateUserConfig(radarConfigDefault);
        console.log(newUserConfig);
        postRadarConfigUserHttp(newUserConfig);
    };

    $("resetToDefaults").onclick = () => {
        resetRadarConfigDefaultsUserHttp()
        location.reload();
    };
}

function updatePage(defaultConfig, userConfig) {
    const inputNumberElements = $('radarConfigPage').querySelectorAll('input[type=number]');
    inputNumberElements.forEach(element => {
        const field = element.dataset.field;
        const subField = element.dataset.subField;
        if (field !== undefined && subField !== undefined) {
            element.value = userConfig?.[field]?.[subField] ?? defaultConfig[field][subField]
        }
    });

    const selectElements = $('radarConfigPage').querySelectorAll('select');
    selectElements.forEach(element => {
        const field = element.dataset.field;
        const subField = element.dataset.subField;
        if (field !== undefined && subField !== undefined) {
            element.value = userConfig?.[field]?.[subField] ?? defaultConfig[field][subField]
        }
    });

    const inputCheckboxElements = $('radarConfigPage').querySelectorAll('input[type=checkbox]');
    inputCheckboxElements.forEach(element => {
        const field = element.dataset.field;
        const subField = element.dataset.subField;
        if (field !== undefined && subField !== undefined) {
            element.checked = userConfig?.[field]?.[subField] ?? defaultConfig[field][subField]
        }
    });

    //extra helper inputs
    $('input-ProfileCfg-RxGain').oninput = (event) => {
        const rxGain = event.target.value;
        const ifGain = rxGain & 0b111111;
        const rfGain = (rxGain >> 6) & 0b11;
        if ($('input-ProfileCfg-IfGain').value !== ifGain) {
            $('input-ProfileCfg-IfGain').value = ifGain;
        }
        if ($('input-ProfileCfg-RfGain').value !== rfGain) {
            $('input-ProfileCfg-RfGain').value = rfGain
        }
    }
    $('input-ProfileCfg-IfGain').value = (userConfig?.profileCfg?.rxGain ?? defaultConfig.profileCfg.rxGain) &
        0b111111;
    $('input-ProfileCfg-IfGain').onchange = (event) => {
        const ifGain = event.target.value;
        const rfGain = $('input-ProfileCfg-RfGain').value;
        const rxGain = (rfGain << 6) | (ifGain & 0b111111);
        if ($('input-ProfileCfg-RxGain').value !== rxGain) {
            $('input-ProfileCfg-RxGain').value = rxGain;
        }
    }
    $('input-ProfileCfg-RfGain').value = ((userConfig?.profileCfg?.rxGain ?? defaultConfig.profileCfg.rxGain) >> 6) & 0b11;
    $('input-ProfileCfg-RfGain').onchange = (event) => {
        const rfGain = event.target.value;
        const ifGain = $('input-ProfileCfg-IfGain').value;
        const rxGain = (rfGain << 6) | (ifGain & 0b111111);
        if ($('input-ProfileCfg-RxGain').value !== rxGain) {
            $('input-ProfileCfg-RxGain').value = rxGain;
        }
    }

    $('input-CfarCfgRange-ThresholdScale').oninput = (event) => {
        const threshold = event.target.value;
        const thresholdDb = threshold / 256 / 8 * 6;
        if ($('input-CfarCfgRange-ThresholdScale-dB').value != thresholdDb) {
            $('input-CfarCfgRange-ThresholdScale-dB').value = thresholdDb;
        }
    }
    $('input-CfarCfgRange-ThresholdScale-dB').value = (userConfig?.cfarCfgRange?.thresholdScale ?? defaultConfig.cfarCfgRange.thresholdScale) / 256 / 8 * 6;
    $('input-CfarCfgRange-ThresholdScale-dB').oninput = (event) => {
        const thresholdDb = event.target.value;
        const threshold = thresholdDb * 256 * 8 / 6;
        if ($('input-CfarCfgRange-ThresholdScale').value != threshold) {
            $('input-CfarCfgRange-ThresholdScale').value = threshold;
        }
    }
    $('input-CfarCfgDoppler-ThresholdScale').oninput = (event) => {
        const threshold = event.target.value;
        const thresholdDb = threshold / 256 / 8 * 6;
        if ($('input-CfarCfgDoppler-ThresholdScale-dB').value != thresholdDb) {
            $('input-CfarCfgDoppler-ThresholdScale-dB').value = thresholdDb;
        }
    }
    $('input-CfarCfgDoppler-ThresholdScale-dB').value = (userConfig?.cfarCfgDoppler?.thresholdScale ?? defaultConfig.cfarCfgDoppler.thresholdScale) / 256 / 8 * 6;
    $('input-CfarCfgDoppler-ThresholdScale-dB').oninput = (event) => {
        const thresholdDb = event.target.value;
        const threshold = thresholdDb * 256 * 8 / 6;
        if ($('input-CfarCfgDoppler-ThresholdScale').value != threshold) {
            $('input-CfarCfgDoppler-ThresholdScale').value = threshold;
        }
    }
}

function updateUserConfig(defaultConfig) {
    const userConfig = {};

    const inputNumberElements = $('radarConfigPage').querySelectorAll('input[type=number]');
    inputNumberElements.forEach(element => {
        const field = element.dataset.field;
        const subField = element.dataset.subField;
        const type = element.dataset.type;
        if (field !== undefined && subField !== undefined) {
            const val = type === "int" ? parseInt(element.value) : parseFloat(element.value);
            if (!isNaN(val)) {
                if (defaultConfig[field][subField] !== val) {
                    userConfig[field] ??= {};
                    userConfig[field][subField] = val
                }
            }
        }
    });

    const selectElements = $('radarConfigPage').querySelectorAll('select');
    selectElements.forEach(element => {
        const field = element.dataset.field;
        const subField = element.dataset.subField;
        const type = element.dataset.type;
        if (field !== undefined && subField !== undefined) {
            const val = type === "int" ? parseInt(element.value) : parseFloat(element.value);
            if (!isNaN(val)) {
                if (defaultConfig[field][subField] !== val) {
                    userConfig[field] ??= {};
                    userConfig[field][subField] = val
                }
            }
        }
    });

    const inputCheckboxElements = $('radarConfigPage').querySelectorAll('input[type=checkbox]');
    inputCheckboxElements.forEach(element => {
        const field = element.dataset.field;
        const subField = element.dataset.subField;
        if (field !== undefined && subField !== undefined) {
            const val = element.checked ? 1 : 0;
            if (defaultConfig[field][subField] !== val) {
                userConfig[field] ??= {};
                userConfig[field][subField] = val
            }
        }
    });

    return userConfig;
}


function getRadarConfigDefaultHttp() {
    const promise = new Promise((resolve, reject) => {
        const url = `${protocol}//${hostname}:${port}/api/radarConfigDefault`;
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
function getRadarConfigUserHttp() {
    const promise = new Promise((resolve, reject) => {
        const url = `${protocol}//${hostname}:${port}/api/radarConfigUser`;
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
function postRadarConfigUserHttp(radarConfig) {
    const promise = new Promise((resolve, reject) => {
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
    return promise;
}


function resetRadarConfigDefaultsUserHttp() {
    const promise = new Promise((resolve, reject) => {
        const url = `${protocol}//${hostname}:${port}/api/resetRadarConfigDefaults`;
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