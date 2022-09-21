import { WebglLinePlotProps } from 'webgl-plot-utils';
import { FilterSettings } from '../util/BiquadFilters';
import {ads131m08codec, ads131m08ChartSettings, ads131m08FilterSettings, ads131m08_arduinocodec} from './ads131m08';
import {cytoncodec, cytonChartSettings, cytonFilterSettings, cytonSerialSettings} from './cyton';
import {freeeeg128codec, freeeeg128ChartSettings, freeeeg128FilterSettings, freeeeg128SerialSettings} from './freeeeg128';
import {freeeeg32codec, freeeeg32ChartSettings, freeeeg32FilterSettings, freeeeg32SerialSettings, freeeeg32_optical_SerialSettings} from './freeeeg32';
import {hegduinocodec, hegduinoChartSettings, hegduinoBLESettings, hegduinoSerialSettings, hegduinoV2FilterSettings, hegduinoV1FilterSettings, hegduinoV1SerialSettings, hegduinoV1BLESettings} from './hegduino';
import { max3010xcodec, max3010xChartSettings } from './max30102';
import { mpu6050codec, mpu6050ChartSettings } from './mpu6050';
import { cognixionONE_EEG_codec, cognixionONEChartSettings, cognixionONEFilterSettings, cognixionONEBLESettings } from './cognixionONE';
import { peanutcodec, peanutChartSettings, peanutSerialSettings } from './peanut';
import { nrf5x_usbcodec, nrf5x_usbChartSettings, nrf5x_usbFilterSettings, nrf5xBLESettings, nrf5xSerialSettings } from './nrf5x_usb';
import { statechangerBLESettings, statechangerChartSettings, statechangercodec, statechangerSerialSettings } from './statechanger';
//import { museSettings, museChartSettings } from './third_party/muse';
import { blueberryBLESettings, blueberryChartSettings, blueberrycodec } from './blueberry';
import { blueberry2BLESettings, blueberry2ChartSettings } from './blueberry2';
import { 
    //ganglionSettings, 
    ganglionFilterSettings, 
    ganglionChartSettings 
} from './third_party/ganglion';
import {
    museChartSettings,
    museFilterSettings
} from './third_party/muse'


import { heartRateBLESettings, hrcodec } from './genericBLE';
import { bme280codec } from './bme280';
import { simulatorSettings } from './simulator';

//containe unique (non-default) BLE and Serial device connection settings + codecs to parse key:value pairs from streamed data channels
export const Devices = {
    BLE:{
        'nrf5x':nrf5xBLESettings,
        'hegduino':hegduinoBLESettings,
        'hegduinoV1':hegduinoV1BLESettings,
        'cognixionONE':cognixionONEBLESettings,
        'statechanger':statechangerBLESettings,
        'blueberry':blueberryBLESettings,
        'blueberry2':blueberry2BLESettings,
        'heart_rate':heartRateBLESettings
    },
    USB:{
        'nrf5x':nrf5xSerialSettings,
        'freeEEG32':freeeeg32SerialSettings,
        'freeEEG32_optical':freeeeg32_optical_SerialSettings,
        'freeEEG128':freeeeg128SerialSettings,
        'hegduino':hegduinoSerialSettings,
        'hegduinoV1':hegduinoV1SerialSettings,
        'cyton':cytonSerialSettings,
        'cyton_daisy':cytonSerialSettings,
        'peanut':peanutSerialSettings,
        'statechanger':statechangerSerialSettings,
        'cognixionONE':cytonSerialSettings
    },
    BLE_OTHER : {
        //muse:museSettings, //these are bloated so we will separate dists
        //ganglion:ganglionSettings
    },
    USB_OTHER : {},
    OTHER : {
        'simulator':simulatorSettings
    }
};

export const defaultChartSettings:any = {
    lines:{
        '0':{nPoints:1000}
    },
    generateNewLines:true,
    cleanGeneration:true
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
    'hegduino':hegduinoV2FilterSettings, //https://github.com/joshbrew/hegduino.js -- incl check for android (3 outputs only) output
    'hegduinoV1':hegduinoV1FilterSettings, //https://github.com/joshbrew/hegduino.js -- incl check for android (3 outputs only) output
    //'peanut':{} //https://github.com/joshbrew/peanutjs/blob/main/peanut.js
    'nrf5x':nrf5x_usbFilterSettings,
    'ganglion':ganglionFilterSettings,
    'muse':museFilterSettings,
    'arduino_ads131m08':ads131m08FilterSettings
    //...custom?
}

//this is for our debugger but provides a good model to build applications off of that have diverse device support
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
    'hegduinoV1':hegduinoChartSettings, //https://github.com/joshbrew/hegduino.js -- incl check for android (3 outputs only) output
    //'peanut':{} //https://github.com/joshbrew/peanutjs/blob/main/peanut.js
    'nrf5x':nrf5x_usbChartSettings,
    'statechanger':statechangerChartSettings,
    'peanut':peanutChartSettings,
    'blueberry':blueberryChartSettings,
    'blueberry2':blueberry2ChartSettings,
    'ganglion':ganglionChartSettings,
    'muse':museChartSettings,
    'arduino_ads131m08':ads131m08ChartSettings,
    'simulator':defaultChartSettings
    //...custom?
}

//settings for device_debugger
const textdecoder = new TextDecoder();

//decoders to transform any raw outputs not specified to a device
export const decoders:any = {
    'raw':(data:any) => { if(data?.buffer) return Array.from(new Uint8Array(data)); else return data; },
    'utf8':(data:any) => { return textdecoder.decode(data); },
    'console-f12':(data:any) => { if(data?.buffer) data = Array.from(new Uint8Array(data)); console.log(data); return data; },
    'debug':(data:any,debugmessage:string) => { if(data?.buffer) data = Array.from(new Uint8Array(data)); console.log(debugmessage,data); return data; },
    'ads131m08':ads131m08codec,
    'arduino_ads131m08':ads131m08_arduinocodec,
    'max3010x':max3010xcodec,
    'mpu6050':mpu6050codec,
    'bme280':bme280codec,
    'freeeeg32':freeeeg32codec, ///old code: https://github.com/joshbrew/freeeeg32.js
    'freeeeg128':freeeeg128codec,
    'cyton':cytoncodec, ///old code: https://github.com/joshbrew/cyton.js
    'cognixionONE_BLE':cognixionONE_EEG_codec, //see the super secret docs
    'hegduino':hegduinocodec, //old code: https://github.com/joshbrew/hegduino.js -- incl check for android (3 outputs only) output
    'nrf5x':nrf5x_usbcodec,
    'peanut':peanutcodec, //old code: https://github.com/joshbrew/peanutjs/blob/main/peanut.js
    'statechanger':statechangercodec,
    'blueberry':blueberrycodec,
    'heart_rate':hrcodec
    //...custom?
}


//todo: update number of points in a slider or something on the frontend, just set nSec and reinit the plot

