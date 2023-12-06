## Device Drivers

We've whittled down the work required to support device streaming in the web down to a few definitions that you can use for settings in our framework.

#### See [`index.ts`](./index.ts) for supported settings

### BLE

Using `@capacitor-community/bluetooth-le` for an interoperable Web Bluetooth API + Native Android or IOS library,
we have a nice set of controls for easily creating bluetooth LE drivers that are lightweight and interoperable. The Web Bluetooth APIs are either broken or locked on mobile so this is the best workaround, and does not require differentiating code based on platform.

To add your own BLE drivers, you can model your drivers after this format then set the settings accordingly in `index.ts`

Here is a very simple example from [`./blueberry.ts`](./blueberry.ts):

```ts

//turn incoming raw data into a readable object format
export function blueberrycodec(value:DataView) {

    let output = {
        LED1: value.getInt32(2),
        LED2: value.getInt32(6),
        LED3: value.getInt32(10)
    }

    return output;
}

//write down the settings for your device
export const blueberryBLESettings = {
    namePrefix:'blueberry',
    deviceType:'BLE',
    deviceName:'blueberry',
    services:{
        '0f0e0d0c-0b0a-0908-0706-050403020100':{
            '1f1e1d1c-1b1a-1918-1716-151413121110':{
                write:undefined //new Uint8Array([0xA0],[redValue], [greenValue], [blueValue]); //for rgb controller
            },
            '3f3e3d3c-3b3a-3938-3736-353433323130':{
                notify:true,
                notifyCallback:undefined,
                codec:blueberrycodec
            }
        }
    }
} as BLEDeviceOptions
```


And to add specific chart settings in the debugger:

```ts

//for supporting the output on the device_debugger app charts, use this to model for other apps if you want
export const blueberryChartSettings:Partial<WebglLinePlotProps> = {
    lines:{
        LED1:{nSec:60, sps:40},
        LED2:{nSec:60, sps:40},
        LED3:{nSec:60, sps:40}
    }
}

```

### USB

Adding USB drivers is pretty similar, here is an example of cross USB and BLE support from [`./nrf5x.ts`](./nrf5x.ts) which is a custom device that has modular sensor support.

```ts

import { WebglLinePlotProps } from 'webgl-plot-utils';
import { FilterSettings } from '../util/BiquadFilters';
import { ads131m08codec } from './ads131m08';
import { max3010xcodec } from './max30102';
import { mpu6050codec } from './mpu6050';

export function nrf5x_usbcodec(data:any) {
    let arr:Uint8Array; 
    if(!data.buffer) arr = new Uint8Array(data); 
    else arr = data as Uint8Array;
    //head of each byte packet is the search byte //240,240
    //packetID: 2: ads131m08 1, 3: ads131m08 2, 4: MPU6050, 5: MAX30102

    const output:any = {};

    if(arr[0] === 2) {
        Object.assign(output,ads131m08codec(arr.subarray(2)));
    } else if (arr[0] === 3) {
        let result = ads131m08codec(arr.subarray(2));
        Object.keys(result).forEach((key,i) => {
            output[i+8] = result[key];
        })
    } else if (arr[0] === 4) {
        Object.assign(output,mpu6050codec(arr.subarray(2)));
    } else if (arr[0] === 5) {
        //Object.assign(output,max3010xcodec(arr.subarray(1)));
        Object.assign(output,max3010xcodec(arr.subarray(2)));
    } else {
        Object.assign(output,ads131m08codec(arr));
    }

    return output;
}

export const nrf5xSerialSettings = {
    baudRate:115200,
    deviceType:'USB',
    deviceName:'nrf5x',
    buffering:{
        searchBytes:new Uint8Array([240,240])
    },
    codec:nrf5x_usbcodec
}

export const nrf5xBLESettings = {
    deviceType:'BLE',
    deviceName:'nrf5x'
    services:{
        '0000cafe-b0ba-8bad-f00d-deadbeef0000':{
            '0001cafe-b0ba-8bad-f00d-deadbeef0000':{
                write:undefined
            },
            '0002cafe-b0ba-8bad-f00d-deadbeef0000':{ //ads131m08
                notify:true,
                notifyCallback:undefined,
                codec:ads131m08codec
            },
            '0003cafe-b0ba-8bad-f00d-deadbeef0000':{ //max30102
                notify:true,
                notifyCallback:undefined,
                codec:max3010xcodec
            },
            '0004cafe-b0ba-8bad-f00d-deadbeef0000':{ //mpu6050
                notify:true,
                notifyCallback:undefined,
                codec:mpu6050codec
            },
            '0006cafe-b0ba-8bad-f00d-deadbeef0000':{ //ads131m08-2
                notify:true,
                notifyCallback:undefined,
                codec:ads131m08codec
            }
        }// each notification is for a different sensor
    }
}


```



