import { WebglLinePlotProps } from "webgl-plot-utils";
import { ByteParser } from "../util/ByteParser";


//ctr byte, 2 24 bit numbers (18 bit actual) or 6 bytes x 32 samples per packet, then 2 die temp 
export function max3010xcodec(data:any) {
    let arr; 
    if((data as DataView).getInt8) arr = new Uint8Array(data.buffer);
    else if(!data.buffer) arr = new Uint8Array(data);
    else arr = data;

    const output:any = {
        'red':new Array(32),
        'ir':new Array(32),
        'max_dietemp':ByteParser.get2sCompliment(arr[193],8) + 0.0625 * arr[194],
        'timestamp': Date.now()
    };

    let i=0;
    while(i < 32) {
        let idx = i*6;
    
        // output['red'][i] = (arr[idx+1] << 16 | arr[idx+2] << 8 | arr[idx+3]) & 0x7FFFF;
        // output['ir'][i] = (arr[idx+4] << 16 | arr[idx+5] << 8 | arr[idx+6]) & 0x7FFFF;
        //temp fix till underlying driver is resolved
        if(i%2 === 0) {
            output['ir'][i] = (arr[idx+1] << 16 | arr[idx+2] << 8 | arr[idx+3]) & 0x7FFFF;
            output['ir'][i+1] = (arr[idx+4] << 16 | arr[idx+5] << 8 | arr[idx+6]) & 0x7FFFF;
        } else {
            output['red'][i-1] = (arr[idx+1] << 16 | arr[idx+2] << 8 | arr[idx+3]) & 0x7FFFF;
            output['red'][i] = (arr[idx+4] << 16 | arr[idx+5] << 8 | arr[idx+6]) & 0x7FFFF;
        }
        
        i++;
    }

    return output;
}

export const max3010xChartSettings:Partial<WebglLinePlotProps> = {
    lines:{
        'red':{nSec:10, sps:100},
        'ir':{nSec:10, sps:100},
        'max_dietemp':{nSec:10, sps:3.33, units:'C'} //1 read per
    }
}