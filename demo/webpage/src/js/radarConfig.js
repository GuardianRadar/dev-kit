"use strict";
let radarConfigDefault;
let radarConfigUser;
window.onload = async function () {
    try {
        radarConfigDefault = await getRadarConfigDefaultHttp();
        radarConfigUser = await getRadarConfigUserHttp();
        updatePage(radarConfigDefault, radarConfigUser);
    }
    catch (e) {
        alert(e);
    }
    $("saveConfig").onclick = () => {
        const newUserConfig = updateUserConfig(radarConfigDefault);
        console.log(newUserConfig);
        postRadarConfigUserHttp(newUserConfig);
    };
    $("resetConfig").onclick = () => {
        postRadarConfigUserHttp({});
        updatePage(radarConfigDefault, radarConfigDefault);
    };
};
function updatePage(defaultConfig, userConfig) {
    const inputNumberElements = $('radarConfigPage').querySelectorAll('input[type=number]');
    inputNumberElements.forEach(element => {
        const field = element.dataset.field;
        const subfield = element.dataset.subField;
        if (field !== undefined && subfield !== undefined) {
            if (field in defaultConfig) {
                const value = defaultConfig[field];
                if (subfield in value) {
                    const subvalue = value[subfield];
                    element.value = subvalue;
                }
            }
        }
    });
    const selectElements = $('radarConfigPage').querySelectorAll('select');
    selectElements.forEach(element => {
        const field = element.dataset.field;
        const subField = element.dataset.subField;
        if (field !== undefined && subField !== undefined) {
            if (field in defaultConfig) {
                defaultConfig[field];
                defaultConfig[field];
                if (subField in defaultConfig[field]) {
                }
            }
            element.value = userConfig?.[field]?.[subField] ?? defaultConfig[field][subField];
        }
    });
    const inputCheckboxElements = $('radarConfigPage').querySelectorAll('input[type=checkbox]');
    inputCheckboxElements.forEach(element => {
        const field = element.dataset.field;
        const subField = element.dataset.subField;
        if (field !== undefined && subField !== undefined) {
            element.checked = userConfig?.[field]?.[subField] ?? defaultConfig[field][subField];
        }
    });
    $('input-ProfileCfg-RxGain').oninput = (event) => {
        const rxGain = getNumberFromInput(event.target);
        const ifGain = rxGain & 0b111111;
        const rfGain = (rxGain >> 6) & 0b11;
        $('input-ProfileCfg-IfGain').value = String(ifGain);
        $('input-ProfileCfg-RfGain').value = String(rfGain);
    };
    $('input-ProfileCfg-IfGain').value = (userConfig?.profileCfg?.rxGain ?? defaultConfig.profileCfg.rxGain) &
        0b111111;
    $('input-ProfileCfg-IfGain').onchange = (event) => {
        const ifGain = getNumberFromInput(event.target);
        const rfGain = $('input-ProfileCfg-RfGain').value;
        const rxGain = (rfGain << 6) | (ifGain & 0b111111);
        if ($('input-ProfileCfg-RxGain').value !== rxGain) {
            $('input-ProfileCfg-RxGain').value = rxGain;
        }
    };
    $('input-ProfileCfg-RfGain').value = ((userConfig?.profileCfg?.rxGain ?? defaultConfig.profileCfg.rxGain) >> 6) & 0b11;
    $('input-ProfileCfg-RfGain').onchange = (event) => {
        const rfGain = getNumberFromInput(event.target);
        const ifGain = $('input-ProfileCfg-IfGain').value;
        const rxGain = (rfGain << 6) | (ifGain & 0b111111);
        if ($('input-ProfileCfg-RxGain').value !== rxGain) {
            $('input-ProfileCfg-RxGain').value = rxGain;
        }
    };
    $('input-CfarCfgRange-ThresholdScale').oninput = (event) => {
        const threshold = getNumberFromInput(event.target);
        const thresholdDb = threshold / 256 / 8 * 6;
        if ($('input-CfarCfgRange-ThresholdScale-dB').value != thresholdDb) {
            $('input-CfarCfgRange-ThresholdScale-dB').value = thresholdDb;
        }
    };
    $('input-CfarCfgRange-ThresholdScale-dB').value = (userConfig?.cfarCfgRange?.thresholdScale ?? defaultConfig.cfarCfgRange.thresholdScale) / 256 / 8 * 6;
    $('input-CfarCfgRange-ThresholdScale-dB').oninput = (event) => {
        const thresholdDb = getNumberFromInput(event.target);
        const threshold = thresholdDb * 256 * 8 / 6;
        if ($('input-CfarCfgRange-ThresholdScale').value != threshold) {
            $('input-CfarCfgRange-ThresholdScale').value = threshold;
        }
    };
    $('input-CfarCfgDoppler-ThresholdScale').oninput = (event) => {
        const threshold = getNumberFromInput(event.target);
        const thresholdDb = threshold / 256 / 8 * 6;
        if (getNumberFromInput($('input-CfarCfgDoppler-ThresholdScale-dB')) != thresholdDb) {
            $('input-CfarCfgDoppler-ThresholdScale-dB').value = thresholdDb;
        }
    };
    $('input-CfarCfgDoppler-ThresholdScale-dB').value = (userConfig?.cfarCfgDoppler?.thresholdScale ?? defaultConfig.cfarCfgDoppler.thresholdScale) / 256 / 8 * 6;
    $('input-CfarCfgDoppler-ThresholdScale-dB').oninput = (event) => {
        const thresholdDb = getNumberFromInput(event.target);
        const threshold = thresholdDb * 256 * 8 / 6;
        if ($('input-CfarCfgDoppler-ThresholdScale').value != threshold) {
            $('input-CfarCfgDoppler-ThresholdScale').value = threshold;
        }
    };
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
                    userConfig[field][subField] = val;
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
                    userConfig[field][subField] = val;
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
                userConfig[field][subField] = val;
            }
        }
    });
    return userConfig;
}