You can see the expected settings for each type of device here:
```ts

export type InitDeviceOptions = { //you can update ondecoded and ondisconnect at any time
    devices?:{
        [key:string]:{
            [key:string]:any
        }
    },
    
    //this function is required
    ondecoded:((data:any) => void)|{[key:string]:(data:any)=>void}, //a single ondata function or an object with keys corresponding to BLE characteristics
    onconnect?:((device:any) => void),
    beforedisconnect?:((device:any) => void),
    ondisconnect?:((device:any) => void),
    ondata?:((data:DataView) => void), //get direct results, bypass workers (except for serial which is thread-native)
    filterSettings?:{[key:string]:FilterSettings},
    reconnect?:boolean, //this is for the USB codec but you MUST provide the usbProductId and usbVendorId in settings. For BLE it will attempt to reconnect if you provide a deviceId in settings
    roots?:{ //use secondary workers to run processes and report results back to the main thread or other
        [key:string]:WorkerRoute
    },
    workerUrl?:any,
    service?:WorkerService //can load up our own worker service, the library provides a default service
}

//returned with the initDevice call, depending on the stream type:


export type SerialDeviceStream = {
    workers:{
        serialworker:WorkerInfo,
        streamworker:WorkerInfo
    },
    options:InitDeviceOptions,
    device:{
        _id:string,
        settings:any,
        info:Partial<SerialPortInfo>
    },
    subscribeStream:(ondata:(data:any) => void) => Promise<any>,
    unsubscribeStream:(sub:number|undefined) => Promise<any>,
    //FYI only works on time series data and on devices with a set sample rate:
    setFilters:(filterSettings:{[key:string]:FilterSettings}, clearFilters?:boolean) => Promise<true>,
    disconnect:()=>void,
    read:()=>Promise<any>,
    write:(command:any)=>Promise<boolean>,
    roots:{[key:string]:WorkerRoute}
};
    

export type BLEDeviceStream = {
    workers:{
        streamworker:WorkerInfo
    },
    options:InitDeviceOptions,
    device:BLEDeviceInfo,
    subscribe:(service, notifyCharacteristic, ondata?, bypassWorker?) => Promise<void>,
    unsubscribe:(service, notifyCharacteristic) => Promise<void>,
    //FYI only works on time series data and on devices with a set sample rate:
    setFilters:(filterSettings:{[key:string]:FilterSettings}, clearFilters?:boolean) => Promise<true>,
    disconnect:()=>void,
    read:(command:{ service:string, characteristic:string, ondata?:(data:DataView)=>void, timeout?:TimeoutOptions }) => Promise<DataView>,
    write:(command:{ service:string, characteristic:string, data?:string|number|ArrayBufferLike|DataView|number[], callback?:()=>void, timeout?:TimeoutOptions})=>Promise<void>,
    roots:{[key:string]:WorkerRoute}
};

export type CustomDeviceStream = {
    workers:{
        streamworker:WorkerInfo
    },
    device:any,
    options:InitDeviceOptions,
    disconnect:()=>void,
    read:(command?:any)=>any,
    write:(command?:any)=>any,
    //FYI only works on time series data and on devices with a set sample rate:
    setFilters:(filterSettings:{[key:string]:FilterSettings}, clearFilters?:boolean) => Promise<true>,
    roots:{[key:string]:WorkerRoute}
};

```


You may also add filter settings to apply in the worker codecs automatically. There are additional controls to toggle them on the fly if you dig into the stream.worker's routes

