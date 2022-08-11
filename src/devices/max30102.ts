import { WebglLinePlotProps } from "webgl-plot-utils";
import { bitflippin } from "../bitflippin";


//ctr byte, 2 24 bit numbers (18 bit actual) or 6 bytes x 32 samples per packet, then 2 die temp 
export function max3010xcodec(data:any) {
    let arr; 
    if(!data.buffer) arr = new Uint8Array(data);
    else arr = data;

    const output:any = {
        red:new Array(32),
        ir:new Array(32),
        dt:0
    };

    let i=0;
    while(i < 32) {
        output['red'][i] = bitflippin.bytesToUInt24(arr[i*6+1],arr[i*6+2],arr[i*6+3]);
        output['ir'][i] = bitflippin.bytesToUInt24(arr[i*6+4],arr[i*6+5],arr[i*6+6]);
        i++;
    }

    output['dt'] = bitflippin.get2sCompliment(arr[arr.length-4],8) + 0.0625 * arr[arr.length-3]

    return output;
}

export const max3010xChartSettings:Partial<WebglLinePlotProps> = {
    lines:{
        red:{nSec:10, sps:100},
        ir:{nSec:10, sps:100},
        dt:{nSec:10, sps:3.33}
    }
}