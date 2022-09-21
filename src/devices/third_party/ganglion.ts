
//OTHER devices follow a general format:
/*
    connect -> init device and scripts
    disconnect -> close device connection
    onconnect -> onconnect callback you can customize
    ondata -> ondata callback you can customize
    ondisconnect -> disconnect callback you can customize
    codec -> optionally used to transform streams e.g. on a separate thread, libraries like muse-js already do it for us so we can just customize ondata to handle output, or use the codec to do some kind of special math on a thread
*/

import { WebglLinePlotProps } from "webgl-plot-utils";
import { FilterSettings } from "../../util/BiquadFilters";
import {Ganglion} from './ganglion-browser'

const sps = 250;

export const ganglionSettings = { //include muse-js and import {MuseClient} from 'muse-js' for this to work
    sps,
    connect:(settings:any={}) => {
        return new Promise(async (res,rej) => {
            let _id = `ganglion${Math.floor(Math.random()*1000000000000000)}`;

            // //@ts-ignore
            // if(typeof Ganglion === 'undefined') { document.head.insertAdjacentHTML('beforeend',`<script src="https://cdn.jsdelivr.net/npm/ganglion-browser-min@1.0.2/dist/index.js"></script>`) }

            let client = new Ganglion();

            let info = {
                _id,
                client,
                settings:Object.assign(Object.assign({},ganglionSettings),settings) //e.g. customize ondisconnect
            }

            await client.connect();
            await client.start();

            client.stream.subscribe((reading:{
                timestamp: number; // milliseconds since epoch
                data: number[]; // 1 sample per channel, 4 samples total
            }) => {
                (reading as any).origin = 'eeg';
                info.settings.ondata(reading);
            });

            client.accelData.subscribe((reading:{
                data:[number,number,number] //?
            }) => {
                (reading as any).origin = 'accelerometer';
                info.settings.ondata(reading);
            });

            if(info.settings.onconnect) info.settings.onconnect(info);

            res(info);
        })
        
    },
    codec:(reading:any) => { //remap outputs to more or less match the rest of our formatting

        let origin = reading.origin;

        if(origin === 'eeg') {
            return {
                0:reading.data[0],
                1:reading.data[1],
                2:reading.data[2],
                3:reading.data[3],
                timestamp: Date.now()
            }
        } 
        else if (origin === 'accelerometer') {
            return {
                ax:reading.data[0],
                ay:reading.data[1],
                az:reading.data[2],
                timestamp: Date.now()
            }
        }
    },
    disconnect:(info) => {
        info.client.disconnect();
        info.settings.ondisconnect(info);
    },
    onconnect:(info)=>{
        console.log('ganglion connected!', info);
    }, 
    ondisconnect:(info)=>{
        console.log('ganglion disconnected!', info);
    },
    ondata:(data:any)=>{
        console.log(data); //direct from teh device output
    },
    //read:(info:any,command?:any)=>{},
    //write:(info:any,command?:any)=>{}
}


let defaultsetting = {
    sps, 
    useDCBlock:true, 
    useBandpass:true, 
    bandpassLower:3, 
    bandpassUpper:45
};

export const ganglionFilterSettings:{[key:string]:FilterSettings} = {
    '0':JSON.parse(JSON.stringify(defaultsetting)), //twos compliment 2^23
    '1':JSON.parse(JSON.stringify(defaultsetting)),
    '2':JSON.parse(JSON.stringify(defaultsetting)),
    '3':JSON.parse(JSON.stringify(defaultsetting))
}

const defaultChartSetting = {nSec:10, sps, units:'mV'};
export const ganglionChartSettings:Partial<WebglLinePlotProps> = {
    lines:{
        '0':JSON.parse(JSON.stringify(defaultChartSetting)),
        '1':JSON.parse(JSON.stringify(defaultChartSetting)),
        '2':JSON.parse(JSON.stringify(defaultChartSetting)),
        '3':JSON.parse(JSON.stringify(defaultChartSetting)),
        'ax':{nSec:10, sps, units:'mg'},
        'ay':{nSec:10, sps, units:'mg'},
        'az':{nSec:10, sps, units:'mg'},
    },
    generateNewLines:true //to add the additional 16 channels
};
