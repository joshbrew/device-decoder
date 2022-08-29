
import { WebglLinePlotProps } from "webgl-plot-utils";
import { FilterSettings } from "../util/BiquadFilters";
import { bitflippin } from "../util/bitflippin";

//32 channels x 3 bytes per channel each line, plus 6x2 bytes for the IMU. First byte is counter byte;
export function freeeeg32codec(data:any) {
    let arr; 
    if((data as DataView).getInt8) arr = new Uint8Array(data.buffer);
    else if(!data.buffer) arr = new Uint8Array(data);
    else arr = data;

    let output:any = {};

    for(let i = 0; i < 32; i++) {
        let idx = i*3+1;
        output[i] = bitflippin.bytesToUInt24(arr[idx],arr[idx+1],arr[idx+2]);
    }

    let accIdx = 97; //32*3 + 1
    output['ax'] = bitflippin.bytesToInt16(arr[accIdx],arr[accIdx+1]);
    output['ay'] = bitflippin.bytesToInt16(arr[accIdx+2],arr[accIdx+3]);
    output['az'] = bitflippin.bytesToInt16(arr[accIdx+4],arr[accIdx+5]);
    output['gx'] = bitflippin.bytesToInt16(arr[accIdx+6],arr[accIdx+7]);
    output['gy'] = bitflippin.bytesToInt16(arr[accIdx+8],arr[accIdx+9]);
    output['gz'] = bitflippin.bytesToInt16(arr[accIdx+10],arr[accIdx+11]);
    output.timestamp = Date.now();

    return output;
}

export const freeeeg32SerialSettings = {
    baudRate:921600, //921600 baud
    bufferSize:2000,
    frequency:1.9, //512sps
    codec:freeeeg32codec
}

export const freeeeg32_optical_SerialSettings = {
    baudRate:1000000, //1M baud, I forget why
    bufferSize:2000,
    frequency:1.9,
    codec:freeeeg32codec
}

export const freeeeg32ChartSettings:Partial<WebglLinePlotProps> = {  //adding the rest below
    lines:{
        'ax':{nSec:10, sps:500},
        'ay':{nSec:10, sps:500},
        'az':{nSec:10, sps:500},
        'gx':{nSec:10, sps:500},
        'gy':{nSec:10, sps:500},
        'gz':{nSec:10, sps:500}
    }
}

export const freeeeg32FilterSettings:{[key:string]:FilterSettings} = { }

for(let i = 0; i < 32; i++) {
    freeeeg32ChartSettings.lines[i] = {sps:500,nSec:10};
    freeeeg32FilterSettings[i] = {
        sps:500, 
        useDCBlock:true, 
        useBandpass:true, 
        bandpassLower:3, 
        bandpassUpper:45, 
        useScaling:true, 
        scalar:2.5/(8*(Math.pow(2,24)-1))
    }; //alternative is 250sps and 32x gain
}