```ts


let defaultsetting = {
    sps:250, 
    useDCBlock:false, 
    useBandpass:false, 
    bandpassLower:3, bandpassUpper:45, 
    useScaling:true, 
    scalar:1.2/(32*(Math.pow(2,24)-1))
};

export const nrf5x_usbFilterSettings:{[key:string]:FilterSettings} = {
    '0':JSON.parse(JSON.stringify(defaultsetting)),
    '1':JSON.parse(JSON.stringify(defaultsetting)),
    '2':JSON.parse(JSON.stringify(defaultsetting)),
    '3':JSON.parse(JSON.stringify(defaultsetting)),
    '4':JSON.parse(JSON.stringify(defaultsetting)),
    '5':JSON.parse(JSON.stringify(defaultsetting)),
    '6':JSON.parse(JSON.stringify(defaultsetting)),
    '7':JSON.parse(JSON.stringify(defaultsetting)),
    '8':JSON.parse(JSON.stringify(defaultsetting)),
    '9':JSON.parse(JSON.stringify(defaultsetting)),
    '10':JSON.parse(JSON.stringify(defaultsetting)),
    '11':JSON.parse(JSON.stringify(defaultsetting)),
    '12':JSON.parse(JSON.stringify(defaultsetting)),
    '13':JSON.parse(JSON.stringify(defaultsetting)),
    '14':JSON.parse(JSON.stringify(defaultsetting)),
    '15':JSON.parse(JSON.stringify(defaultsetting))
}



export const nrf5x_usbChartSettings:Partial<WebglLinePlotProps> = {
    lines:{
        '0':{nSec:10, sps:250},
        '1':{nSec:10, sps:250},
        '2':{nSec:10, sps:250},
        '3':{nSec:10, sps:250},
        '4':{nSec:10, sps:250},
        '5':{nSec:10, sps:250},
        '6':{nSec:10, sps:250},
        '7':{nSec:10, sps:250}
    },
    generateNewLines:true,
    cleanGeneration:false
} //these are just settings for webgl-plot-utils, which we defined generically

```


### Other

Say we want to support a driver that does not give us the raw data but want to feed it into our multithreading pipeline and general application settings. See [`muse.ts`](./muse.ts) for an implementation with conditionally included dependencies.


Create an object like:

```ts

import { FilterSettings } from "../../util/BiquadFilters";
import { ByteParser } from "../../util/ByteParser";

import {MuseClient} from './dependencies/muse.esm'

const sps = 250;

export const museSettings = { //include muse-js and import {MuseClient} from 'muse-js' for this to work
    sps, //base eeg sps, accelerometer is something else I think, I dunno
    deviceType:'USB_CUSTOM',
    deviceName:'muse',
    connect:(settings:any={}) => {
        return new Promise(async (res,rej) => {
            let _id = `muse${Math.floor(Math.random()*1000000000000000)}`;

            //if(typeof MuseClient === 'undefined')  { document.head.insertAdjacentHTML('beforeend',`<script src="https://cdn.jsdelivr.net/npm/muse-js-tinybuild@1.0.0/dist/muse.min.js"></script>`) }

            let client = new MuseClient();

            let info = {
                _id,
                client,
                settings:Object.assign(Object.assign({},museSettings),settings) //e.g. customize ondisconnect
            }

            client.enableAux = true;
            await client.connect();
            await client.start();

            let eegts;

            client.eegReadings.subscribe((reading:{
                index: number;
                electrode: number; // 0 to 4
                timestamp: number; // milliseconds since epoch
                samples: number[]; // 12 samples each time
            }) => {
                (reading as any).origin = 'eeg';
                if(reading.electrode === 0) {
                    eegts = ByteParser.genTimestamps(12,250);
                }
                if(!eegts) eegts = ByteParser.genTimestamps(12,250);
                reading.timestamp = eegts; //sync timestamps across samples
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

            if(info.settings.onconnect) info.settings.onconnect(info);

            res(info);
        })
        
    },
    codec:(reading:any) => { //remap outputs to more or less match the rest of our formatting

        let origin = reading.origin;

        if(origin === 'eeg') {
            return {
                [reading.electrode]:reading.samples,
                timestamp:Date.now()
            }
        }
        else if (origin === 'gyro') {
            
            let transformed = {gx:[] as any,gy:[] as any,gz:[] as any, timestamp:Date.now()};
            reading.samples.forEach((s:any) => {
                transformed.gx.push(s.x);
                transformed.gy.push(s.y);
                transformed.gz.push(s.z);
            });
            
            return transformed;
        }  
        else if (origin === 'accelerometer') {
            
            let transformed = {ax:[] as any,ay:[] as any,az:[] as any, timestamp:Date.now()};
            reading.samples.forEach((s:any) => {
                transformed.ax.push(s.x);
                transformed.ay.push(s.y);
                transformed.az.push(s.z);
            });
            
            return transformed;
        } else if (origin === 'ppg') {
            return {
                [`ppg${reading.ppgChannel}`]:reading.samples,
                timestamp:Date.now()
            };
        } else if (origin === 'telemetry') {
            return reading;
        }
    },
    disconnect:(info) => {
        info.client.disconnect();
    },
    onconnect:(info)=>{
        console.log('muse connected!', info);
    }, 
    beforedisconnect:(info) => {},
    ondisconnect:(info)=>{
        console.log('muse disconnected!', info);
    },
    ondata:(data:any)=>{
        console.log(data); //direct from teh device output
    },
    //read:(info:any,command?:any)=>{},
    //write:(info:any,command?:any)=>{}
}


```

