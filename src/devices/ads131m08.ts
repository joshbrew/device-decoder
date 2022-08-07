
/**
 * 
 * ads131m08 BLE packet output for our board:
 * [0,1,2],[3,4,5],[6,7,8],[9,10,11],[12,13,14],[15,16,17],[19,19,20],[21,22,23], [24],  [25,26,27],... * 9 samples per packet, then \r\n
 *                                                             first 8 channels,  ctr,   next channel set
 * 
 */
import { WebglLinePlotProps } from "webgl-plot-utils";
import { FilterSettings } from "../BiquadFilters";
import { bitflippin } from "../bitflippin";

export function ads131m08codec(data:any) {
    let arr; 
    if(!data.buffer) arr = new Uint8Array(data);
    else arr = data;

    let output = {
        0:new Array(9),
        1:new Array(9),
        2:new Array(9),
        3:new Array(9),
        4:new Array(9),
        5:new Array(9),
        6:new Array(9),
        7:new Array(9)
    };

    for(let i = 0; i < 9; i++) { //hard coded packet iteration, 9 sample sets x 8 channels per packet 
        let j = i * 25; //every 25th byte is a counter so skip those
        output[0][i] = bitflippin.bytesToUInt24(arr[j],arr[j+1],arr[j+2]);
        output[1][i] = bitflippin.bytesToUInt24(arr[j+3],arr[j+4],arr[j+5]);
        output[2][i] = bitflippin.bytesToUInt24(arr[j+6],arr[j+7],arr[j+8]);
        output[3][i] = bitflippin.bytesToUInt24(arr[j+9],arr[j+10],arr[j+11]);
        output[4][i] = bitflippin.bytesToUInt24(arr[j+12],arr[j+13],arr[j+14]);
        output[5][i] = bitflippin.bytesToUInt24(arr[j+15],arr[j+16],arr[j+17]);
        output[6][i] = bitflippin.bytesToUInt24(arr[j+18],arr[j+19],arr[j+20]);
        output[7][i] = bitflippin.bytesToUInt24(arr[j+21],arr[j+22],arr[j+23]);
    }
    
    return output;
}

export const ads131m08ChartSettings:Partial<WebglLinePlotProps> = {
    lines:{
        '0':{nSec:10, sps:250},
        '1':{nSec:10, sps:250},
        '2':{nSec:10, sps:250},
        '3':{nSec:10, sps:250},
        '4':{nSec:10, sps:250},
        '5':{nSec:10, sps:250},
        '6':{nSec:10, sps:250},
        '7':{nSec:10, sps:250}
    }
}

let defaultsetting = {sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45, useScaling:true, scalar:1.2*32/(Math.pow(2,24)-1)};

export const ads131m08FilterSettings:{[key:string]:FilterSettings} = {
    '0':JSON.parse(JSON.stringify(defaultsetting)),
    '1':JSON.parse(JSON.stringify(defaultsetting)),
    '2':JSON.parse(JSON.stringify(defaultsetting)),
    '3':JSON.parse(JSON.stringify(defaultsetting)),
    '4':JSON.parse(JSON.stringify(defaultsetting)),
    '5':JSON.parse(JSON.stringify(defaultsetting)),
    '6':JSON.parse(JSON.stringify(defaultsetting)),
    '7':JSON.parse(JSON.stringify(defaultsetting))
}