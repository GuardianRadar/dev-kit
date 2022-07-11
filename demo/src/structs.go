package main

//These structs parse the frame from the websocket
type CoreFrame struct {
	FrameNumber            uint64
	TimeStamp              uint64
	Detections             []CoreDetection
	RDM                    []uint16
	StatisticInfo          StatisticInfo
	ResolutionInfo         ResolutionInfo
	RuntimeCalibrationInfo RuntimeCalibrationInfo
}
type CoreDetection struct {
	RangeIndex   uint16
	DopplerIndex int16
	X            float64
	Y            float64
	SinAzim      float64
	Peak         uint16
	RangeSnr     float64
	DopplerSnr   float64
	SinAzimSnr   float64
}
type StatisticInfo struct {
	InterFrameProcessingTime   uint32
	TransmitOutputTime         uint32
	InterFrameProcessingMargin uint32
	InterChirpProcessingMargin uint32
	ActiveFrameCPULoad         uint32
	InterFrameCPULoad          uint32
}
type ResolutionInfo struct {
	RangeResolution   float64
	DopplerResolution float64
	RangeBinCount     uint16
	DopplerBinCount   uint16
}
type RuntimeCalibrationInfo struct {
	CalibrationErrorFlag    uint32
	CalibrationUpdateStatus uint32
	Temperature             uint16
	Reserved0               uint16
	Timestamp               uint32
	Reserved1               uint32
}

//These structs are used for the tracking and web output
type WebsocketFrame struct {
	FrameNumber    uint64
	ResolutionInfo ResolutionInfo
	RDM            string
	Detections     []Detection
	Clusters       []Cluster
	Tracks         []Track
}
type Detection struct {
	Id         uint16
	X          float64
	Y          float64
	VelocityX  float64
	VelocityY  float64
	RangeSnr   float64
	DopplerSnr float64
}
type Cluster struct {
	Id           uint16
	DetectionIds []uint16
	X            float64
	Y            float64
	VelocityX    float64
	VelocityY    float64
	Width        float64
	Height       float64
}
type Track struct {
	Id        uint16
	ClusterId uint16
	X         float64
	Y         float64
	VelocityX float64
	VelocityY float64
	Age       uint16
	Ticks     uint16
}

type TrackConfig struct {
	Clustering ClusteringConfig `json:"clustering"`
	Tracking   TrackingConfig   `json:"tracking"`
}
type ClusteringConfig struct {
	AssociateDistance float64 `json:"associateDistance"`
}
type TrackingConfig struct {
	AssociateDistance float64 `json:"associateDistance"`
	MaxAge            uint16  `json:"maxAge"`
	MaxCount          uint16  `json:"maxCount"`
	ClusterWeight     float64 `json:"clusterWeight"`
	MinimumTicks      uint16  `json:"minimumTicks"`
}

type RadarConfig struct {
	ChannelCfg             ChannelCfg             `json:"channelCfg"`
	ProfileCfg             ProfileCfg             `json:"profileCfg"`
	ChirpCfg               ChirpCfg               `json:"chirpCfg"`
	BpmCfg                 BpmCfg                 `json:"bpmCfg"`
	FrameCfg               FrameCfg               `json:"frameCfg"`
	GuiMonitor             GuiMonitor             `json:"guiMonitor"`
	CfarCfgRange           CfarCfg                `json:"cfarCfgRange"`
	CfarCfgDoppler         CfarCfg                `json:"cfarCfgDoppler"`
	PeakGrouping           PeakGrouping           `json:"peakGrouping"`
	MultiObjectBeamForming MultiObjectBeamForming `json:"multiObjectBeamForming"`
	CalibrateDcRangeSignal CalibrateDcRangeSignal `json:"calibrateDcRangeSignal"`
	ExtendedMaxVelocity    ExtendedMaxVelocity    `json:"extendedMaxVelocity"`
	ClutterRemoval         ClutterRemoval         `json:"clutterRemoval"`
}
type ChannelCfg struct {
	RxChannelEnable uint16 `json:"rxChannelEnable"`
	TxChannelEnable uint16 `json:"txChannelEnable"`
}
type ProfileCfg struct {
	StartFrequency      float64 `json:"startFrequency"`
	IdleTime            uint16  `json:"idleTime"`
	AdcStartTime        uint16  `json:"adcStartTime"`
	RampEndTime         uint16  `json:"rampEndTime"`
	FrequencySlope      float64 `json:"frequencySlope"`
	TxStartTime         uint16  `json:"txStartTime"`
	NumberOfAdcSamples  uint16  `json:"numberOfAdcSamples"`
	SampleRate          uint16  `json:"sampleRate"`
	HpfCornerFrequency1 uint16  `json:"hpfCornerFrequency1"`
	HpfCornerFrequency2 uint16  `json:"hpfCornerFrequency2"`
	RxGain              uint16  `json:"rxGain"`
}
type ChirpCfg struct {
	ChirpStartIndex     uint16 `json:"chirpStartIndex"`
	ChirpEndIndex       uint16 `json:"chirpEndIndex"`
	TxAntennaEnableMask uint16 `json:"txAntennaEnableMask"`
}
type BpmCfg struct {
	Enabled     uint16 `json:"enabled"`
	Chirp0Index uint16 `json:"chirp0Index"`
	Chirp1Index uint16 `json:"chirp1Index"`
}
type FrameCfg struct {
	ChirpStartIndex   uint16 `json:"chirpStartIndex"`
	ChirpEndIndex     uint16 `json:"chirpEndIndex"`
	NumberOfLoops     uint16 `json:"numberOfLoops"`
	NumberOfFrames    uint16 `json:"numberOfFrames"`
	FramePeriodicity  uint16 `json:"framePeriodicity"`
	FrameTriggerDelay uint16 `json:"frameTriggerDelay"`
}
type GuiMonitor struct {
	DetectedObject  uint16 `json:"detectedObjects"`
	RangeDopplerMap uint16 `json:"rangeDopplerMap"`
	StatisticsInfo  uint16 `json:"statisticsInfo"`
}
type CfarCfg struct {
	NoiseWindow    uint16 `json:"noiseWindow"`
	GuardLength    uint16 `json:"guardLength"`
	DivideShift    uint16 `json:"divideShift"`
	ThresholdScale uint16 `json:"thresholdScale"`
}
type PeakGrouping struct {
	Scheme              uint16 `json:"scheme"`
	RangePeakGrouping   uint16 `json:"rangePeakGrouping"`
	DopplerPeakGrouping uint16 `json:"dopplerPeakGrouping"`
	StartRangeIndex     uint16 `json:"startRangeIndex"`
	EndRangeIndex       uint16 `json:"endRangeIndex"`
}
type MultiObjectBeamForming struct {
	Enabled   uint16 `json:"enabled"`
	Threshold uint16 `json:"threshold"`
}
type CalibrateDcRangeSignal struct {
	Enabled          uint16 `json:"enabled"`
	NegativeBinIndex int16  `json:"negativeBinIndex"`
	PositiveBinIndex uint16 `json:"positiveBinIndex"`
	NumberOfChirps   uint16 `json:"numberOfChirps"`
}
type ExtendedMaxVelocity struct {
	Enabled uint16 `json:"enabled"`
}
type ClutterRemoval struct {
	Enabled uint16 `json:"enabled"`
}
