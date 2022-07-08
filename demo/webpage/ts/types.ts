//helpers
type Vector2 = {
    x: number;
    y: number;
}
type Vec2 = Vector2;

//radar parameters
type MapProperties = {
    maxRange: number;
    m_per_px: number;
    px_per_m: number;
    width: number;
    height: number;
    mousePosition: Vec2;
}
type RadarProperties = {
    rangeBinCount: number;
    rangeResolution: number;
    dopplerBinCount: number;
    dopplerResolution: number;
}

//websocket payload
type RadarOutputs = {
    detections: Detection[];
    clusters: Detection[];
    tracks: Track[];
}
type Detection = {
    id: number;
    position: Vector2;
    velocity: Vector2;
    rangeSNRdB: number;
    dopplerSNRdB: number;
};
type Cluster = {
    id: number;
    detectionIds: number;
    position: Vector2;
    velocity: Vector2;
    width: number;
    height: number;
}
type Track = {
    id: number;
    clusterId: number;
    position: Vector2;
    velocity: Vector2;
    age: number;
};

//tracking config
type TrackConfig = {
    clustering: ClusteringConfig;
    tracking: TrackingConfig;
}
type ClusteringConfig = {
    associateDistance: number;
}
type TrackingConfig = {
    associateDistance: number;
    maxAge: number;
    maxCount: number;
    clusterWeight: number;
    minimumTicks: number;
}

//radar config
type RadarConfig = {
	channelCfg:             ChannelCfg;
	profileCfg:             ProfileCfg;
	chirpCfg:               ChirpCfg;
	bpmCfg:                 BpmCfg;
	frameCfg:               FrameCfg;
	guiMonitor:             GuiMonitor;
	cfarCfgRange:           CfarCfg;
	cfarCfgDoppler:         CfarCfg;
	peakGrouping:           PeakGrouping;
	multiObjectBeamForming: MultiObjectBeamForming;
	calibrateDcRangeSignal: CalibrateDcRangeSignal;
	extendedMaxVelocity:    ExtendedMaxVelocity;
	clutterRemoval:         ClutterRemoval;
}
type ChannelCfg = {
	rxChannelEnable: number;
	txChannelEnable: number;
}
type ProfileCfg = {
	startFrequency: number;
	idleTime: number;
	adcStartTime: number;
	rampEndTime: number;
	frequencySlope: number;
	txStartTime: number;
	numberOfAdcSamples: number;
	sampleRate: number;
	hpfCornerFrequency1: number;
	hpfCornerFrequency2: number;
	rxGain: number;
}
type ChirpCfg = {
	chirpStartIndex: number;
	chirpEndIndex: number;
	txAntennaEnableMask: number;
}
type BpmCfg = {
	enabled: number;
	chirp0Index: number;
	chirp1Index: number;
}
type FrameCfg = {
	chirpStartIndex: number;
	chirpEndIndex: number;
	numberOfLoops: number;
	numberOfFrames: number;
	framePeriodicity: number;
	frameTriggerDelay: number;
}
type GuiMonitor = {
	detectedObject: number;
	rangeDopplerMap: number;
	statisticsInfo: number;
}
type CfarCfg = {
	noiseWindow: number;
	guardLength: number;
	divideShift: number;
	thresholdScale: number;
}
type PeakGrouping = {
	scheme: number;
	rangePeakGrouping: number;
	dopplerPeakGrouping: number;
	startRangeIndex: number;
	endRangeIndex: number;
}
type MultiObjectBeamForming = {
	enabled: number;
	threshold: number;
}
type CalibrateDcRangeSignal = {
	enabled: number;
	negativeBinIndex: number;
	positiveBinIndex: number;
	numberOfChirps: number;
}
type ExtendedMaxVelocity = {
	enabled: number;
}
type ClutterRemoval = {
	enabled: number;
}
