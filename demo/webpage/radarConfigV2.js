
function $(id) {
    return document.getElementById(id);
}
const protocol = location.protocol;
const hostname = location.hostname;
const port = location.port;
let defaultRadarConfig;
let userRadarConfig;


const init = async function () {
    checkboxes = document.querySelectorAll("input[type='checkbox']");

    const defaultRadarConfigJson = await getDefaultRadarConfigHttp();
    const userRadarConfigJson = await getUserRadarConfigHttp();
    try {
        defaultRadarConfig = JSON.parse(defaultRadarConfigJson);
        userRadarConfig = JSON.parse(userRadarConfigJson);
        console.log(defaultRadarConfig);
        console.log(userRadarConfig);
        // buildDom(defaultRadarConfig, userRadarConfig);
        // updateDom(userRadarConfig);
        updateFields(defaultRadarConfig);
        // updateFields(userRadarConfig);
        $("saveConfig").onclick = () => {
            setUserRadarConfigHttp(userRadarConfig);
        };
    } catch (e) {
        alert(e);
    }
};

function updateFields(radarConfig) {
    $('input-FlushCfg').checked = radarConfig.FlushCfg === 'flushCfg';
    $('input-ResolutionInfo').checked = radarConfig.ResolutionInfo === 'resolutionInfo';
    $('input-DfeDataOutputMode-ModeType').value = radarConfig.DfeDataOutputMode.ModeType;
    $('input-ChannelCfg-RxChannelEn').value = radarConfig.ChannelCfg.RxChannelEn;
    $('input-ChannelCfg-TxChannelEn').value = radarConfig.ChannelCfg.TxChannelEn;
    $('input-ChannelCfg-Cascading').value = radarConfig.ChannelCfg.Cascading;
    $('input-AdcCfg-NumADCBits').value = radarConfig.AdcCfg.NumADCBits;
    $('input-AdcCfg-AdcOutputFmt').value = radarConfig.AdcCfg.AdcOutputFmt;
    $('input-AdcBufCfg-SubFrameIdx').value = radarConfig.AdcBufCfg.SubFrameIdx;
    $('input-AdcBufCfg-AdcOutputFmt').value = radarConfig.AdcBufCfg.AdcOutputFmt;
    $('input-AdcBufCfg-SampleSwap').value = radarConfig.AdcBufCfg.SampleSwap;
    $('input-AdcBufCfg-ChanInterLeave').value = radarConfig.AdcBufCfg.ChanInterLeave;
    $('input-AdcBufCfg-ChirpThreshold').value = radarConfig.AdcBufCfg.ChirpThreshold;
    $('input-ProfileCfg-ProfileId').value = radarConfig.ProfileCfg.ProfileId;
    $('input-ProfileCfg-StartFreq').value = radarConfig.ProfileCfg.StartFreq;
    $('input-ProfileCfg-IdleTime').value = radarConfig.ProfileCfg.IdleTime;
    $('input-ProfileCfg-AdcStartTime').value = radarConfig.ProfileCfg.AdcStartTime;
    $('input-ProfileCfg-RampEndTime').value = radarConfig.ProfileCfg.RampEndTime;
    $('input-ProfileCfg-TxOutPower').value = radarConfig.ProfileCfg.TxOutPower;
    $('input-ProfileCfg-TxPhaseSHifter').value = radarConfig.ProfileCfg.TxPhaseSHifter;
    $('input-ProfileCfg-FreqSlopeConst').value = radarConfig.ProfileCfg.FreqSlopeConst;
    $('input-ProfileCfg-TxStartTime').value = radarConfig.ProfileCfg.TxStartTime;
    $('input-ProfileCfg-NumAdcSamples').value = radarConfig.ProfileCfg.NumAdcSamples;
    $('input-ProfileCfg-DigOutSampleRate').value = radarConfig.ProfileCfg.DigOutSampleRate;
    $('input-ProfileCfg-HpfCornerFreq1').value = radarConfig.ProfileCfg.HpfCornerFreq1;
    $('input-ProfileCfg-HpfCornerFreq2').value = radarConfig.ProfileCfg.HpfCornerFreq2;
    $('input-ProfileCfg-RxGain').value = radarConfig.ProfileCfg.RxGain;
    $('input-ProfileCfg-RxGain').onchange = (event) => {
        const rxGain = event.target.value;
        const ifGain = rxGain & 0b111111;
        const rfGain = (rxGain >> 6) & 0b11;
        if ($('input-ProfileCfg-IfGain').value != ifGain) {
            $('input-ProfileCfg-IfGain').value = ifGain;
        }
        if ($('input-ProfileCfg-RfGain').value != rfGain) {
            $('input-ProfileCfg-RfGain').value = rfGain
        }
    }
    $('input-ProfileCfg-IfGain').value = radarConfig.ProfileCfg.RxGain & 0b111111;
    $('input-ProfileCfg-IfGain').onchange = (event) => {
        const ifGain = event.target.value;
        const rfGain = $('input-ProfileCfg-RfGain').value;
        const rxGain = (rfGain << 6) | (ifGain & 0b111111);
        if ($('input-ProfileCfg-RxGain').value != rxGain) {
            $('input-ProfileCfg-RxGain').value = rxGain;
        }
    }
    $('input-ProfileCfg-RfGain').value = (radarConfig.ProfileCfg.RxGain >> 6) & 0b11;
    $('input-ProfileCfg-RfGain').onchange = (event) => {
        const rfGain = event.target.value;
        const ifGain = $('input-ProfileCfg-IfGain').value;
        const rxGain = (rfGain << 6) | (ifGain & 0b111111);
        if ($('input-ProfileCfg-RxGain').value != rxGain) {
            $('input-ProfileCfg-RxGain').value = rxGain;
        }
    }
    $('input-ChirpCfg-ChirpStartIndex').value = radarConfig.ChirpCfg.ChirpStartIndex;
    $('input-ChirpCfg-ChirpEndIndex').value = radarConfig.ChirpCfg.ChirpEndIndex;
    $('input-ChirpCfg-ProfileIdentifier').value = radarConfig.ChirpCfg.ProfileIdentifier;
    $('input-ChirpCfg-StartFreqVarHz').value = radarConfig.ChirpCfg.StartFreqVarHz;
    $('input-ChirpCfg-FreqSlopeVar').value = radarConfig.ChirpCfg.FreqSlopeVar;
    $('input-ChirpCfg-IdleTimeVar').value = radarConfig.ChirpCfg.IdleTimeVar;
    $('input-ChirpCfg-AdcStartTimeVar').value = radarConfig.ChirpCfg.AdcStartTimeVar;
    $('input-ChirpCfg-TxAntennaEnableMask').value = radarConfig.ChirpCfg.TxAntennaEnableMask;
    $('input-BpmCfg-SubFrameIdx').value = radarConfig.BpmCfg.SubFrameIdx;
    $('input-BpmCfg-Enabled').checked = radarConfig.BpmCfg.Enabled === 1;
    $('input-BpmCfg-Chirp0Idx').value = radarConfig.BpmCfg.Chirp0Idx;
    $('input-BpmCfg-Chirp1Idx').value = radarConfig.BpmCfg.Chirp1Idx;
    $('input-FrameCfg-ChirpStartIndex').value = radarConfig.FrameCfg.ChirpStartIndex;
    $('input-FrameCfg-ChirpEndIndex').value = radarConfig.FrameCfg.ChirpEndIndex;
    $('input-FrameCfg-NumOfLoops').value = radarConfig.FrameCfg.NumOfLoops;
    $('input-FrameCfg-NumOfFrames').value = radarConfig.FrameCfg.NumOfFrames;
    $('input-FrameCfg-FramePeriodicityMs').value = radarConfig.FrameCfg.FramePeriodicityMs;
    $('input-FrameCfg-TriggerSelect').value = radarConfig.FrameCfg.TriggerSelect;
    $('input-FrameCfg-FrameTriggerDelayMs').value = radarConfig.FrameCfg.FrameTriggerDelayMs;
    $('input-LowPower-DontCare').value = radarConfig.LowPower.DontCare;
    $('input-LowPower-AdcMode').value = radarConfig.LowPower.AdcMode;
    $('input-GuiMonitor-SubFrameIdx').value = radarConfig.GuiMonitor.SubFrameIdx;
    $('input-GuiMonitor-DetectedObject').checked = radarConfig.GuiMonitor.DetectedObject === 1;
    $('input-GuiMonitor-LogMagnitudeRang').checked = radarConfig.GuiMonitor.LogMagnitudeRang === 1;
    $('input-GuiMonitor-NoiseProfile').checked = radarConfig.GuiMonitor.NoiseProfile === 1;
    $('input-GuiMonitor-RangeAzimuthHeatMa').checked = radarConfig.GuiMonitor.RangeAzimuthHeatMa === 1;
    $('input-GuiMonitor-RangeDopplerHeatMa').checked = radarConfig.GuiMonitor.RangeDopplerHeatMa === 1;
    $('input-GuiMonitor-StatsInfo').checked = radarConfig.GuiMonitor.StatsInfo === 1;
    $('input-CfarCfgRange-SubFrameIdn').value = radarConfig.CfarCfgRange.SubFrameIdn;
    $('input-CfarCfgRange-ProcDirection').value = radarConfig.CfarCfgRange.ProcDirection;
    $('input-CfarCfgRange-Mode').value = radarConfig.CfarCfgRange.Mode;
    $('input-CfarCfgRange-NoiseWin').value = radarConfig.CfarCfgRange.NoiseWin;
    $('input-CfarCfgRange-GuardLen').value = radarConfig.CfarCfgRange.GuardLen;
    $('input-CfarCfgRange-DivShift').value = radarConfig.CfarCfgRange.DivShift;
    $('input-CfarCfgRange-CyclicMode').checked = radarConfig.CfarCfgRange.CyclicMode == 1;
    $('input-CfarCfgRange-ThresholdScale').value = radarConfig.CfarCfgRange.ThresholdScale;
    $('input-CfarCfgRange-ThresholdScale').onchange = (event) => {
        const threshold = event.target.value;
        const thresholdDb = threshold / 256 / 8 * 6;
        if ($('input-CfarCfgRange-ThresholdScale-dB').value != thresholdDb) {
            $('input-CfarCfgRange-ThresholdScale-dB').value = thresholdDb;
        }
    }
    $('input-CfarCfgRange-ThresholdScale-dB').value = radarConfig.CfarCfgRange.ThresholdScale / 256 / 8 * 6;
    $('input-CfarCfgRange-ThresholdScale-dB').onchange = (event) => {
        const thresholdDb = event.target.value;
        const threshold = thresholdDb * 256 * 8 / 6;
        if ($('input-CfarCfgRange-ThresholdScale').value != threshold) {
            $('input-CfarCfgRange-ThresholdScale').value = threshold;
        }
    }
    $('input-CfarCfgDoppler-SubFrameIdn').value = radarConfig.CfarCfgDoppler.SubFrameIdn;
    $('input-CfarCfgDoppler-ProcDirection').value = radarConfig.CfarCfgDoppler.ProcDirection;
    $('input-CfarCfgDoppler-Mode').value = radarConfig.CfarCfgDoppler.Mode;
    $('input-CfarCfgDoppler-NoiseWin').value = radarConfig.CfarCfgDoppler.NoiseWin;
    $('input-CfarCfgDoppler-GuardLen').value = radarConfig.CfarCfgDoppler.GuardLen;
    $('input-CfarCfgDoppler-DivShift').value = radarConfig.CfarCfgDoppler.DivShift;
    $('input-CfarCfgDoppler-CyclicMode').checked = radarConfig.CfarCfgDoppler.CyclicMode == 1;
    $('input-CfarCfgDoppler-ThresholdScale').value = radarConfig.CfarCfgDoppler.ThresholdScale;
    $('input-CfarCfgDoppler-ThresholdScale').onchange = (event) => {
        const threshold = event.target.value;
        const thresholdDb = threshold / 256 / 8 * 6;
        if ($('input-CfarCfgDoppler-ThresholdScale-dB').value != thresholdDb) {
            $('input-CfarCfgDoppler-ThresholdScale-dB').value = thresholdDb;
        }
    }
    $('input-CfarCfgDoppler-ThresholdScale-dB').value = radarConfig.CfarCfgDoppler.ThresholdScale / 256 / 8 * 6;
    $('input-CfarCfgDoppler-ThresholdScale-dB').onchange = (event) => {
        const thresholdDb = event.target.value;
        const threshold = thresholdDb * 256 * 8 / 6;
        if ($('input-CfarCfgDoppler-ThresholdScale').value != threshold) {
            $('input-CfarCfgDoppler-ThresholdScale').value = threshold;
        }
    }
    $('input-PeakGrouping-SubFrameIdx').value = radarConfig.PeakGrouping.SubFrameIdx;
    $('input-PeakGrouping-Scheme').value = radarConfig.PeakGrouping.Scheme;
    $('input-PeakGrouping-RangePeakGrouping').checked = radarConfig.PeakGrouping.RangePeakGrouping == 1;
    $('input-PeakGrouping-DopplerPeakGrouping').checked = radarConfig.PeakGrouping.DopplerPeakGrouping == 1;
    $('input-PeakGrouping-StartRangeIdx').value = radarConfig.PeakGrouping.StartRangeIdx;
    $('input-PeakGrouping-EndRangeIdx').value = radarConfig.PeakGrouping.EndRangeIdx;
    $('input-MultiObjBeamForming-SubFrameIdx').value = radarConfig.MultiObjBeamForming.SubFrameIdx;
    $('input-MultiObjBeamForming-FeatureEnabled').checked = radarConfig.MultiObjBeamForming.FeatureEnabled == 1;
    $('input-MultiObjBeamForming-Threshold').value = radarConfig.MultiObjBeamForming.Threshold;
    $('input-ClutterRemoval-SubFrameIdx').value = radarConfig.ClutterRemoval.SubFrameIdx;
    $('input-ClutterRemoval-Enabled').checked = radarConfig.ClutterRemoval.Enabled == 1;
    $('input-CalibDcRangeSig-SubFrameIdx').value = radarConfig.CalibDcRangeSig.SubFrameIdx;
    $('input-CalibDcRangeSig-Enabled').checked = radarConfig.CalibDcRangeSig.Enabled == 1;
    $('input-CalibDcRangeSig-NegativeBinIdx').value = radarConfig.CalibDcRangeSig.NegativeBinIdx;
    $('input-CalibDcRangeSig-PositiveBinIdx').value = radarConfig.CalibDcRangeSig.PositiveBinIdx;
    $('input-CalibDcRangeSig-NumAvg').value = radarConfig.CalibDcRangeSig.NumAvg;
    $('input-ExtendedMaxVelocity-SubFrameIdx').value = radarConfig.ExtendedMaxVelocity.SubFrameIdx;
    $('input-ExtendedMaxVelocity-Enabled').checked = radarConfig.ExtendedMaxVelocity.Enabled == 1;
    $('input-CompRangeBiasAndRxChanPhase-RangeBias').value = radarConfig.CompRangeBiasAndRxChanPhase.RangeBias;
    $('input-CompRangeBiasAndRxChanPhase-RealTxRx00').value = radarConfig.CompRangeBiasAndRxChanPhase.RealTxRx00;
    $('input-CompRangeBiasAndRxChanPhase-ImaginaryTxRx00').value = radarConfig.CompRangeBiasAndRxChanPhase.ImaginaryTxRx00;
    $('input-CompRangeBiasAndRxChanPhase-RealTxRx01').value = radarConfig.CompRangeBiasAndRxChanPhase.RealTxRx01;
    $('input-CompRangeBiasAndRxChanPhase-ImaginaryTxRx01').value = radarConfig.CompRangeBiasAndRxChanPhase.ImaginaryTxRx01;
    $('input-CompRangeBiasAndRxChanPhase-RealTxRx02').value = radarConfig.CompRangeBiasAndRxChanPhase.RealTxRx02;
    $('input-CompRangeBiasAndRxChanPhase-ImaginaryTxRx02').value = radarConfig.CompRangeBiasAndRxChanPhase.ImaginaryTxRx02;
    $('input-CompRangeBiasAndRxChanPhase-RealTxRx03').value = radarConfig.CompRangeBiasAndRxChanPhase.RealTxRx03;
    $('input-CompRangeBiasAndRxChanPhase-ImaginaryTxRx03').value = radarConfig.CompRangeBiasAndRxChanPhase.ImaginaryTxRx03;
    $('input-CompRangeBiasAndRxChanPhase-RealTxRx10').value = radarConfig.CompRangeBiasAndRxChanPhase.RealTxRx10;
    $('input-CompRangeBiasAndRxChanPhase-ImaginaryTxRx10').value = radarConfig.CompRangeBiasAndRxChanPhase.ImaginaryTxRx10;
    $('input-CompRangeBiasAndRxChanPhase-RealTxRx11').value = radarConfig.CompRangeBiasAndRxChanPhase.RealTxRx11;
    $('input-CompRangeBiasAndRxChanPhase-ImaginaryTxRx11').value = radarConfig.CompRangeBiasAndRxChanPhase.ImaginaryTxRx11;
    $('input-CompRangeBiasAndRxChanPhase-RealTxRx12').value = radarConfig.CompRangeBiasAndRxChanPhase.RealTxRx12;
    $('input-CompRangeBiasAndRxChanPhase-ImaginaryTxRx12').value = radarConfig.CompRangeBiasAndRxChanPhase.ImaginaryTxRx12;
    $('input-CompRangeBiasAndRxChanPhase-RealTxRx13').value = radarConfig.CompRangeBiasAndRxChanPhase.RealTxRx13;
    $('input-CompRangeBiasAndRxChanPhase-ImaginaryTxRx13').value = radarConfig.CompRangeBiasAndRxChanPhase.ImaginaryTxRx13;
    $('input-MeasureRangeBiasAndRxChanPhase-Enabled').checked = radarConfig.MeasureRangeBiasAndRxChanPhase.Enabled == 1;
    $('input-MeasureRangeBiasAndRxChanPhase-TargetDistance').value = radarConfig.MeasureRangeBiasAndRxChanPhase.TargetDistance;
    $('input-MeasureRangeBiasAndRxChanPhase-SearchWin').value = radarConfig.MeasureRangeBiasAndRxChanPhase.SearchWin;
    $('input-Decimate-Decimate').value = radarConfig.Decimate.Decimate;
}

function getDefaultRadarConfigHttp() {
    const promise = new Promise((resolve, reject) => {
        const url = `${protocol}//${hostname}:${port}/external/getDefaultRadarConfig`;
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = function () {
            switch (xhr.status) {
                case 200:
                    resolve(xhr.response);
                    break;
                default:
                    reject("error");
                    break;
            }
        };
        xhr.send();
    });
    return promise;
}
function getUserRadarConfigHttp() {
    const promise = new Promise((resolve, reject) => {
        const url = `${protocol}//${hostname}:${port}/external/getUserRadarConfig`;
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = function () {
            switch (xhr.status) {
                case 200:
                    resolve(xhr.response);
                    break;
                default:
                    reject("error");
                    break;
            }
        };
        xhr.send();
    });
    return promise;
}
function setUserRadarConfigHttp(userRadarConfig) {
    const promise = new Promise((resolve, reject) => {
        const url = `${protocol}//${hostname}:${port}/external/setUserRadarConfig`;
        const body = JSON.stringify(userRadarConfig);
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.onload = function () {
            switch (xhr.status) {
                case 200:
                    resolve(xhr.response);
                    break;
                default:
                    reject("error");
                    break;
            }
        };
        xhr.send(body);
    });
    return promise;
}
init();
