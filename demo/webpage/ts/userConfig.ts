
window.onload = async function () {
    try {
        const trackConfigDefault = await getTrackConfigDefaultHttp();
        const trackConfigUser = await getTrackConfigUserHttp();

        assignPlaceholders(trackConfigDefault);
        assignValues(trackConfigUser);
    } catch (e) {
        alert(e);
    }

    $("saveButton")!.onclick = function (e) {
        let trackConfigNew: RecursivePartial<TrackConfig> = {};
        const clusteringConfigNew: Partial<ClusteringConfig> = {};
        const trackingConfigNew: Partial<TrackingConfig> = {};
        let value;
        value = getNumberFromInput($("input-clustering-associateDistance") as HTMLInputElement);
        if (value !== undefined) {
            clusteringConfigNew.associateDistance = value;
        }
        value = getNumberFromInput($("input-tracking-associateDistance") as HTMLInputElement);
        if (value !== undefined) {
            trackingConfigNew.associateDistance = value;
        }
        value = getNumberFromInput($("input-tracking-maxAge") as HTMLInputElement);
        if (value !== undefined) {
            trackingConfigNew.maxAge = value;
        }
        value = getNumberFromInput($("input-tracking-maxCount") as HTMLInputElement);
        if (value !== undefined) {
            trackingConfigNew.maxCount = value;
        }
        value = getNumberFromInput($("input-tracking-clusterWeight") as HTMLInputElement);
        if (value !== undefined) {
            trackingConfigNew.clusterWeight = value;
        }
        value = getNumberFromInput($("input-tracking-minimumTicks") as HTMLInputElement);
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
    }
};

function assignPlaceholders(trackConfig: TrackConfig) {
    ($("input-clustering-associateDistance") as HTMLInputElement).placeholder = String(trackConfig["clustering"]["associateDistance"]);
    ($("input-tracking-associateDistance") as HTMLInputElement).placeholder = String(trackConfig["tracking"]["associateDistance"]);
    ($("input-tracking-maxAge") as HTMLInputElement).placeholder = String(trackConfig["tracking"]["maxAge"]);
    ($("input-tracking-maxCount") as HTMLInputElement).placeholder = String(trackConfig["tracking"]["maxCount"]);
    ($("input-tracking-clusterWeight") as HTMLInputElement).placeholder = String(trackConfig["tracking"]["clusterWeight"]);
    ($("input-tracking-minimumTicks") as HTMLInputElement).placeholder = String(trackConfig["tracking"]["minimumTicks"]);
}
function assignValues(trackConfig: RecursivePartial<TrackConfig>) {
    if (trackConfig["clustering"] !== undefined) {
        ($("input-clustering-associateDistance") as HTMLInputElement).value = String(trackConfig["clustering"]["associateDistance"]);
    }
    if (trackConfig["tracking"] !== undefined) {
        ($("input-tracking-associateDistance") as HTMLInputElement).value = String(trackConfig["tracking"]["associateDistance"]);
        ($("input-tracking-maxAge") as HTMLInputElement).value = String(trackConfig["tracking"]["maxAge"]);
        ($("input-tracking-maxCount") as HTMLInputElement).value = String(trackConfig["tracking"]["maxCount"]);
        ($("input-tracking-clusterWeight") as HTMLInputElement).value = String(trackConfig["tracking"]["clusterWeight"]);
        ($("input-tracking-minimumTicks") as HTMLInputElement).value = String(trackConfig["tracking"]["minimumTicks"]);
    }
}