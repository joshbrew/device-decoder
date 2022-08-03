import { bitflippin } from "../bitflippin";


//2 24 bit numbers (18 bit actual) or 6 bytes x 32 samples per packet, then 2 die temp 
export function max3010xcodec(data:any) {
    let arr; 
    if(!data.buffer) arr = new Uint8Array(data);
    else arr = data;

    const output:any = {
        red:new Array(32),
        ir:new Array(32),
        temp:0
    };

    let i;
    while(i < 32) {
        output['red'][i*6] = bitflippin.bytesToInt24(arr[i*6],arr[i*6+1],arr[i*6+2]);
        output['ir'][i*6] = bitflippin.bytesToInt24(arr[i*6+3],arr[i*6+4],arr[i*6+5]);
        i+=6;
    }

    output['temp'] = bitflippin.bytesToInt16(arr[192],arr[193]);

    return output;
}

export const max3010xChartSettings = {
    lines:{
        red:{nSec:10, sps:100},
        ir:{nSec:10, sps:100},
        temp:{nSec:10, sps:3.33}
    }
}