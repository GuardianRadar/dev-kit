window.onload = async function () {
    try {
        const version = await getVersionHttp();
        $("aboutPage")!.innerHTML = version
    } catch (e) {
        alert(e);
    }
}