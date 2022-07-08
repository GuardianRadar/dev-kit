window.onload = async function () {
    try {
        const trackConfigDefault = await getTrackConfigDefaultHttp();
        const trackConfigUser = await getTrackConfigUserHttp();
        assignPlaceholders(trackConfigDefault);
        assignValues(trackConfigUser);
    }
    catch (e) {
        alert(e);
    }
    $("saveButton").onclick = function (e) {
        let trackConfigNew = {
            clustering: {},
            tracking: {}
        };
        let value;
        value = coaless($("input-clustering-associateDistance").value, true);
        if (value !== undefined) {
            trackConfigNew.clustering.associateDistance = value;
        }
        value = coaless($("input-tracking-associateDistance").value, true);
        if (value !== undefined) {
            trackConfigNew.tracking.associateDistance = value;
        }
        value = coaless($("input-tracking-maxAge").value, false);
        if (value !== undefined) {
            trackConfigNew.tracking.maxAge = value;
        }
        value = coaless($("input-tracking-maxCount").value, false);
        if (value !== undefined) {
            trackConfigNew.tracking.maxCount = value;
        }
        value = coaless($("input-tracking-clusterWeight").value, true);
        if (value !== undefined) {
            trackConfigNew.tracking.clusterWeight = value;
        }
        value = coaless($("input-tracking-minimumTicks").value, false);
        if (value !== undefined) {
            trackConfigNew.tracking.minimumTicks = value;
        }
        console.log(trackConfigNew);
        if (Object.keys(trackConfigNew.clustering).length === 0) {
            delete trackConfigNew.clustering;
        }
        if (Object.keys(trackConfigNew.tracking).length === 0) {
            delete trackConfigNew.tracking;
        }
        postTrackConfigUserHttp(trackConfigNew);
    };
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
        return float;
    }
    else {
        const int = parseInt(value);
        if (isNaN(int)) {
            return undefined;
        }
        return int;
    }
}
function assignPlaceholders(trackConfig) {
    $("input-clustering-associateDistance").placeholder = trackConfig["clustering"]["associateDistance"];
    $("input-tracking-associateDistance").placeholder = trackConfig["tracking"]["associateDistance"];
    $("input-tracking-maxAge").placeholder = trackConfig["tracking"]["maxAge"];
    $("input-tracking-maxCount").placeholder = trackConfig["tracking"]["maxCount"];
    $("input-tracking-clusterWeight").placeholder = trackConfig["tracking"]["clusterWeight"];
    $("input-tracking-minimumTicks").placeholder = trackConfig["tracking"]["minimumTicks"];
}
function assignValues(trackConfig) {
    if (trackConfig["clustering"] !== undefined) {
        $("input-clustering-associateDistance").value = trackConfig["clustering"]["associateDistance"] ?? "";
    }
    if (trackConfig["tracking"] !== undefined) {
        $("input-tracking-associateDistance").value = trackConfig["tracking"]["associateDistance"] ?? "";
        $("input-tracking-maxAge").value = trackConfig["tracking"]["maxAge"] ?? "";
        $("input-tracking-maxCount").value = trackConfig["tracking"]["maxCount"] ?? "";
        $("input-tracking-clusterWeight").value = trackConfig["tracking"]["clusterWeight"] ?? "";
        $("input-tracking-minimumTicks").value = trackConfig["tracking"]["minimumTicks"] ?? "";
    }
}
