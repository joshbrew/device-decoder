import { WebglLinePlotProps } from "webgl-plot-utils";
import { BLEDeviceOptions } from "../ble/ble_client";

export function blueberrycodec(value:DataView) {

    let output:any = {
        red: value.getInt32(2),
        ir: value.getInt32(6),
        ir2: value.getInt32(10),
        timestamp: Date.now()
    }

    output.heg = output.red / (0.5*(output.ir + output.ir2));

    return output;
}

const sps = 40; //default sample rate.

export const blueberryBLESettings = {
    namePrefix:'blueberry',
    services:{
        '0f0e0d0c-0b0a-0908-0706-050403020100':{
            '1f1e1d1c-1b1a-1918-1716-151413121110':{
                write:undefined //new Uint8Array([0xA0],[redValue], [greenValue], [blueValue]); //for rgb controller
            },
            '3f3e3d3c-3b3a-3938-3736-353433323130':{
                notify:true,
                notifyCallback:undefined,
                codec:blueberrycodec,
                sps
            }
        }
    },
    sps
} as BLEDeviceOptions


export const blueberryChartSettings:Partial<WebglLinePlotProps> = {
    lines:{
        red:{nSec:60, sps},
        ir:{nSec:60,  sps},
        ir2:{nSec:60, sps},
        heg:{nSec:60, sps}
    }
}