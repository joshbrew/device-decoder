
import { WebglLinePlotProps } from "webgl-plot-utils";
import { FilterSettings } from "../util/BiquadFilters";
import { ByteParser } from "../util/ByteParser";

//16 channels x 3 bytes per channel each line, plus 6x2 bytes for the IMU. First byte is counter byte;
export function freeeeg16codec(data:any) {
    let arr; 
    if((data as DataView).getInt8) arr = new Uint8Array(data.buffer);
    else if(!data.buffer) arr = new Uint8Array(data);
    else arr = data;

    let output:any = {};

    for(let i = 0; i < 16; i++) {
        let idx = i*3+1;
        output[i] = ByteParser.bytesToInt24(arr[idx],arr[idx+1],arr[idx+2]);
    }

    let accIdx = 16*3+1; 
    output['ax'] = ByteParser.bytesToInt16(arr[accIdx],arr[accIdx+1]);
    output['ay'] = ByteParser.bytesToInt16(arr[accIdx+2],arr[accIdx+3]);
    output['az'] = ByteParser.bytesToInt16(arr[accIdx+4],arr[accIdx+5]);
    output['gx'] = ByteParser.bytesToInt16(arr[accIdx+6],arr[accIdx+7]);
    output['gy'] = ByteParser.bytesToInt16(arr[accIdx+8],arr[accIdx+9]);
    output['gz'] = ByteParser.bytesToInt16(arr[accIdx+10],arr[accIdx+11]);
    output.timestamp = Date.now();

    return output;
}

//16 channels x 3 bytes per channel each line, plus 6x2 bytes for the IMU. First byte is counter byte;
let BLEBuffer = [];

let locked;
let lockIdx;
export function freeeeg16BLEcodec(data:any) {
    let arr; 
    if((data as DataView).getInt8) arr = new Uint8Array(data.buffer);
    else if(!data.buffer) arr = new Uint8Array(data);
    else arr = data;

    BLEBuffer.push(...data);

    const needle = new Uint8Array([192,160]);
    const haystack = BLEBuffer;
    const search = ByteParser.boyerMoore(needle);
    const skip = search.byteLength;
    let nextIndex = -1;

    let used = lockIdx ?? 0;

    let pass = false;

    for (var i = search(haystack); i !== -1; i = search(haystack, i + skip)) {

        if(!locked && !(typeof lockIdx === 'number')) used = lockIdx = i;
        else {

            nextIndex = i;
            if(nextIndex >= 0) {
                const len = nextIndex - used;        
                if(!lockIdx) {
                    const line = BLEBuffer.splice(lockIdx, len)
                    arr = new Uint8Array(line.slice(needle.length))
                    pass = true;
                    locked = true;
                }
                else if(len > 0) {
                    const line = BLEBuffer.splice(lockIdx, len)
                    arr = new Uint8Array(line.slice(needle.length))
                    pass = true;
                }
                used = nextIndex;
            }
        }

    }

    if(pass) {
        let output:any = {};

        for(let i = 0; i < 16; i++) {
            let idx = i*3+1;
            output[i] = ByteParser.bytesToInt24(arr[idx],arr[idx+1],arr[idx+2]);
        }
    
        let accIdx = 16*3+1; 
        output['ax'] = ByteParser.bytesToInt16(arr[accIdx],arr[accIdx+1]);
        output['ay'] = ByteParser.bytesToInt16(arr[accIdx+2],arr[accIdx+3]);
        output['az'] = ByteParser.bytesToInt16(arr[accIdx+4],arr[accIdx+5]);
        output['gx'] = ByteParser.bytesToInt16(arr[accIdx+6],arr[accIdx+7]);
        output['gy'] = ByteParser.bytesToInt16(arr[accIdx+8],arr[accIdx+9]);
        output['gz'] = ByteParser.bytesToInt16(arr[accIdx+10],arr[accIdx+11]);
        output.timestamp = Date.now();
    
        return output;
    }
    else return undefined;
}

const sps = 250; //or 83.333 in global chop mode


export const freeeeg16BLESettings = {
    deviceType:'BLE',
    deviceName:'freeeeg16',
    services:{
        ["6E400001-B5A3-F393-E0A9-E50E24DCCA9E".toLowerCase()]:{ //SERVICE_UUID -- for data
            '6e400002-b5a3-f393-e0a9-e50e24dcca9e':{ //write //CHARACTERISTIC_UUID_RX
                write:undefined
            },
            '6e400003-b5a3-f393-e0a9-e50e24dcca9e':{ //CHARACTERISTIC_UUID_TX
                notify:true,
                notifyCallback:undefined, //define this before initializing
                codec:freeeeg16BLEcodec,
                sps
            } //notify
        },
    }
}


export const freeeeg16SerialSettings = {
    deviceType:'USB',
    deviceName:'freeeeg16',
    baudRate:115200, // baud
    bufferSize:2000,
    frequency:3.5, //250sps
    codec:freeeeg16codec,
    sps, 
    buffering:{
        searchBytes:new Uint8Array([192,160]),
    }

}


const defaultChartSetting = {nSec:10, sps}
export const freeeeg16ChartSettings:Partial<WebglLinePlotProps> = {  //adding the rest below
    lines:{
        'ax':JSON.parse(JSON.stringify(defaultChartSetting)),
        'ay':JSON.parse(JSON.stringify(defaultChartSetting)),
        'az':JSON.parse(JSON.stringify(defaultChartSetting)),
        'gx':JSON.parse(JSON.stringify(defaultChartSetting)),
        'gy':JSON.parse(JSON.stringify(defaultChartSetting)),
        'gz':JSON.parse(JSON.stringify(defaultChartSetting))
    }
}

export const freeeeg16FilterSettings:{[key:string]:FilterSettings} = { }


const gain = 32;
const nbits = 24;
const vref = 1.2;

for(let i = 0; i < 16; i++) {
    freeeeg16FilterSettings.lines[i] = {sps, nSec:10, units:'mV'};
    freeeeg16FilterSettings[i] = {
        sps, 
        useDCBlock:true, 
        useBandpass:true, 
        bandpassLower:3, 
        bandpassUpper:45, 
        useScaling:true, 
        scalar:0.96 * 1000*vref/(gain*(Math.pow(2,nbits)-1))
    }; //alternative is 250sps and 32x gain
}