import { WebglLinePlotProps } from "webgl-plot-utils";
import { FilterSettings } from "../BiquadFilters";
import { bitflippin } from "../bitflippin";

//128 channels x 3 bytes per channel each line, plus 6x2 bytes for the IMU. First byte is counter byte;
export function freeeeg128codec(data:any) {
    let arr; 
    if(!data.buffer) arr = new Uint8Array(data);
    else arr = data;
    
    let output:any = {};

    for(let i = 1; i < 385; i+=3) {
        output[i] = bitflippin.bytesToUInt24(arr[i],arr[i+1],arr[i+2]);
    }
 
    let accIdx = 385;//128*3 + 1; //
    output['ax'] = bitflippin.bytesToInt16(arr[accIdx],arr[accIdx+1]);
    output['ay'] = bitflippin.bytesToInt16(arr[accIdx+2],arr[accIdx+3]);
    output['az'] = bitflippin.bytesToInt16(arr[accIdx+4],arr[accIdx+5]);
    output['gx'] = bitflippin.bytesToInt16(arr[accIdx+6],arr[accIdx+7]);
    output['gy'] = bitflippin.bytesToInt16(arr[accIdx+8],arr[accIdx+9]);
    output['gz'] = bitflippin.bytesToInt16(arr[accIdx+10],arr[accIdx+11]);

    return output;
}


export const freeeeg128ChartSettings:Partial<WebglLinePlotProps> = {  //adding the rest below
    lines:{
        'ax':{nSec:10, sps:500},
        'ay':{nSec:10, sps:500},
        'az':{nSec:10, sps:500},
        'gx':{nSec:10, sps:500},
        'gy':{nSec:10, sps:500},
        'gz':{nSec:10, sps:500}
    }
}

export const freeeeg128FilterSettings:{[key:string]:FilterSettings} = { }

for(let i = 0; i < 128; i++) {
    freeeeg128ChartSettings.lines[i] = {sps:250,nSec:10};
    freeeeg128FilterSettings[i] = {sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45, scalar:2.5*32/(Math.pow(2,24)-1)};
}
