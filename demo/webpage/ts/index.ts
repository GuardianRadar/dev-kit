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
type Routes = keyof typeof routes;

let iframe: HTMLIFrameElement;

window.onload = async function () {
    iframe = document.getElementById("iframe") as HTMLIFrameElement;
    console.log("current:", window.location.hash);
    navigateToGenericHash(window.location.hash);
};

window.onhashchange = async function () {
    console.log(window.location.hash);
    navigateToGenericHash(window.location.hash);
};
function navigateToGenericHash(hash: string) {
    if (hash === "") hash = 'radar';
    if (hash[0] === "#") hash = hash.substring(1, hash.length);
    if (Object.keys(routes).includes(hash)) {
        navigateToHash(hash as Routes);
    }
}
function navigateToHash(hash: Routes) {
    let url = routes[hash].url;
    iframe.src = url;
}