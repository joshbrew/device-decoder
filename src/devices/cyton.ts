
import { WebglLinePlotProps } from "webgl-plot-utils";
import { FilterSettings } from "../util/BiquadFilters";
import { bitflippin } from "../util/bitflippin";

//8 channels x 3 bytes per channel each line, plus 6x2 bytes for the IMU. First byte is counter byte;
export function cytoncodec(data:any) {
    let arr; 
    if(!data.buffer) arr = new Uint8Array(data);
    else arr = data;

    let output:any = {};

    for(let i = 0; i < 8; i++) {
        let idx = 1+3*i;
        output[i] = bitflippin.bytesToInt24(arr[idx],arr[idx+1],arr[idx+2]); //signed ints
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

//8 channels x 3 bytes per channel each line, plus 6x2 bytes for the IMU. First byte is counter byte;
export function daisycytoncodec(data:any) {
    let arr; 
    if(!data.buffer) arr = new Uint8Array(data);
    else arr = data;

    let output:any = {};

    for(let i = 0; i < 8; i++) {
        let idx = 1+3*i;
        if(arr[0]%2 === 0) output[i+7] = bitflippin.bytesToInt24(arr[idx],arr[idx+1],arr[idx+2]); //signed ints 
        else output[i] = bitflippin.bytesToInt24(arr[idx],arr[idx+1],arr[idx+2]); //signed ints
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

export const cytonSerialSettings = {
    baudRate:115200,
    codec:cytoncodec
};

export const daisycytonSerialSettings = {
    baudRate:115200,
    codec:daisycytoncodec
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
    },
    generateNewLines:true //to add the additional 16 channels
};

let defaultsetting = {
    sps:250, 
    useDCBlock:true, 
    useBandpass:true, 
    bandpassLower:3, 
    bandpassUpper:45, 
    useScaling:true, 
    scalar:4.5/(24*(Math.pow(2,23)-1))
};

export const cytonFilterSettings:{[key:string]:FilterSettings} = {
    '0':JSON.parse(JSON.stringify(defaultsetting)), //twos compliment 2^23
    '1':JSON.parse(JSON.stringify(defaultsetting)),
    '2':JSON.parse(JSON.stringify(defaultsetting)),
    '3':JSON.parse(JSON.stringify(defaultsetting)),
    '4':JSON.parse(JSON.stringify(defaultsetting)),
    '5':JSON.parse(JSON.stringify(defaultsetting)),
    '6':JSON.parse(JSON.stringify(defaultsetting)),
    '7':JSON.parse(JSON.stringify(defaultsetting)),
    '8':JSON.parse(JSON.stringify(defaultsetting)), //twos compliment 2^23
    '9':JSON.parse(JSON.stringify(defaultsetting)),
    '10':JSON.parse(JSON.stringify(defaultsetting)),
    '11':JSON.parse(JSON.stringify(defaultsetting)),
    '12':JSON.parse(JSON.stringify(defaultsetting)),
    '13':JSON.parse(JSON.stringify(defaultsetting)),
    '14':JSON.parse(JSON.stringify(defaultsetting)),
    '15':JSON.parse(JSON.stringify(defaultsetting))
}