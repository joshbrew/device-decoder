
/**
 * 
 * ads131m08 BLE packet output for our board:
 * [0,1,2],[3,4,5],[6,7,8],[9,10,11],[12,13,14],[15,16,17],[19,19,20],[21,22,23], [24],  [25,26,27],... * 9 samples per packet, then \r\n
 *                                                             first 8 channels,  ctr,   next channel set
 * 
 */
import { WebglLinePlotProps } from "webgl-plot-utils";
import { FilterSettings } from "../util/BiquadFilters";
import { ByteParser } from "../util/ByteParser";

export function ads131m08codec(data:any) {
    let arr; 
    if((data as DataView).getInt8) arr = new Uint8Array(data.buffer);
    else if(!data.buffer) arr = new Uint8Array(data);
    else arr = data;

    let output = {
        0:new Array(9),
        1:new Array(9),
        2:new Array(9),
        3:new Array(9),
        4:new Array(9),
        5:new Array(9),
        6:new Array(9),
        7:new Array(9),
        timestamp:Date.now()
    };

    for(let i = 0; i < 9; i++) { //hard coded packet iteration, 9 sample sets x 8 channels per packet 
        let j = i * 25; //every 25th byte is a counter so skip those
        output[0][i] = ByteParser.bytesToInt24(arr[j],arr[j+1],arr[j+2]); 
        output[1][i] = ByteParser.bytesToInt24(arr[j+3],arr[j+4],arr[j+5]);
        output[2][i] = ByteParser.bytesToInt24(arr[j+6],arr[j+7],arr[j+8]);
        output[3][i] = ByteParser.bytesToInt24(arr[j+9],arr[j+10],arr[j+11]);
        output[4][i] = ByteParser.bytesToInt24(arr[j+12],arr[j+13],arr[j+14]);
        output[5][i] = ByteParser.bytesToInt24(arr[j+15],arr[j+16],arr[j+17]);
        output[6][i] = ByteParser.bytesToInt24(arr[j+18],arr[j+19],arr[j+20]);
        output[7][i] = ByteParser.bytesToInt24(arr[j+21],arr[j+22],arr[j+23]);
    }
    
    return output;
}

//get the arduino text output
const decoder = new TextDecoder()
export function ads131m08_arduinocodec(data:any) {
    const parsed = decoder.decode(data);

    let split;
    if(parsed.includes('|')) split = parsed.split('|');
    else if(split.includes(',')) split = parsed.split(',');
    else split = parsed.split('\t');

    return {
        '0':parseInt(split[0]),
        '1':parseInt(split[1]),
        '2':parseInt(split[2]),
        '3':parseInt(split[3]),
        '4':parseInt(split[4]),
        '5':parseInt(split[5]),
        '6':parseInt(split[6]),
        '7':parseInt(split[7]),
        timestamp: Date.now()
    }

}

const sps = 250;

const defaultChartSetting = {nSec:10, sps, units:'mV'};

export const ads131m08ChartSettings:Partial<WebglLinePlotProps> = {
    lines:{
        '0':JSON.parse(JSON.stringify(defaultChartSetting)),
        '1':JSON.parse(JSON.stringify(defaultChartSetting)),
        '2':JSON.parse(JSON.stringify(defaultChartSetting)),
        '3':JSON.parse(JSON.stringify(defaultChartSetting)),
        '4':JSON.parse(JSON.stringify(defaultChartSetting)),
        '5':JSON.parse(JSON.stringify(defaultChartSetting)),
        '6':JSON.parse(JSON.stringify(defaultChartSetting)),
        '7':JSON.parse(JSON.stringify(defaultChartSetting))
    }
}

const gain = 32;
const nbits = 24;
const vref = 1.2;

let defaultsetting = {
    sps, 
    useDCBlock:false, 
    useBandpass:false, 
    bandpassLower:3, 
    bandpassUpper:45, 
    useScaling:true, 
    scalar:0.96 * 1000*vref/(gain*(Math.pow(2,nbits)-1)),
    //trimOutliers:true,
    //outlierTolerance:0.3
} as FilterSettings;

export const ads131m08FilterSettings:{[key:string]:FilterSettings} = {
    '0':JSON.parse(JSON.stringify(defaultsetting)),
    '1':JSON.parse(JSON.stringify(defaultsetting)),
    '2':JSON.parse(JSON.stringify(defaultsetting)),
    '3':JSON.parse(JSON.stringify(defaultsetting)),
    '4':JSON.parse(JSON.stringify(defaultsetting)),
    '5':JSON.parse(JSON.stringify(defaultsetting)),
    '6':JSON.parse(JSON.stringify(defaultsetting)),
    '7':JSON.parse(JSON.stringify(defaultsetting))
}


