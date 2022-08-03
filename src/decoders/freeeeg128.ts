import { bitflippin } from "../bitflippin";

//128 channels x 3 bytes per channel each line, plus 6x2 bytes for the IMU. First byte is counter byte;
export default function freeeeg128codec(value:ArrayBuffer) {
    let arr = new Uint8Array(value); //convert to uint8array

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