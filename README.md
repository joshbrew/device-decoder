# device-decoder

`npm i device-decoder`

This is a streamlined package to work with streaming devices in-browser or in-app efficiently and create a uniform pattern for outputs. 


Examples: 

- General purpose debugger with example codecs: [./debugger](./debugger), [Live Link](https://devicedebugger.netlify.app)
- EEG with filters and Coherence FFTs example: [`https://github.com/brainsatplay/graphscript/examples/eegnfb`](https://github.com/brainsatplay/graphscript/examples/eegnfb)
- HEG-FNIRS with audio feedback example: [`https://github.com/brainsatplay/graphscript/examples/audiofeedback`](https://github.com/brainsatplay/graphscript/examples/audiofeedback)
- 4 sensors off one BLE device with alerts for specific sensors: [`https://github.com/brainsatplay/js-biosensor-modules`](https://github.com/brainsatplay/js-biosensor-modules), [Live Link](https://nrf5xsensortest.netlify.app/)

##### General purpose wrapper: 

- [`device.frontend.ts`](./src/device.frontend.ts)

Use `initDevice` and provide settings based on the above Devices object to create a multithreaded decoding and rendering pipeline.

```ts

import {Devices, initDevice} from 'device-decoder'

let info = initDevice(
    Devices['BLE']['hegduino'],
    {
        //devices:Devices //e.g. a custom device list?
        //workerUrl:'./stream.worker.js', //e.g. a custom worker? Needs to follow the base template (at bottom of readme) 
        ondecoded:(data)=>{ //data received back from codec thread
            console.log(data)
        },
        onconnect: (deviceInfo) => {}, //optionally specify an onconnect handler
        ondisconnect:(deviceInfo) => {}, //optionally specify an ondisconnect handler
    }
    //renderSettings //e.g. specify a thread with rendering functions that receives data directly from the decoder thread (no round trip to main thread)
);

if(info) { //returns a promise
    info.then((result) => {
        console.log(result);
        let disc = document.createElement('button');
        disc.innerHTML = `Disconnect hegduino (BLE)`;
        disc.onclick = () => {
            result.disconnect();
            disc.remove();
        }
        document.body.appendChild(disc);
    })
}
```


Supports Web Bluetooth API + Mobile Native (via `@capacitor-community/bluetooth-le`) and Web Serial API with convenient wrappers.

You can also import initDevice and Devices directly into browser from the cdnjs link (installed to window.initDevice and window.Devices) via 
```html
<script src="https://cdn.jsdelivr.net/npm/device-decoder@latest/dist/device.frontend.js"></script>
```

NOTE: that for BLE devices with multiple notification or read characteristics, you can supply an object to the `ondecoded` property in initDevice and then specify callback functions per-characteristic. The routes will subscribe to the dedicating stream parsing worker (one per initDevice call) and will receive all outputs from there so you will need to constrain the pipeline from there yourself. 

```ts
//contains unique (non-default) BLE and Serial device connection settings + codecs to parse key:value pairs from streamed data channels
export const Devices = {
    BLE:{
        'nrf5x':nrf5xBLESettings,
        'hegduino':hegduinoBLESettings,
        'cognixionONE':cognixionONEBLESettings,
        'statechanger':statechangerBLESettings,
        'blueberry':blueberryBLESettings,
        'blueberry2':blueberry2BLESettings,
        'heart_rate':heartRateBLESettings //generic bluetooth heart rate characteristic (compatible with many devices)
    },
    USB:{
        'nrf5x':nrf5xSerialSettings,
        'freeEEG32':freeeeg32SerialSettings,
        'freeEEG32_optical':freeeeg32_optical_SerialSettings,
        'freeEEG128':freeeeg128SerialSettings,
        'hegduino':hegduinoSerialSettings,
        'cyton':cytonSerialSettings,
        'cyton_daisy':cytonSerialSettings,
        'peanut':peanutSerialSettings,
        'statechanger':statechangerSerialSettings,
        'cognixionONE':cytonSerialSettings
    },
    BLE_CUSTOM:{ //CUSTOM indicates drivers not written by us that do not fit into our format readily, but we can generalize easily to get the multithreading benefits
        'muse':museSettings,
        'ganglion':ganglionSettings
    },
    USB_CUSTOM : {},
    CUSTOM : {}
};

```

The `CUSTOM` drivers are contained in a separate `device-decoder.third-party` package as they contain much larger third party drivers that have been formatted with simple objects you can also create yourself to pipe through our threading system.


##### Standalone BLE and USB API wrappers:

These are installable as independent and very minimal packages, the BLE library includes capacitor's BLE library for native mobile support (better than Web Bluetooth)

- [`ble_client.ts`](./src/ble) wraps @capacitor-community/bluetooth-le with easier handles
- [`serialstream.ts`](./src/serial) wraps the Web Serial API with easy handles and buffering + transform stream support

## Device Drivers

We've whittled down the work required to support device streaming in the web down to a few definitions that you can use for settings in our framework.

You can add your own device profiles easily with a custom name and and the workers will handle transferring custom profiles to threads.

If your device profile is using imported utilities, it cannot simply be transferred unless you know what utilities are available on globalThis on the worker, so you need to create your own worker and make sure a modified Devices list is present. We demonstrated this a bit in our own workers, e.g. with our usage of ByteParser.


#### See [`src/devices/index.ts`](./src/devices/index.ts) for supported settings

### BLE

Using `@capacitor-community/bluetooth-le` for an interoperable Web Bluetooth API + Native Android or IOS library,
we have a nice set of controls for easily creating bluetooth LE drivers that are lightweight and interoperable. The Web Bluetooth APIs are either broken or locked on mobile so this is the best workaround, and does not require differentiating code based on platform.

To add your own BLE drivers, you can model your drivers after this format then set the settings accordingly in `index.ts`

Here is a very simple example from [`./src/devices/blueberry.ts`](./src/devices/blueberry.ts):

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
    deviceType:'BLE', //required
    deviceName:'blueberry', //required
    namePrefix:'blueberry',
    services:{
        '0f0e0d0c-0b0a-0908-0706-050403020100':{
            '1f1e1d1c-1b1a-1918-1716-151413121110':{
                write:undefined //e.g. new Uint8Array([0xA0],[redValue], [greenValue], [blueValue]); //for rgb controller
            },
            '3f3e3d3c-3b3a-3938-3736-353433323130':{
                codec:blueberrycodec, //specific callback for this characteristic
                notify:true, //subscribe for notifications
            }
        }
    }
} as BLEDeviceSettings
```


You can see the expected settings for each type of device here:
```ts


type BLEDeviceSettings = {
    deviceType:'BLE',
    deviceName:string,
    sps?:number, //samples per second
    codec?:(data:any) => {[key:string]:any}, //transform data into a dictionary (preferred)
    services?:{ 
        [key:string]:{ // service uuid you want to set and all of the characteristic settings and responses, keys are UUIDs
            [key:string]:{ // services can have an arbitrary number of characteristics, keys are UUIDs
                codec?:(data:any) => {[key:string]:any},  //you can have specific codecs for specific notify characteristics
                
                read?:boolean, //should we read on connect
                readOptions?:TimeoutOptions,
                readCallback?:((result:DataView)=>void),
                write?:string|number|ArrayBufferLike|DataView, //should we write on connect and what should we write?
                writeOptions?:TimeoutOptions,
                writeCallback?:(()=>void),
                notify?:boolean, //can this characteristic notify?
                notifyCallback?:((result:DataView)=>void)
                [key:string]:any
            }
        }
    }
} & BLEDeviceOptions

type SerialDeviceSettings = {
    deviceType:'USB',
    deviceName:string,
    sps?:number, //samples per second
    buffering?:{
        searchBytes:Uint8Array
    },
    codec:(data:any) => {[key:string]:any}, //transform raw data into a dictionary (preferred)
} & SerialPortOptions

type CustomDeviceSettings = {
    deviceType:'CUSTOM'|'BLE_CUSTOM'|'USB_CUSTOM',
    deviceName:string,
    sps?:any, //samples per second
    connect:(settings:any) => {
        _id:string, //info object used in later callbacks
        [key:string]:any
    },
    codec:(data:any) => { //transform data into a dictionary (preferred) //this runs on a thread so you can do more complex stuff at high speeds
        [key:string]:any
    },
    disconnect:(info) => void,
    //optional callbacks:
    onconnect?:(info) => void,
    beforedisconnect?:(info) => void,
    ondisconnect?:(info) => void,
    read?:(command:any) => any,
    write?:(command:any) => any
}


```



And to add specific chart settings in the debugger or if you want to use our webgl plot util in other apps:

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

Adding USB drivers is pretty similar, here is an example of cross USB and BLE support from [`./src/devices/nrf5x.ts`](./src/devices/nrf5x.ts) which is a custom device that has modular sensor support.

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
    deviceType:'USB',
    deviceName:'nrf5x',
    baudRate:115200,
    buffering:{
        searchBytes:new Uint8Array([240,240])
    },
    codec:nrf5x_usbcodec
}

```


You may also add filter settings to apply in the worker codecs automatically. There are additional controls to toggle them on the fly if you dig into the stream.worker's routes

```ts

export const nrf5xBLESettings = {
    deviceType:'BLE',
    deviceName:'nrf5x',
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
}


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

```

### CUSTOM

Say we want to support a driver that does not give us the raw data but want to feed it into our multithreading pipeline and general application settings. See [`muse.ts`](./muse.ts) for an implementation with conditionally included dependencies.


Create an object like:

```ts

export const customDevice = {
    deviceType:'CUSTOM',
    deviceName:'custom',
    connect:(settings:{})=>{
        //e.g.
        let info = Object.assign(Object.assign({},customDevice),settings); //e.g. create a copy of this settings object for this connection instance
        
        let device = Device() //some driver
        
        device.ondata = info.ondata;
        
        device.connect();

        info.device = device;

        info.onconnect(info);

        return info;
        
    }, //-> init device and scripts
    disconnect:(info)=>{
        info.device.disconnect();
        info.ondisconnect(info);BLE_CUSTOM
    }, //-> close device connection
    onconnect:(info)=>{ console.log('connected!', info) }, //-> onconnect callback you can customize
    ondata:(data:any)=>{ return customDevice.codec(data); }, //-> ondata callback you can customize
    ondisconnect:(info)=>{ console.log('disconnected!', info) }, //-> disconnect callback you can customize
    codec:(data:any)=>{ return JSON.stringify(data); } //-> optionally used to transform data e.g. on a separate thread, libraries like muse-js already do some of this for us so we can customize ondata to pass slightly modified outputs to threads, and use the codec to do some kind of special math on a thread
    read?:(command:any)=>{ return device.read(command);}
    write?:(command:any)=>{ return device.write(command); }
}

```

### Finally

In [`./src/devices/index.ts`](./src/devices/index.ts), link the new settings to the relevant objects 

```ts

//containe unique (non-default) BLE and Serial device connection settings + codecs to parse key:value pairs from streamed data channels
export const Devices = {
    BLE:{
        'nrf5x':nrf5xBLESettings,
        'hegduino':hegduinoBLESettings,
        'cognixionONE':cognixionONEBLESettings,
        'statechanger':statechangerBLESettings,
        'blueberry':blueberryBLESettings,
        'blueberry2':blueberry2BLESettings,
        'heart_rate':heartRateBLESettings //generic bluetooth heart rate characteristic (compatible with many devices)
    },
    USB:{
        'nrf5x':nrf5xSerialSettings,
        'freeEEG32':freeeeg32SerialSettings,
        'freeEEG32_optical':freeeeg32_optical_SerialSettings,
        'freeEEG128':freeeeg128SerialSettings,
        'hegduino':hegduinoSerialSettings,
        'cyton':cytonSerialSettings,
        'cyton_daisy':cytonSerialSettings,
        'peanut':peanutSerialSettings,
        'statechanger':statechangerSerialSettings,
        'cognixionONE':cytonSerialSettings
    },
    BLE_CUSTOM:{ //CUSTOM indicates drivers not written by us that do not fit into our format readily, but we can generalize easily to get the multithreading benefits
        'muse':museSettings,
        'ganglion':ganglionSettings
    },
    USB_CUSTOM : {},
    CUSTOM : {}
};

// For device debugger:
//...filterPresets
//...chartSettings
//...decoders //decoders to transform any raw outputs not specified to a device

```


### Stream Worker Template

This is the required base template for our web worker system. You can update the Devices list yourself with your own custom list this way,
else there is a worekr baked into the library.

```ts
import { 
    WorkerService, 
    workerCanvasRoutes, 
    //GPUService, 
    subprocessRoutes,
//    loadAlgorithms
} from 'graphscript'//"../../GraphServiceRouter/index"//'graphscript'/////"../../GraphServiceRouter/index";//from 'graphscript'
import { 
    streamWorkerRoutes 
} from './stream.routes';

import { Devices } from './devices';

// import { 
//     algorithms,
//     //csvRoutes,
//     //BFSRoutes
//  } from 'graphscript-services'//"../../GraphServiceRouter/extras/index.services"//'graphscript-services'//"../../GraphServiceRouter/extras/index.services"
//  //; //"../../GraphServiceRouter/index.services"

// loadAlgorithms(algorithms);

declare var WorkerGlobalScope;

if(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {

    globalThis.Devices = Devices; //you can customize this list yourself, else the streamWorkerRoutes uses the library defaults 
    // so if you want more default drivers e.g. with complicated imports then make your own worker so you can update this list

    const worker = new WorkerService({
        //props:{} //could set the props instead of globalThis but it really does not matter unless you want to bake in for more complex service modules
        roots:{
            //GPUService as any,
            ...workerCanvasRoutes,
            //unsafeRoutes, //allows dynamic route loading
            ...subprocessRoutes, //includes unsafeRoutes
            // BFSRoutes,
            // csvRoutes,
            ...streamWorkerRoutes
        }
    });
}

export default self as any;



```