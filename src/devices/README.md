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
    buffering:{
        searchBytes:new Uint8Array([240,240])
    },
    codec:nrf5x_usbcodec
}

export const nrf5xBLESettings = {
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

You may also add filter settings to apply in the worker codecs automatically. There are additional controls to toggle them on the fly if you dig into the stream.worker's routes

### Other

Say we want to support a driver that does not give us the raw data but want to feed it into our multithreading pipeline and general application settings. See [`muse.ts`](./muse.ts) for an implementation with conditionally included dependencies.


Create an object like:

```ts

export const customDevice = {
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
        info.ondisconnect(info);
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

In [`index.ts`](./index.ts), link the new settings to the relevant objects 


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
    BLE_OTHER:{ //OTHER indicates drivers not written by us that do not fit into our format readily, but we can generalize easily to get the multithreading benefits
        'muse':museSettings,
        'ganglion':ganglionSettings
    },
    USB_OTHER : {},
    OTHER : {}
};

// For device debugger:
//...filterPresets
//...chartSettings
//...decoders //decoders to transform any raw outputs not specified to a device

```