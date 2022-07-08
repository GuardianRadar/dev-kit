
window.onload = async function () {
    try {
        const trackConfigDefault = await getTrackConfigDefaultHttp();
        const trackConfigUser = await getTrackConfigUserHttp();

        assignPlaceholders(trackConfigDefault);
        assignValues(trackConfigUser);
    } catch (e) {
        alert(e);
    }

    $("saveButton").onclick = function (e) {
        let trackConfigNew: TrackConfig = {
            clustering: {},
            tracking: {}
        }
        let value;
        value = coaless(($("input-clustering-associateDistance") as HTMLInputElement).value, true);
        if (value !== undefined) {
            trackConfigNew.clustering.associateDistance = value;
        }
        value = coaless(($("input-tracking-associateDistance") as HTMLInputElement).value, true);
        if (value !== undefined) {
            trackConfigNew.tracking.associateDistance = value;
        }
        value = coaless(($("input-tracking-maxAge") as HTMLInputElement).value, false);
        if (value !== undefined) {
            trackConfigNew.tracking.maxAge = value;
        }
        value = coaless(($("input-tracking-maxCount") as HTMLInputElement).value, false);
        if (value !== undefined) {
            trackConfigNew.tracking.maxCount = value;
        }
        value = coaless(($("input-tracking-clusterWeight") as HTMLInputElement).value, true);
        if (value !== undefined) {
            trackConfigNew.tracking.clusterWeight = value;
        }
        value = coaless(($("input-tracking-minimumTicks") as HTMLInputElement).value, false);
        if (value !== undefined) {
            trackConfigNew.tracking.minimumTicks = value;
        }

        console.log(trackConfigNew);
        if (Object.keys(trackConfigNew.clustering).length === 0) {
            delete trackConfigNew.clustering
        }
        if (Object.keys(trackConfigNew.tracking).length === 0) {
            delete trackConfigNew.tracking
        }

        postTrackConfigUserHttp(trackConfigNew);
    }
};

function coaless(value, isFloat) {
    if (value === "") {
        return undefined;
    }

    if (isFloat) {
        const float = parseFloat(value);
        if (isNaN(float)) {
            return undefined;
        }
        return float
    } else {
        const int = parseInt(value);
        if (isNaN(int)) {
            return undefined;
        }
        return int
    }

}

function assignPlaceholders(trackConfig) {
    ($("input-clustering-associateDistance") as HTMLInputElement).placeholder = trackConfig["clustering"]["associateDistance"];
    ($("input-tracking-associateDistance") as HTMLInputElement).placeholder = trackConfig["tracking"]["associateDistance"];
    ($("input-tracking-maxAge") as HTMLInputElement).placeholder = trackConfig["tracking"]["maxAge"];
    ($("input-tracking-maxCount") as HTMLInputElement).placeholder = trackConfig["tracking"]["maxCount"];
    ($("input-tracking-clusterWeight") as HTMLInputElement).placeholder = trackConfig["tracking"]["clusterWeight"];
    ($("input-tracking-minimumTicks") as HTMLInputElement).placeholder = trackConfig["tracking"]["minimumTicks"];
}
function assignValues(trackConfig) {
    if (trackConfig["clustering"] !== undefined) {
        ($("input-clustering-associateDistance") as HTMLInputElement).value = trackConfig["clustering"]["associateDistance"] ?? "";
    }
    if (trackConfig["tracking"] !== undefined) {
        ($("input-tracking-associateDistance") as HTMLInputElement).value = trackConfig["tracking"]["associateDistance"] ?? "";
        ($("input-tracking-maxAge") as HTMLInputElement).value = trackConfig["tracking"]["maxAge"] ?? "";
        ($("input-tracking-maxCount") as HTMLInputElement).value = trackConfig["tracking"]["maxCount"] ?? "";
        ($("input-tracking-clusterWeight") as HTMLInputElement).value = trackConfig["tracking"]["clusterWeight"] ?? "";
        ($("input-tracking-minimumTicks") as HTMLInputElement).value = trackConfig["tracking"]["minimumTicks"] ?? "";
    }
}