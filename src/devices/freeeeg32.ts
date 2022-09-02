
import { WebglLinePlotProps } from "webgl-plot-utils";
import { FilterSettings } from "../util/BiquadFilters";
import { ByteParser } from "../util/ByteParser";

//32 channels x 3 bytes per channel each line, plus 6x2 bytes for the IMU. First byte is counter byte;
export function freeeeg32codec(data:any) {
    let arr; 
    if((data as DataView).getInt8) arr = new Uint8Array(data.buffer);
    else if(!data.buffer) arr = new Uint8Array(data);
    else arr = data;

    let output:any = {};

    for(let i = 0; i < 32; i++) {
        let idx = i*3+1;
        output[i] = ByteParser.bytesToInt24(arr[idx],arr[idx+1],arr[idx+2]);
    }

    let accIdx = 97; //32*3 + 1
    output['ax'] = ByteParser.bytesToInt16(arr[accIdx],arr[accIdx+1]);
    output['ay'] = ByteParser.bytesToInt16(arr[accIdx+2],arr[accIdx+3]);
    output['az'] = ByteParser.bytesToInt16(arr[accIdx+4],arr[accIdx+5]);
    output['gx'] = ByteParser.bytesToInt16(arr[accIdx+6],arr[accIdx+7]);
    output['gy'] = ByteParser.bytesToInt16(arr[accIdx+8],arr[accIdx+9]);
    output['gz'] = ByteParser.bytesToInt16(arr[accIdx+10],arr[accIdx+11]);
    output.timestamp = Date.now();

    return output;
}

const sps = 512;

export const freeeeg32SerialSettings = {
    baudRate:921600, //921600 baud
    bufferSize:2000,
    frequency:1.9, //512sps
    codec:freeeeg32codec,
    sps

}

export const freeeeg32_optical_SerialSettings = {
    baudRate:1000000, //1M baud, I forget why
    bufferSize:2000,
    frequency:1.9,
    codec:freeeeg32codec,
    sps
}

const defaultChartSetting = {nSec:10, sps}
export const freeeeg32ChartSettings:Partial<WebglLinePlotProps> = {  //adding the rest below
    lines:{
        'ax':JSON.parse(JSON.stringify(defaultChartSetting)),
        'ay':JSON.parse(JSON.stringify(defaultChartSetting)),
        'az':JSON.parse(JSON.stringify(defaultChartSetting)),
        'gx':JSON.parse(JSON.stringify(defaultChartSetting)),
        'gy':JSON.parse(JSON.stringify(defaultChartSetting)),
        'gz':JSON.parse(JSON.stringify(defaultChartSetting))
    }
}

export const freeeeg32FilterSettings:{[key:string]:FilterSettings} = { }

for(let i = 0; i < 32; i++) {
    freeeeg32ChartSettings.lines[i] = {sps,nSec:10, units:'mV'};
    freeeeg32FilterSettings[i] = {
        sps, 
        useDCBlock:true, 
        useBandpass:true, 
        bandpassLower:3, 
        bandpassUpper:45, 
        useScaling:true, 
        scalar:1000*2.5/(8*(Math.pow(2,24)-1))
    }; //alternative is 250sps and 32x gain
}