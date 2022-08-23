import { WebglLinePlotProps } from "webgl-plot-utils";
import { BLEDeviceOptions } from "../ble/ble_client";

export function blueberryshortcodec(value:DataView) {

    let output:any = {
        sred: value.getInt32(2),
        sir: value.getInt32(6),
        sir2: value.getInt32(10)
    }

    output.sheg = output.sred / (0.5*(output.sir + output.sir2));

    return output;
}

export function blueberrylongcodec(value:DataView) {

    let output:any = {
        red: value.getInt32(2),
        ir: value.getInt32(6),
        ir2: value.getInt32(10)
    }

    output.heg = output.sred / (0.5*(output.ir + output.ir2));

    return output;
}

export const blueberry2BLESettings = {
    namePrefix:'blueberry',
    services:{
        '0f0e0d0c-0b0a-0908-0706-050403020100':{
            '1f1e1d1c-1b1a-1918-1716-151413121110':{
                write:undefined //new Uint8Array([0xA0],[redValue], [greenValue], [blueValue]); //for rgb controller
            },
            '4f4e4d4c-4b6a-6968-6766-656463426160':{
                notify:true,
                notifyCallback:undefined,
                codec:blueberrylongcodec
            }, //long channel
            '4f4e4d4c-4b5a-5958-5756-555453425150':{
                notify:true,
                notifyCallback:undefined,
                codec:blueberryshortcodec
            } //short channel
            
        }
    }
} as BLEDeviceOptions


export const blueberry2ChartSettings:Partial<WebglLinePlotProps> = {
    lines:{
        red:{nSec:60, sps:40},
        ir:{nSec:60, sps:40},
        ir2:{nSec:60, sps:40},
        heg:{nSec:60, sps:40},
        sred:{nSec:60, sps:40},
        sir:{nSec:60, sps:40},
        sir2:{nSec:60, sps:40},
        sheg:{nSec:60, sps:40}
    }
}