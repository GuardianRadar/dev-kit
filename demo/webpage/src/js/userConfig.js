"use strict";
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
        let trackConfigNew = {};
        const clusteringConfigNew = {};
        const trackingConfigNew = {};
        let value;
        value = getNumberFromInput($("input-clustering-associateDistance"));
        if (value !== undefined) {
            clusteringConfigNew.associateDistance = value;
        }
        value = getNumberFromInput($("input-tracking-associateDistance"));
        if (value !== undefined) {
            trackingConfigNew.associateDistance = value;
        }
        value = getNumberFromInput($("input-tracking-maxAge"));
        if (value !== undefined) {
            trackingConfigNew.maxAge = value;
        }
        value = getNumberFromInput($("input-tracking-maxCount"));
        if (value !== undefined) {
            trackingConfigNew.maxCount = value;
        }
        value = getNumberFromInput($("input-tracking-clusterWeight"));
        if (value !== undefined) {
            trackingConfigNew.clusterWeight = value;
        }
        value = getNumberFromInput($("input-tracking-minimumTicks"));
        if (value !== undefined) {
            trackingConfigNew.minimumTicks = value;
        }
        if (Object.keys(clusteringConfigNew).length === 0) {
            trackConfigNew.clustering = clusteringConfigNew;
        }
        if (Object.keys(trackingConfigNew).length === 0) {
            trackConfigNew.tracking = trackingConfigNew;
        }
        postTrackConfigUserHttp(trackConfigNew);
    };
};
function assignPlaceholders(trackConfig) {
    $("input-clustering-associateDistance").placeholder = String(trackConfig["clustering"]["associateDistance"]);
    $("input-tracking-associateDistance").placeholder = String(trackConfig["tracking"]["associateDistance"]);
    $("input-tracking-maxAge").placeholder = String(trackConfig["tracking"]["maxAge"]);
    $("input-tracking-maxCount").placeholder = String(trackConfig["tracking"]["maxCount"]);
    $("input-tracking-clusterWeight").placeholder = String(trackConfig["tracking"]["clusterWeight"]);
    $("input-tracking-minimumTicks").placeholder = String(trackConfig["tracking"]["minimumTicks"]);
}
function assignValues(trackConfig) {
    if (trackConfig["clustering"] !== undefined) {
        $("input-clustering-associateDistance").value = String(trackConfig["clustering"]["associateDistance"]);
    }
    if (trackConfig["tracking"] !== undefined) {
        $("input-tracking-associateDistance").value = String(trackConfig["tracking"]["associateDistance"]);
        $("input-tracking-maxAge").value = String(trackConfig["tracking"]["maxAge"]);
        $("input-tracking-maxCount").value = String(trackConfig["tracking"]["maxCount"]);
        $("input-tracking-clusterWeight").value = String(trackConfig["tracking"]["clusterWeight"]);
        $("input-tracking-minimumTicks").value = String(trackConfig["tracking"]["minimumTicks"]);
    }
}
