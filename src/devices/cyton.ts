
import { WebglLinePlotProps } from "webgl-plot-utils";
import { FilterSettings } from "../util/BiquadFilters";
import { ByteParser } from "../util/ByteParser";
import { SerialDeviceSettings } from "./types";

const accScale = 0.002 / Math.pow(2, 4)

const getAcc = (arr, output, channels=8) => {
    const accIdx = channels*3 + 1
    const sum = (a: number, b: number) => a + b
    const accSum = arr.slice(accIdx).reduce(sum, 0)
    if (accSum !== 0) {
        output.ax = accScale*ByteParser.bytesToInt16(arr[accIdx],arr[accIdx+1]);
        output.ay = accScale*ByteParser.bytesToInt16(arr[accIdx+2],arr[accIdx+3]);
        output.az = accScale*ByteParser.bytesToInt16(arr[accIdx+4],arr[accIdx+5]);
        // output.gx = accScale*ByteParser.bytesToInt16(arr[accIdx+6],arr[accIdx+7]);
        // output.gy = accScale*ByteParser.bytesToInt16(arr[accIdx+8],arr[accIdx+9]);
        // output.gz = accScale*ByteParser.bytesToInt16(arr[accIdx+10],arr[accIdx+11]);
    }
}

//8 channels x 3 bytes per channel each line, plus 6x2 bytes for the IMU. First byte is counter byte;
export function cytoncodec(data:any) {
    let arr; 
    if(!data.buffer) arr = new Uint8Array(data);
    else arr = data;

    let output:any = {};

    for(let i = 0; i < 8; i++) {
        let idx = 1+3*i;
        output[i] = ByteParser.bytesToInt24(arr[idx],arr[idx+1],arr[idx+2]); //signed ints
    }

    getAcc(arr, output);

    output.timestamp = Date.now();

    return output;
}

//8 channels x 3 bytes per channel each line, plus 6x2 bytes for the IMU. First byte is counter byte;
export function daisycytoncodec(data:any) {
    let arr; 
    if((data as DataView).getInt8) arr = new Uint8Array(data.buffer);
    else if(!data.buffer) arr = new Uint8Array(data);
    else arr = data;

    let output:any = {};

    for(let i = 0; i < 8; i++) {
        let idx = 1+3*i;
        if(arr[0]%2 === 0) output[i+7] = ByteParser.bytesToInt24(arr[idx],arr[idx+1],arr[idx+2]); //signed ints 
        else output[i] = ByteParser.bytesToInt24(arr[idx],arr[idx+1],arr[idx+2]); //signed ints
    }

    getAcc(arr, output);

    return output;
}

const sps = 250;

export const cytonSerialSettings = {
    deviceType:'USB',
    deviceName:'cyton',
    baudRate:115200,
    codec:cytoncodec,
    write:'b',
    beforedisconnect:(client,port)=>{ client.writePort(port, 's' ); }, 
    buffering:{
        searchBytes:new Uint8Array([192,160]),
    },
    sps
} as SerialDeviceSettings;

export const daisycytonSerialSettings = {
    deviceType:'USB',
    deviceName:'cyton_daisy',
    baudRate:115200,
    codec:daisycytoncodec,
    write:'b',
    beforedisconnect:(client,port)=>{ client.writePort(port, 's' ); },
    buffering:{
        searchBytes:new Uint8Array([192,160]),
    },
    sps
} as SerialDeviceSettings;

const defaultChartSetting = {nSec:10, sps, units:'mV'};
const defaultChartSetting2 = {nSec:10, sps};
export const cytonChartSettings:Partial<WebglLinePlotProps> = {
    lines:{
        '0':JSON.parse(JSON.stringify(defaultChartSetting)),
        '1':JSON.parse(JSON.stringify(defaultChartSetting)),
        '2':JSON.parse(JSON.stringify(defaultChartSetting)),
        '3':JSON.parse(JSON.stringify(defaultChartSetting)),
        '4':JSON.parse(JSON.stringify(defaultChartSetting)),
        '5':JSON.parse(JSON.stringify(defaultChartSetting)),
        '6':JSON.parse(JSON.stringify(defaultChartSetting)),
        '7':JSON.parse(JSON.stringify(defaultChartSetting)),
        'ax':JSON.parse(JSON.stringify(defaultChartSetting2)),
        'ay':JSON.parse(JSON.stringify(defaultChartSetting2)),
        'az':JSON.parse(JSON.stringify(defaultChartSetting2))
    },
    generateNewLines:true //to add the additional 16 channels
};

let defaultsetting = {
    sps, 
    useDCBlock:true, 
    useBandpass:true, 
    bandpassLower:3, 
    bandpassUpper:45, 
    useScaling:true, 
    scalar:1000*4.5/(24*(Math.pow(2,23)-1))
};

export const cytonFilterSettings:{[key:string]:FilterSettings} = {
    '0':JSON.parse(JSON.stringify(defaultsetting)), //twos compliment 2^23
    '1':JSON.parse(JSON.stringify(defaultsetting)),
    '2':JSON.parse(JSON.stringify(defaultsetting)),
    '3':JSON.parse(JSON.stringify(defaultsetting)),
    '4':JSON.parse(JSON.stringify(defaultsetting)),
    '5':JSON.parse(JSON.stringify(defaultsetting)),
    '6':JSON.parse(JSON.stringify(defaultsetting)),
    '7':JSON.parse(JSON.stringify(defaultsetting)),
    '8':JSON.parse(JSON.stringify(defaultsetting)), //twos compliment 2^23
    '9':JSON.parse(JSON.stringify(defaultsetting)),
    '10':JSON.parse(JSON.stringify(defaultsetting)),
    '11':JSON.parse(JSON.stringify(defaultsetting)),
    '12':JSON.parse(JSON.stringify(defaultsetting)),
    '13':JSON.parse(JSON.stringify(defaultsetting)),
    '14':JSON.parse(JSON.stringify(defaultsetting)),
    '15':JSON.parse(JSON.stringify(defaultsetting))
}