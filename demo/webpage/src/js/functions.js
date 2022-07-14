"use strict";
function $(id) {
    return document.getElementById(id);
}
function toggleVisible(element, visible = undefined) {
    const condition = visible ?? element.style.display === 'none';
    element.style.display = condition ? "" : "none";
}
function enable(element) {
    element.disabled = false;
}
function disable(element) {
    element.disabled = true;
}
function getNumberFromInput(htmlInput) {
    const numberType = htmlInput.dataset.type;
    const valueRaw = htmlInput.value;
    let valueParsed;
    if (numberType === "int") {
        valueParsed = parseInt(valueRaw);
    }
    if (numberType === "float") {
        valueParsed = parseFloat(valueRaw);
    }
    if (valueParsed === undefined) {
        return undefined;
    }
    if (isNaN(valueParsed)) {
        return undefined;
    }
    return valueParsed;
}
