import { WebglLinePlotProps } from "webgl-plot-utils";
import { bitflippin } from "../util/bitflippin";


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
        'temp':(bitflippin.bytesToInt16(arr[241],arr[242])+521)/340 + 35 //temp sensor
    }

    for(let i = 0; i < 20; i++) {
        let idx = i*12;
        output.ax[i] = bitflippin.bytesToInt16(arr[idx+1],arr[idx+2]);
        output.ay[i] = bitflippin.bytesToInt16(arr[idx+3],arr[idx+4]);
        output.az[i] = bitflippin.bytesToInt16(arr[idx+5],arr[idx+6]);
        output.gx[i] = bitflippin.bytesToInt16(arr[idx+7],arr[idx+8]);
        output.gy[i] = bitflippin.bytesToInt16(arr[idx+9],arr[idx+10]);
        output.gz[i] = bitflippin.bytesToInt16(arr[idx+11],arr[idx+12]);
    }

    return output;
}

export const mpu6050ChartSettings:Partial<WebglLinePlotProps> = {
    lines:{
        'ax':{nSec:10, sps:100},
        'ay':{nSec:10, sps:100},
        'az':{nSec:10, sps:100},
        'gx':{nSec:10, sps:100},
        'gy':{nSec:10, sps:100},
        'gz':{nSec:10, sps:100},
        'temp':{nSec:10, sps:5}
    }
}