import { WebglLinePlotProps } from 'webgl-plot-utils';
import { FilterSettings } from '../util/BiquadFilters';
import { ads131m08codec } from './ads131m08';
import { max3010xcodec } from './max30102';
import { mpu6050codec } from './mpu6050';
import { bme280codec } from './bme280';

export function nrf5x_usbcodec(data:any) {
    let arr:Uint8Array; 
    if((data as DataView).getInt8) arr = new Uint8Array(data.buffer);
    else if(!data.buffer) arr = new Uint8Array(data);
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
        //Object.assign(output,max3010xcodec(arr.subarray(1)));
        Object.assign(output,max3010xcodec(arr.subarray(2)));
    } else if (arr[0] === 6) {
        Object.assign(output,bme280codec(arr.subarray(2)));
    } else {
        Object.assign(output,ads131m08codec(arr));
    }

    return output;
}

export const nrf5xSerialSettings = {
    baudRate:115200,
    buffering:{
        searchBytes:new Uint8Array([240,240])
    },
    codec:nrf5x_usbcodec,
    sps:250 //base eeg/emg sps, peripheral sensors are different
}

export const nrf5xBLESettings = {
    sps:250, //base eeg/emg sps, peripheral sensors are different
    services:{
        '0000cafe-b0ba-8bad-f00d-deadbeef0000':{
            '0001cafe-b0ba-8bad-f00d-deadbeef0000':{
                write:undefined
            },
            '0002cafe-b0ba-8bad-f00d-deadbeef0000':{ //ads131m08
                notify:true,
                notifyCallback:undefined,
                codec:ads131m08codec,
                sps:250
            },
            '0003cafe-b0ba-8bad-f00d-deadbeef0000':{ //max30102
                notify:true,
                notifyCallback:undefined,
                codec:max3010xcodec,
                sps:100
            },
            '0004cafe-b0ba-8bad-f00d-deadbeef0000':{ //mpu6050
                notify:true,
                notifyCallback:undefined,
                codec:mpu6050codec,
                sps:100
            },
            '0005cafe-b0ba-8bad-f00d-deadbeef0000':{ //ads131m08-2
                notify:true,
                notifyCallback:undefined,
                codec:ads131m08codec,
                sps:250
            },
            '0006cafe-b0ba-8bad-f00d-deadbeef0000':{ //bme280
                notify:true,
                notifyCallback:undefined,
                codec:bme280codec,
                sps:3.33
            }
        }// each notification is for a different sensor
    }
}

const defaultChartSetting = {nSec:10, sps:250, units:'mV'}
export const nrf5x_usbChartSettings:Partial<WebglLinePlotProps> = {
    lines:{
        '0':JSON.parse(JSON.stringify(defaultChartSetting)),
        '1':JSON.parse(JSON.stringify(defaultChartSetting)),
        '2':JSON.parse(JSON.stringify(defaultChartSetting)),
        '3':JSON.parse(JSON.stringify(defaultChartSetting)),
        '4':JSON.parse(JSON.stringify(defaultChartSetting)),
        '5':JSON.parse(JSON.stringify(defaultChartSetting)),
        '6':JSON.parse(JSON.stringify(defaultChartSetting)),
        '7':JSON.parse(JSON.stringify(defaultChartSetting))
    },
    generateNewLines:true,
    cleanGeneration:false
}


const gain = 32;
const nbits = 24;
const vref = 1.2;

let defaultsetting = {
    sps:250, 
    useDCBlock:false, 
    useBandpass:false, 
    bandpassLower:3, 
    bandpassUpper:45, 
    useScaling:true, 
    scalar:0.96 * 1000*vref/(gain*(Math.pow(2,nbits)-1)),
};

export const nrf5x_usbFilterSettings:{[key:string]:FilterSettings} = {
    '0':JSON.parse(JSON.stringify(defaultsetting)),
    '1':JSON.parse(JSON.stringify(defaultsetting)),
    '2':JSON.parse(JSON.stringify(defaultsetting)),
    '3':JSON.parse(JSON.stringify(defaultsetting)),
    '4':JSON.parse(JSON.stringify(defaultsetting)),
    '5':JSON.parse(JSON.stringify(defaultsetting)),
    '6':JSON.parse(JSON.stringify(defaultsetting)),
    '7':JSON.parse(JSON.stringify(defaultsetting)),
    '8':JSON.parse(JSON.stringify(defaultsetting)),
    '9':JSON.parse(JSON.stringify(defaultsetting)),
    '10':JSON.parse(JSON.stringify(defaultsetting)),
    '11':JSON.parse(JSON.stringify(defaultsetting)),
    '12':JSON.parse(JSON.stringify(defaultsetting)),
    '13':JSON.parse(JSON.stringify(defaultsetting)),
    '14':JSON.parse(JSON.stringify(defaultsetting)),
    '15':JSON.parse(JSON.stringify(defaultsetting))
}