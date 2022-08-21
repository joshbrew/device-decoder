
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
import { FilterSettings } from "../util/BiquadFilters";

export const museSettings = { //include muse-js and import {MuseClient} from 'muse-js' for this to work
    connect:(settings:any={}) => {
        return new Promise(async (res,rej) => {
            let _id = `muse${Math.floor(Math.random()*1000000000000000)}`;

            if(!('MuseClient' in window)) { document.head.insertAdjacentHTML('beforeend',`<script src="https://cdn.jsdelivr.net/npm/muse-js-tinybuild@0.0.2/dist/muse.min.js"></script>`) }

            //@ts-ignore
            let client = new MuseClient();

            let info = {
                _id,
                client,
                settings:Object.assign(Object.assign({},museSettings),settings) //e.g. customize ondisconnect
            }

            await client.connect();
            await client.start();

            client.eegReadings.subscribe((reading:{
                index: number;
                electrode: number; // 0 to 4
                timestamp: number; // milliseconds since epoch
                samples: number[]; // 12 samples each time
            }) => {
                (reading as any).origin = 'eeg';
                info.settings.ondata(reading);
            });

            client.telemetryData.subscribe((reading:{
                sequenceId: number;
                batteryLevel: number;
                fuelGaugeVoltage: number;
                temperature: number;
            }) => {
                (reading as any).origin = 'telemetry';
                info.settings.ondata(reading);
            });

            client.gyroscopeData.subscribe((reading:{
                sequenceId: number;
                samples: {x:number,y:number,z:number}[];
            }) => {
                (reading as any).origin = 'gyro';
                info.settings.ondata(reading);
            })
            
            client.accelerometerData.subscribe((reading:{
                sequenceId: number;
                samples: {x:number,y:number,z:number}[];
            }) => {
                (reading as any).origin = 'accelerometer';
                info.settings.ondata(reading);
            });

            if(client.enablePPG) {
                
                client.ppgData.subscribe((reading:{
                    index: number;
                    ppgChannel: number; // 0 to 2
                    timestamp: number; // milliseconds since epoch
                    samples: number[]; // 6 samples each time
                }) => {
                    (reading as any).origin = 'ppg';
                    info.settings.ondata(reading);
                });
            }

            info.settings.onconnect(info);

            res(info);
        })
        
    },
    codec:(reading:any) => { //remap outputs to more or less match the rest of our formatting

        let origin = reading.origin;

        if(origin === 'eeg') {
            return {
                [reading.electrode]:reading.samples
            }
        }
        else if (origin === 'gyro') {
            
            let transformed = {gx:[] as any,gy:[] as any,gz:[] as any};
            reading.samples.forEach((s:any) => {
                transformed.gx.push(s.x);
                transformed.gy.push(s.y);
                transformed.gz.push(s.z);
            });
            
            return transformed;
        }  
        else if (origin === 'accelerometer') {
            
            let transformed = {ax:[] as any,ay:[] as any,az:[] as any};
            reading.samples.forEach((s:any) => {
                transformed.ax.push(s.x);
                transformed.ay.push(s.y);
                transformed.az.push(s.z);
            });
            
            return transformed;
        } else if (origin === 'ppg') {
            return {
                [`ppg${reading.ppgChannel}`]:reading.samples
            };
        } else if (origin === 'telemetry') {
            return reading;
        }
    },
    disconnect:(info) => {
        info.client.disconnect();
        info.settings.ondisconnect(info);
    },
    onconnect:(info)=>{
        console.log('muse connected!', info);
    }, 
    ondisconnect:(info)=>{
        console.log('muse disconnected!', info);
    },
    ondata:(parsed:any)=>{
        console.log(parsed); //after transforming
    }
}


let defaultsetting = {
    sps:250, 
    useDCBlock:true, 
    useBandpass:true, 
    bandpassLower:3, 
    bandpassUpper:45
};

export const museFilterSettings:{[key:string]:FilterSettings} = {
    '0':JSON.parse(JSON.stringify(defaultsetting)), //twos compliment 2^23
    '1':JSON.parse(JSON.stringify(defaultsetting)),
    '2':JSON.parse(JSON.stringify(defaultsetting)),
    '3':JSON.parse(JSON.stringify(defaultsetting)),
    '4':JSON.parse(JSON.stringify(defaultsetting))
}


export const museChartSettings:Partial<WebglLinePlotProps> = {
    lines:{
        '0':{nSec:10, sps:250},
        '1':{nSec:10, sps:250},
        '2':{nSec:10, sps:250},
        '3':{nSec:10, sps:250},
        '4':{nSec:10, sps:250},
        'ax':{nSec:10, sps:100},
        'ay':{nSec:10, sps:100},
        'az':{nSec:10, sps:100},
        'gx':{nSec:10, sps:100},
        'gy':{nSec:10, sps:100},
        'gz':{nSec:10, sps:100},
    },
    generateNewLines:true //to add the additional 16 channels
};