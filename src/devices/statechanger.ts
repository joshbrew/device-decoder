import { WebglLinePlotProps } from "webgl-plot-utils";

let textdecoder = new TextDecoder();

export const statechangerSerialSettings = {
    baudRate:115200
}
export const statechangerBLESettings = {
    primaryServiceUUIDs:[
        "6E400001-B5A3-F393-E0A9-E50E24DCCA9E".toLowerCase(),
        "6E400004-B5A3-F393-E0A9-E50E24DCCA9E".toLowerCase()
    ]
}

export function statechangercodec(value:any) {
    //hegduino format is utf8
    //Per line: timestamp, red, infrared, ratio, temperature
    let output = { //https://github.com/joshbrew/HEG_ESP32_Delobotomizer/blob/main/Firmware/MAX86141_HEG/MAX86141_HEG.h
        timestamp: 0,
        left_red: 0,
        left_infrared: 0,
        left_ratio: 0,
        center_red: 0,
        center_infrared: 0,
        center_ratio: 0,
        right_red: 0,
        right_infrared: 0,
        right_ratio: 0
    }

    let txt = textdecoder.decode(value);
    let line = txt.split('|'); //serial will stream in as utf8 lines, we use | separators
     if(line.length >= 5) {
        output.timestamp = parseInt(line[0]);
        output.left_red = parseInt(line[1]);
        output.left_infrared = parseInt(line[2]);
        output.left_ratio = parseFloat(line[3]);
        output.center_red = parseInt(line[4]);
        output.center_infrared = parseInt(line[5]);
        output.center_ratio = parseFloat(line[6]);
        output.right_red = parseInt(line[7]);
        output.right_infrared = parseInt(line[8]);
        output.right_ratio = parseFloat(line[9]);

        return output;

    } else return txt; //e.g. echoed commands or startup/crash messages
}

export const statechangerChartSettings:Partial<WebglLinePlotProps> = {
    lines:{
        left_red:{nSec:60, sps:20},
        left_infrared:{nSec:60, sps:20},
        left_ratio:{nSec:60, sps:20},
        center_red:{nSec:60, sps:20},
        center_infrared:{nSec:60, sps:20},
        center_ratio:{nSec:60, sps:20},
        right_red:{nSec:60, sps:20},
        right_infrared:{nSec:60, sps:20},
        right_ratio:{nSec:60, sps:20},
    }
}