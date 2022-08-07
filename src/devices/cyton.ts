
import { WebglLinePlotProps } from "webgl-plot-utils";
import { FilterSettings } from "../BiquadFilters";
import { bitflippin } from "../bitflippin";

//8 channels x 3 bytes per channel each line, plus 6x2 bytes for the IMU. First byte is counter byte;
export function cytoncodec(data:any) {
    let arr; 
    if(!data.buffer) arr = new Uint8Array(data);
    else arr = data;

    let output:any = {};

    for(let i = 1; i < 25; i+=3) {
        output[i] = bitflippin.bytesToInt24(arr[i],arr[i+1],arr[i+2]); //signed ints
    }

    let accIdx = 25; //8*3 + 1
    output.ax = bitflippin.bytesToInt16(arr[accIdx],arr[accIdx+1]);
    output.ay = bitflippin.bytesToInt16(arr[accIdx+2],arr[accIdx+3]);
    output.az = bitflippin.bytesToInt16(arr[accIdx+4],arr[accIdx+5]);
    output.gx = bitflippin.bytesToInt16(arr[accIdx+6],arr[accIdx+7]);
    output.gy = bitflippin.bytesToInt16(arr[accIdx+8],arr[accIdx+9]);
    output.gz = bitflippin.bytesToInt16(arr[accIdx+10],arr[accIdx+11]);

    return output;
}

export const cytonChartSettings:Partial<WebglLinePlotProps> = {
    lines:{
        '0':{nSec:10, sps:250},
        '1':{nSec:10, sps:250},
        '2':{nSec:10, sps:250},
        '3':{nSec:10, sps:250},
        '4':{nSec:10, sps:250},
        '5':{nSec:10, sps:250},
        '6':{nSec:10, sps:250},
        '7':{nSec:10, sps:250},
        'ax':{nSec:10, sps:250},
        'ay':{nSec:10, sps:250},
        'az':{nSec:10, sps:250},
        'gx':{nSec:10, sps:250},
        'gy':{nSec:10, sps:250},
        'gz':{nSec:10, sps:250},
    }
};

export const cytonFilterSettings:{[key:string]:FilterSettings} = {
    '0':{sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '1':{sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '2':{sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '3':{sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '4':{sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '5':{sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '6':{sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '7':{sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45}
}