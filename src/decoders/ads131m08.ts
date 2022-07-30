
/**
 * 
 * ads131m08 BLE packet output for our board:
 * [0,1,2],[3,4,5],[6,7,8],[9,10,11],[12,13,14],[15,16,17],[19,19,20],[21,22,23],[24],[25,26,27],... * 9, then 0x0A, 0x0D
 * 
 * 
 */
import { bitflippin } from "../bitflippin";

export default function ads131m08codec(value:ArrayBuffer) {
    let arr = new Uint8Array(value); //convert to uint8array

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

    for(let i = 0; i < 9; i++) { //hard coded packet iteration
        let j = i * 25;
        output[0][i] = bitflippin.bytesToInt24(arr[j],arr[j+1],arr[j+2]);
        output[1][i] = bitflippin.bytesToInt24(arr[j+3],arr[j+4],arr[j+5]);
        output[2][i] = bitflippin.bytesToInt24(arr[j+6],arr[j+7],arr[j+8]);
        output[3][i] = bitflippin.bytesToInt24(arr[j+9],arr[j+10],arr[j+11]);
        output[4][i] = bitflippin.bytesToInt24(arr[j+12],arr[j+13],arr[j+14]);
        output[5][i] = bitflippin.bytesToInt24(arr[j+15],arr[j+16],arr[j+17]);
        output[6][i] = bitflippin.bytesToInt24(arr[j+18],arr[j+19],arr[j+20]);
        output[7][i] = bitflippin.bytesToInt24(arr[j+21],arr[j+22],arr[j+23]);
    }
    
    return output;
}