import { WebglLinePlotProps } from '../../../BrainsAtPlay_Libraries/webgl-plot-utils/webgl-plot-utils';
import { FilterSettings } from '../BiquadFilters';
import {ads131m08codec, ads131m08ChartSettings, ads131m08FilterSettings} from './ads131m08';
import {cytoncodec, cytonChartSettings, cytonFilterSettings} from './cyton';
import {freeeeg128codec, freeeeg128ChartSettings, freeeeg128FilterSettings} from './freeeeg128';
import {freeeeg32codec, freeeeg32ChartSettings, freeeeg32FilterSettings} from './freeeeg32';
import {hegduinocodec, hegduinoChartSettings} from './hegduino';
import { max3010xcodec, max3010xChartSettings } from './max30102';
import { mpu6050codec, mpu6050ChartSettings } from './mpu6050';
import { cognixionONE_EEG_codec, cognixionONEChartSettings, cognixionONEFilterSettings } from './cognixionONE';
import { peanutcodec, peanutChartSettings } from './peanut';
import { nrf5x_usbcodec, nrf5x_usbChartSettings, nrf5x_usbFilterSettings } from './nrf5x_usb';
import { statechangerChartSettings, statechangercodec } from './statechanger';

const textdecoder = new TextDecoder();

export const decoders:any = {
    'raw':(data:any) => { if(data?.buffer) return Array.from(new Uint8Array(data)); else return data; },
    'utf8':(data:any) => { return textdecoder.decode(data); },
    'console-f12':(data:any) => { if(data?.buffer) data = Array.from(new Uint8Array(data)); console.log(data); return data; },
    'debug':(data:any,debugmessage:string) => { if(data?.buffer) data = Array.from(new Uint8Array(data)); console.log(debugmessage,data); return data; },
    'ads131m08':ads131m08codec,
    'max3010x':max3010xcodec,
    'mpu6050':mpu6050codec,
    'freeeeg32':freeeeg32codec, //https://github.com/joshbrew/freeeeg32.js
    'freeeeg128':freeeeg128codec,
    'cyton':cytoncodec, //https://github.com/joshbrew/cyton.js
    'cognixionONE_BLE':cognixionONE_EEG_codec, //see the super secret docs
    'hegduino':hegduinocodec, //https://github.com/joshbrew/hegduino.js -- incl check for android (3 outputs only) output
    //'peanut':peanutcodec //https://github.com/joshbrew/peanutjs/blob/main/peanut.js
    'nrf5x_usb':nrf5x_usbcodec,
    'peanut':peanutcodec,
    'statechanger':statechangercodec
    //...custom?
}

export const defaultChartSettings:any = {
    lines:{
        '0':{nPoints:1000}
    },
    generateNewLines:true,
    cleanGeneration:true
}


export const chartSettings:{[key:string]:Partial<WebglLinePlotProps>} = {
    'raw':defaultChartSettings,
    'utf8':defaultChartSettings,
    'console-f12':defaultChartSettings,
    'debug':defaultChartSettings,
    'ads131m08':ads131m08ChartSettings,
    'max3010x':max3010xChartSettings,
    'mpu6050':mpu6050ChartSettings,
    'freeeeg32':freeeeg32ChartSettings, //https://github.com/joshbrew/freeeeg32.js
    'freeeeg128':freeeeg128ChartSettings,
    'cyton':cytonChartSettings, //https://github.com/joshbrew/cyton.js
    'cognixionONE_BLE':cognixionONEChartSettings, //see the super secret docs
    'hegduino':hegduinoChartSettings, //https://github.com/joshbrew/hegduino.js -- incl check for android (3 outputs only) output
    //'peanut':{} //https://github.com/joshbrew/peanutjs/blob/main/peanut.js
    'nrf5x_usb':nrf5x_usbChartSettings,
    'statechanger':statechangerChartSettings,
    'peanut':peanutChartSettings
    //...custom?
}

export const filterPresets:{[key:string]:{[key:string]:FilterSettings}} = {
    'raw':undefined,
    'utf8':undefined,
    'console-f12':undefined,
    'debug':undefined,
    'ads131m08':ads131m08FilterSettings,
    'max3010x':undefined,
    'mpu6050':undefined,
    'freeeeg32':freeeeg32FilterSettings, //https://github.com/joshbrew/freeeeg32.js
    'freeeeg128':freeeeg128FilterSettings,
    'cyton':cytonFilterSettings, //https://github.com/joshbrew/cyton.js
    'cognixionONE_BLE':cognixionONEFilterSettings, //see the super secret docs
    'hegduino':undefined, //https://github.com/joshbrew/hegduino.js -- incl check for android (3 outputs only) output
    //'peanut':{} //https://github.com/joshbrew/peanutjs/blob/main/peanut.js
    'nrf5x_usb':nrf5x_usbFilterSettings,
    //...custom?
}

export const SerialOptions:any = { //default is \r\n or 0x0D,0x0A
    'nrf5x_usb': {
        buffering:{
            searchBytes:new Uint8Array([240,240])
        }
    },
    'peanut': {
        buffering:{
            searchBytes:new Uint8Array([170,170])
        }
    }
}


//todo: update number of points in a slider or something on the frontend, just set nSec and reinit the plot