/**
 * return @type {HTMLElement}
 */
 function $(id: string) {
    return document.getElementById(id);
}
function toggleVisible(element: HTMLElement, visible = undefined) {
    const condition = visible ?? element.style.display === 'none';
    element.style.display = condition ? "" : "none";
}
function enable(element: HTMLInputElement) {
    element.disabled = false;
}
function disable(element: HTMLInputElement) {
    element.disabled = true;
}
function getNumberFromInput(htmlInput: HTMLInputElement): number | undefined {
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