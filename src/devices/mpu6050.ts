import { bitflippin } from "../bitflippin";


//Packet format: ctr byte , 20 samples x 12 bytes , 16 bit die temp 
export function mpu6050codec(data:any) {
    let arr; 
    if(!data.buffer) arr = new Uint8Array(data);
    else arr = data;

    let output = {
        'ax':new Array(20),
        'ay':new Array(20),
        'az':new Array(20),
        'gx':new Array(20),
        'gy':new Array(20),
        'gz':new Array(20),
        'dt':bitflippin.bytesToInt16(arr[241],arr[242]) //die temp
    }

    for(let i = 0; i < 20; i++) {
        output.ax[i] = bitflippin.bytesToInt16(arr[i*12+1],arr[i*12+2]);
        output.ay[i] = bitflippin.bytesToInt16(arr[i*12+3],arr[i*12+4]);
        output.az[i] = bitflippin.bytesToInt16(arr[i*12+5],arr[i*12+6]);
        output.gx[i] = bitflippin.bytesToInt16(arr[i*12+7],arr[i*12+8]);
        output.gy[i] = bitflippin.bytesToInt16(arr[i*12+9],arr[i*12+10]);
        output.gz[i] = bitflippin.bytesToInt16(arr[i*12+11],arr[i*12+12]);
    }

    return output;
}

export const mpu6050ChartSettings = {
    lines:{
        'ax':{nSec:10, sps:100},
        'ay':{nSec:10, sps:100},
        'az':{nSec:10, sps:100},
        'gx':{nSec:10, sps:100},
        'gy':{nSec:10, sps:100},
        'gz':{nSec:10, sps:100},
        'dt':{nSec:10, sps:5}
    }
}