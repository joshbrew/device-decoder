import {bitflippin} from '../util/bitflippin'
import { WebglLinePlotProps } from 'webgl-plot-utils';
import { FilterSettings } from '../util/BiquadFilters';

//BLE mode CNX_EEG_raw_data_struct packet structure: [ctr, [0,1,2],[3,4,5],[6,7,8],[9,10,11],[12,13,14],[15,16,17],[18,19,20],[21,22,23], 0x00], up to 7 per BLE packet but variable. 
// Less channels pack less bytes inbetween rather than setting zeros which is kinda annoying and creates more work than necessary on the frontend, and that is not even touching the rest of the settings on this thing.
//this codec assumes all 8 ADS1299 channels are running on the default settings. 


export function cognixionONE_EEG_codec(data:any) {
    let arr; 
    if(!data.buffer) arr = new Uint8Array(data);
    else arr = data;

    let output = { //up to 7 samples
        0:new Array(),
        1:new Array(),
        2:new Array(),
        3:new Array(),
        4:new Array(),
        5:new Array(),
        6:new Array(),
        7:new Array()
    };

    for(let i = 0; i < 7; i++) { //hard coded packet iteration, 9 sample sets x 8 channels per packet 
        let j = i * 26 + 1; //every 0th byte is a counter and every 26th byte is 0x00 so skip those
        if(!arr[j+23]) break;
        output[0][i] = bitflippin.bytesToUInt24(arr[j],arr[j+1],arr[j+2]); //signed or unsigned? assuming unsigned
        output[1][i] = bitflippin.bytesToUInt24(arr[j+3],arr[j+4],arr[j+5]);
        output[2][i] = bitflippin.bytesToUInt24(arr[j+6],arr[j+7],arr[j+8]);
        output[3][i] = bitflippin.bytesToUInt24(arr[j+9],arr[j+10],arr[j+11]);
        output[4][i] = bitflippin.bytesToUInt24(arr[j+12],arr[j+13],arr[j+14]);
        output[5][i] = bitflippin.bytesToUInt24(arr[j+15],arr[j+16],arr[j+17]);
        output[6][i] = bitflippin.bytesToUInt24(arr[j+18],arr[j+19],arr[j+20]);
        output[7][i] = bitflippin.bytesToUInt24(arr[j+21],arr[j+22],arr[j+23]);
    }
    
    return output;
}

//For the USB raw stream, use the cyton codec
export const cognixionONEBLESettings = {
    services:{
        ['0x82046698-6313-4BB1-9645-6BA28BF86DF5'.toLowerCase()]:{
            ['0x8204669A-6313-4BB1-9645-6BA28BF86DF5'.toLowerCase()]:{  //raw data stream
                notify:true,
                notifyCallback:undefined,
                codec:cognixionONE_EEG_codec
            },
            //bunch more stuff
        },
        ['0x82E12914-9AFA-4648-BD1B-8E2B3DC6DAAF'.toLowerCase()]:{
            ['0x82E12915-9AFA-4648-BD1B-8E2B3DC6DAAF'.toLowerCase()]:{
                write:undefined //write commands with specific sequences based on the device spec (can't share... yet)
            },
            ['0x82E12916-9AFA-4648-BD1B-8E2B3DC6DAAF'.toLowerCase()]:{
                read:true //read response
            }
        }  //controls
        //more services for haptics etc.
    }
}

export const cognixionONEChartSettings:Partial<WebglLinePlotProps> = {
    lines:{
        '0':{nSec:10, sps:250},
        '1':{nSec:10, sps:250},
        '2':{nSec:10, sps:250},
        '3':{nSec:10, sps:250},
        '4':{nSec:10, sps:250},
        '5':{nSec:10, sps:250},
        '6':{nSec:10, sps:250},
        '7':{nSec:10, sps:250}
    }
}


export const cognixionONEFilterSettings:{[key:string]:FilterSettings} = {
    '0':{sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45}, //scalar?
    '1':{sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '2':{sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '3':{sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '4':{sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '5':{sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '6':{sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45},
    '7':{sps:250, useDCBlock:true, useBandpass:true, bandpassLower:3, bandpassUpper:45}
}