import { ads131m08codec } from './ads131m08';
import { mpu6050codec } from './mpu6050';

export function nrf5x_usbcodec(data:any) {
    let arr; 
    if(!data.buffer) arr = new Uint8Array(data);
    else arr = data;
    //head of each byte packet is the search byte //240,240
    //packetID: 2: ads131m08 1, 3: ads131m08 2, 4: MPU6050, 5: MAX30102

    const output:any = {};

    if(arr[0] === 2) {
        Object.assign(output,ads131m08codec(data));
    } else if (arr[0] === 3) {
        let result = ads131m08codec(data);
        Object.keys(result).forEach((key,i) => {
            output[i+8] = result[key];
        })
    } else if (arr[0] === 4) {
        Object.assign(output,mpu6050codec(data));
    } else if (arr[0] === 5) {
        //Object.assign(output,max3010xcodec(data));
    }
}

export const nrf5x_usbChartSettings = {
    lines:{
        '0':{nPoints:1000}
    },
    generateNewLines:true,
    cleanGeneration:false
}