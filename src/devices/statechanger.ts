import { WebglLinePlotProps } from "webgl-plot-utils";
import { BLEDeviceOptions } from "../ble/ble_client";

let textdecoder = new TextDecoder();


export function statechangercodec(value:any) {
    //statechanger format is utf8
    //Per line: timestamp, lred, linfrared, lheg, cred, cir, cheg, rred, rir, rheg
    let output = { //https://github.com/joshbrew/HEG_ESP32_Delobotomizer/blob/main/Firmware/MAX86141_HEG/MAX86141_HEG.h
        timestamp: 0,
        left_red: 0,
        left_infrared: 0,
        left_heg: 0,
        center_red: 0,
        center_infrared: 0,
        center_heg: 0,
        right_red: 0,
        right_infrared: 0,
        right_heg: 0
    }

    let txt = textdecoder.decode(value);
    let line = txt.split('|'); //serial will stream in as utf8 lines, we use | separators
    if(line.length >= 5) {
        //output.timestamp = parseInt(line[0]);
        output.timestamp = Date.now();
        output.left_red = parseInt(line[1]);
        output.left_infrared = parseInt(line[2]);
        output.left_heg = parseFloat(line[3]);
        output.center_red = parseInt(line[4]);
        output.center_infrared = parseInt(line[5]);
        output.center_heg = parseFloat(line[6]);
        output.right_red = parseInt(line[7]);
        output.right_infrared = parseInt(line[8]);
        output.right_heg = parseFloat(line[9]);

        return output;

    } else return txt; //e.g. echoed commands or startup/crash messages
}

export const statechangerSerialSettings = {
    baudRate:115200,
    codec:statechangercodec
}

export const statechangerBLESettings = {
    services:{
        ["6E400001-B5A3-F393-E0A9-E50E24DCCA9E".toLowerCase()]:{ //SERVICE_UUID -- for data
            '6e400002-b5a3-f393-e0a9-e50e24dcca9e':{ //write //CHARACTERISTIC_UUID_RX
                write:'t' //inits on old firwmare 
            },
            '6e400003-b5a3-f393-e0a9-e50e24dcca9e':{ //CHARACTERISTIC_UUID_TX
                notify:true,
                notifyCallback:undefined, //define this before initializing
                codec:statechangercodec
            } //notify
        },
        ['6E400004-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase()]:{ //SERVICE_UUID_OTA -- for updating
            ['6E400005-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase()]:{ //CHARACTERISTIC_UUID_ID
                read:true
            },
            ['6E400006-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase()]:{ //CHARACTERISTIC_UUID_FW
                write:undefined,
                notify:true,
                notifyCallback:undefined
            },
            ['6E400007-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase()]:{ //CHARACTERISTIC_UUID_HW_VERSION
                read:true                
            }     
        },
    },
    androidWebBLE:'o' //shortens the byte stream for android web ble compatibility (ugh)
} as BLEDeviceOptions

export const statechangerChartSettings:Partial<WebglLinePlotProps> = {
    lines:{
        left_red:{nSec:60, sps:20},
        left_infrared:{nSec:60, sps:20},
        left_heg:{nSec:60, sps:20},
        center_red:{nSec:60, sps:20},
        center_infrared:{nSec:60, sps:20},
        center_heg:{nSec:60, sps:20},
        right_red:{nSec:60, sps:20},
        right_infrared:{nSec:60, sps:20},
        right_heg:{nSec:60, sps:20},
    }
}

//todo: command protocols