### Finally

In [`index.ts`](./index.ts), link the new settings to the relevant objects 


```ts

//containe unique (non-default) BLE and Serial device connection settings + codecs to parse key:value pairs from streamed data channels
export const Devices = {
    BLE:{
        'nrf5x': nrf5xBLESettings,
        'hegduino': hegduinoBLESettings,
        'hegduinoV1': hegduinoV1BLESettings,
        'cognixionONE': cognixionONEBLESettings,
        'statechanger': statechangerBLESettings,
        'blueberry': blueberryBLESettings,
        'blueberry2': blueberry2BLESettings,
        'heart_rate': heartRateBLESettings,
        'freeEEG16': freeeeg16BLESettings
    },
    USB:{
        'nrf5x':nrf5xSerialSettings,
        'freeEEG16':freeeeg16SerialSettings,
        'freeEEG32':freeeeg32SerialSettings,
        'freeEEG32_optical':freeeeg32_optical_SerialSettings,
        'freeEEG128':freeeeg128SerialSettings,
        'hegduino':hegduinoSerialSettings,
        'hegduinoV1':hegduinoV1SerialSettings,
        'cyton':cytonSerialSettings,
        'cyton_daisy':daisycytonSerialSettings,
        'peanut':peanutSerialSettings,
        'statechanger':statechangerSerialSettings,
        'cognixionONE':cytonSerialSettings
    },
    CUSTOM_BLE:{ //OTHER indicates drivers not written by us that do not fit into our format readily, but we can generalize easily to get the multithreading benefits
        'muse':museSettings,
        'ganglion':ganglionSettings
    },
    CUSTOM_USB : {},
    CUSTOM : {
        'webgazer':webgazerSettings
    }
};

// For device debugger:
//...filterPresets
//...chartSettings
//...decoders //decoders to transform any raw outputs not specified to a device

```


### Stream Worker Template
This is the required base template for our web worker system. You can update the Devices list yourself with your own custom list this way. Otherwise, there is a worker service baked into the library. You can copy that file and our dependencies and work from there, or use the following. Note this is required if you want to customize the device list to take advantage of the multithreaded codec and IIR filters.
```ts
import {  WorkerService, workerCanvasRoutes, subprocessRoutes } from 'graphscript'

import { streamWorkerRoutes } from 'device-decoder/src/stream.routes' 

import { Devices } from 'device-decoder/src/devices'

declare var WorkerGlobalScope;

if(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {

    globalThis.Devices = Devices;

    const worker = new WorkerService({
        roots:{
            ...workerCanvasRoutes,
            ...subprocessRoutes,
            ...streamWorkerRoutes
        }
    });
}

export default self as any; //you can import this as a global in tinybuild to trigger bundling or just add it as an entrypoint to esbuild. 

```

