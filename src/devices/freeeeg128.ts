import { WebglLinePlotProps } from "webgl-plot-utils";
import { FilterSettings } from "../util/BiquadFilters";
import { ByteParser } from "../util/ByteParser";

//128 channels x 3 bytes per channel each line, plus 6x2 bytes for the IMU. First byte is counter byte;
export function freeeeg128codec(data:any) {
    let arr; 
    if((data as DataView).getInt8) arr = new Uint8Array(data.buffer);
    else if(!data.buffer) arr = new Uint8Array(data);
    else arr = data;
    
    let output:any = {};

    for(let i = 0; i < 128; i++) {
        let idx = i*3+1;
        output[i] = ByteParser.bytesToInt24(arr[idx],arr[idx+1],arr[idx+2]);
    }
 
    let accIdx = 385;//128*3 + 1; //
    output['ax'] = ByteParser.bytesToInt16(arr[accIdx],arr[accIdx+1]);
    output['ay'] = ByteParser.bytesToInt16(arr[accIdx+2],arr[accIdx+3]);
    output['az'] = ByteParser.bytesToInt16(arr[accIdx+4],arr[accIdx+5]);
    output['gx'] = ByteParser.bytesToInt16(arr[accIdx+6],arr[accIdx+7]);
    output['gy'] = ByteParser.bytesToInt16(arr[accIdx+8],arr[accIdx+9]);
    output['gz'] = ByteParser.bytesToInt16(arr[accIdx+10],arr[accIdx+11]);
    output.timestamp = Date.now();

    return output;
}

const sps = 250;

export const freeeeg128SerialSettings = {
    baudRate:921600,
    bufferSize:2000,
    frequency:1.9,
    codec:freeeeg128codec,
    sps
}

export const freeeeg128ChartSettings:Partial<WebglLinePlotProps> = {  //adding the rest below
    lines:{
        'ax':{nSec:10, sps},
        'ay':{nSec:10, sps},
        'az':{nSec:10, sps},
        'gx':{nSec:10, sps},
        'gy':{nSec:10, sps},
        'gz':{nSec:10, sps}
    }
}

export const freeeeg128FilterSettings:{[key:string]:FilterSettings} = { }

for(let i = 0; i < 128; i++) {
    freeeeg128ChartSettings.lines[i] = {sps,nSec:10, units:'mV' };
    freeeeg128FilterSettings[i] = {
        sps:250, 
        useDCBlock:true, 
        useBandpass:true, 
        bandpassLower:3, 
        bandpassUpper:45, 
        scalar:1000*2.5/(32*(Math.pow(2,24)-1))
    };
}
