const routes = {
    trackConfig: {
        url: "content/userConfig.html",
        cache: true,
    },
    radar: {
        url: "content/radar.html",
        cache: true,
    },
    radarConfig: {
        url: "content/radarConfig.html",
        cache: true,
    }
};
let iframe;
window.onload = async function () {
    iframe = document.getElementById("iframe");
    console.log("current:", window.location.hash);
    navigateToHash(window.location.hash);
};
window.onhashchange = async function () {
    console.log(window.location.hash);
    navigateToHash(window.location.hash);
};
async function navigateToHash(hash) {
    if (hash === "")
        hash = "radar";
    if (hash[0] === "#")
        hash = hash.substring(1, hash.length);
    let url = routes[hash].url;
    iframe.src = url;
}
