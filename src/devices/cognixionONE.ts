import {ByteParser} from '../util/ByteParser'
import { WebglLinePlotProps } from 'webgl-plot-utils';
import { FilterSettings } from '../util/BiquadFilters';

//BLE mode CNX_EEG_raw_data_struct packet structure: [ctr, [0,1,2],[3,4,5],[6,7,8],[9,10,11],[12,13,14],[15,16,17],[18,19,20],[21,22,23], 0x00], up to 7 per BLE packet but variable. 
// Less channels pack less bytes inbetween rather than setting zeros??
//this codec assumes all 8 ADS1299 channels are running on the default settings. 


export function cognixionONE_EEG_codec(data:any) {
    let arr; 
    if((data as DataView).getInt8) arr = new Uint8Array(data.buffer);
    else if(!data.buffer) arr = new Uint8Array(data);
    else arr = data;

    let output = { //up to 7 samples
        0:new Array(),
        1:new Array(),
        2:new Array(),
        3:new Array(),
        4:new Array(),
        5:new Array(),
        6:new Array(),
        7:new Array(),
        timestamp:Date.now()
    };

    for(let i = 0; i < 7; i++) { //hard coded packet iteration, 8 sample sets x 8 channels per packet 
        let j = i * 26 + 1; //every 0th byte is a counter and every 26th byte is 0x00 so skip those
        if(!arr[j+23]) break;
        output[0][i] = ByteParser.bytesToUInt24(arr[j],arr[j+1],arr[j+2]); //signed or unsigned? assuming unsigned
        output[1][i] = ByteParser.bytesToUInt24(arr[j+3],arr[j+4],arr[j+5]);
        output[2][i] = ByteParser.bytesToUInt24(arr[j+6],arr[j+7],arr[j+8]);
        output[3][i] = ByteParser.bytesToUInt24(arr[j+9],arr[j+10],arr[j+11]);
        output[4][i] = ByteParser.bytesToUInt24(arr[j+12],arr[j+13],arr[j+14]);
        output[5][i] = ByteParser.bytesToUInt24(arr[j+15],arr[j+16],arr[j+17]);
        output[6][i] = ByteParser.bytesToUInt24(arr[j+18],arr[j+19],arr[j+20]);
        output[7][i] = ByteParser.bytesToUInt24(arr[j+21],arr[j+22],arr[j+23]);
    }
    
    return output;
}

const sps = 250;

//For the USB raw stream, use the cyton codec
export const cognixionONEBLESettings = {
    services:{
        ['82046698-6313-4BB1-9645-6BA28BF86DF5'.toLowerCase()]:{
            ['8204669A-6313-4BB1-9645-6BA28BF86DF5'.toLowerCase()]:{  //raw data stream
                notify:true,
                notifyCallback:undefined,
                codec:cognixionONE_EEG_codec,
                sps
            },
            //bunch more stuff
        },
        ['82E12914-9AFA-4648-BD1B-8E2B3DC6DAAF'.toLowerCase()]:{
            ['82E12915-9AFA-4648-BD1B-8E2B3DC6DAAF'.toLowerCase()]:{
                write:undefined //write commands with specific sequences based on the device spec (can't share... yet)
            },
            ['82E12916-9AFA-4648-BD1B-8E2B3DC6DAAF'.toLowerCase()]:{
                read:true //read response
            }
        }  //controls
        //more services for haptics etc.
    },
    sps //base eeg sps (we don't know about the other sensors yet)
}

const defaultChartSetting = {nSec:10, sps, units:'mV'};
export const cognixionONEChartSettings:Partial<WebglLinePlotProps> = {
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


export const cognixionONEFilterSettings:{[key:string]:FilterSettings} = {
    '0':{sps, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45}, //scalar?
    '1':{sps, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '2':{sps, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '3':{sps, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '4':{sps, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '5':{sps, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '6':{sps, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '7':{sps, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45}
}