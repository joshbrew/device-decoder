import { WebglLinePlotProps } from 'webgl-plot-utils';
import { FilterSettings } from '../BiquadFilters';
import { ads131m08codec } from './ads131m08';
import { max3010xcodec } from './max30102';
import { mpu6050codec } from './mpu6050';

export function nrf5x_usbcodec(data:any) {
    let arr:Uint8Array; 
    if(!data.buffer) arr = new Uint8Array(data); 
    else arr = data as Uint8Array;
    //head of each byte packet is the search byte //240,240
    //packetID: 2: ads131m08 1, 3: ads131m08 2, 4: MPU6050, 5: MAX30102

    const output:any = {};

    if(arr[0] === 2) {
        Object.assign(output,ads131m08codec(arr.subarray(2)));
    } else if (arr[0] === 3) {
        let result = ads131m08codec(arr.subarray(2));
        Object.keys(result).forEach((key,i) => {
            output[i+8] = result[key];
        })
    } else if (arr[0] === 4) {
        Object.assign(output,mpu6050codec(arr.subarray(2)));
    } else if (arr[0] === 5) {
        Object.assign(output,max3010xcodec(arr.subarray(2)));
    } else {
        Object.assign(output,ads131m08codec(arr));
    }

    return output;
}

export const nrf5x_usbChartSettings:Partial<WebglLinePlotProps> = {
    lines:{
        '0':{nPoints:1000}
    },
    generateNewLines:true,
    cleanGeneration:false
}


export const nrf5x_usbFilterSettings:{[key:string]:FilterSettings} = {
    '0':{sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '1':{sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '2':{sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '3':{sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '4':{sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '5':{sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '6':{sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '7':{sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '8':{sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '9':{sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '10':{sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '11':{sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '12':{sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '13':{sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '14':{sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '15':{sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45}
}