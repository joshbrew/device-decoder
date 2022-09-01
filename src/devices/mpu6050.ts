import { WebglLinePlotProps } from "webgl-plot-utils";
import { ByteParser } from "../util/ByteParser";


//Packet format: ctr byte , 20 samples x 12 bytes , 16 bit die temp 
export function mpu6050codec(data:any) {
    let arr; 
    if((data as DataView).getInt8) arr = new Uint8Array(data.buffer);
    else if(!data.buffer) arr = new Uint8Array(data);
    else arr = data;

    let output = {
        'ax':new Array(20),
        'ay':new Array(20),
        'az':new Array(20),
        'gx':new Array(20),
        'gy':new Array(20),
        'gz':new Array(20),
        'mpu_dietemp':(ByteParser.bytesToInt16(arr[241],arr[242])+521)/340 + 35, //temp sensor,
        timestamp: Date.now()
    }

    for(let i = 0; i < 20; i++) {
        let idx = i*12;
        output.ax[i] = ByteParser.bytesToInt16(arr[idx+1],arr[idx+2]);
        output.ay[i] = ByteParser.bytesToInt16(arr[idx+3],arr[idx+4]);
        output.az[i] = ByteParser.bytesToInt16(arr[idx+5],arr[idx+6]);
        output.gx[i] = ByteParser.bytesToInt16(arr[idx+7],arr[idx+8]);
        output.gy[i] = ByteParser.bytesToInt16(arr[idx+9],arr[idx+10]);
        output.gz[i] = ByteParser.bytesToInt16(arr[idx+11],arr[idx+12]);
    }

    return output;
}

const sps = 100;

export const mpu6050ChartSettings:Partial<WebglLinePlotProps> = {
    lines:{
        'ax':{nSec:10, sps},
        'ay':{nSec:10, sps},
        'az':{nSec:10, sps},
        'gx':{nSec:10, sps},
        'gy':{nSec:10, sps},
        'gz':{nSec:10, sps},
        'mpu_dietemp':{nSec:10, sps:5, units:'C'}
    }
}