/**
 * return @type {HTMLElement}
 */
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