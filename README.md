# device-decoder
`device-decoder` is a JavaScript library for uniformly and efficiently working with streaming devices on web pages and native apps.

This supports Web Bluetooth API + Native Mobile (via [`@capacitor-community/bluetooth-le`](https://github.com/capacitor-community/bluetooth-le)) and Web Serial API using convenient wrappers. 

> **Note:** Android has severe limits with Web Bluetooth (e.g. 20 byte MTU limit, 512 byte limit elsewhere) so the native library is necessary for mobile builds.

## Packages
- `device-decoder` is the main package for decoding and rendering data from streaming devices ([source](./src/device.frontend.ts))
- `ble-wrapper` wraps @capacitor-community/bluetooth-le with easier handles ([source](./src/ble))
- `webserial-wrapper` wraps the Web Serial API with easy handles and buffering + transform stream support ([source](./src/serial))
- `device-decoder.third_party` contains wrappers for third party libraries. Includes Muse, Ganglion, and Webgazer (eye tracking) ([source](./src/devices/third_party/index.ts)). Import `Devices` from this to get a complete device list including these extra, much fatter drivers.

## Examples
- A general purpose debugger for BLE and USB streaming devices ([source](./debugger), [website](https://devicedebugger.netlify.app))
- An EEG acquisition system with filters and coherence analysis ([source](https://github.com/brainsatplay/graphscript/tree/master/examples/eegnfb))
- An HEG-FNIRS acquisition system with auditory feedback ([source](https://github.com/brainsatplay/graphscript/tree/master/examples/audiofeedback))
- A multimodal data acquisition system with alerts for specific sensors ([source](https://github.com/brainsatplay/js-biosensor-modules), [website](https://modules.brainsatplay.com/))

## Installation
You can use the `device-decoder` library in your project in a few different ways. 

If you're using NPM to manage your project, you can install the library with the following command:

```bash
npm install device-decoder
```

Otherwise, it may be more convenient to use a **CDN link** to import the library directly into your project:
```html
<script src="https://cdn.jsdelivr.net/npm/device-decoder@latest"></script>
```

Regardless of your import source, you may find it useful to use **ES Modules** to explicitly include variables from the library in your code:
```js
import { Devices, initDevice } from 'device-decoder'
```

```js
import { Devices, initDevice } from 'https://cdn.jsdelivr.net/npm/device-decoder@latest'
```

## Getting Started
Provide a configuration object from `Devices` as the first argument in `initDevice` to initialize a multithreaded decoding and rendering pipeline.

```js
let info = initDevice(
    Devices['BLE']['hegduino'],

    // Optional settings
    {
        //devices: Devices // A custom device list
        //workerUrl: './stream.worker.js' // Specify a custom worker (using the template at the bottom of this documentation file)
        ondecoded: (data) => console.log(data),
        onconnect: (deviceInfo) => console.log(deviceInfo),
        ondisconnect: (deviceInfo) => console.log(deviceInfo) 
    }
)
```

The default `Devices` object is organized as follows:

#### BLE
- `nrf5x`: Connect to our [nRF52 microcontroller prototypes] over BLE.
- `hegduino`: Connect to the [HEGduino](https://github.com/joshbrew/HEG_ESP32) over BLE.
- `cognixionONE`: Connect to the [Cognixion ONE](https://one.cognixion.com/) over BLE.
- `statechanger`:  Connect to the Statechanger HEG over BLE.
- `blueberry`:  Connect to the [Blueberry](https://blueberryx.com/) over USB.
- `blueberry2`: Connect to the [Blueberry](https://blueberryx.com/) (v2) over USB.
- `heart_rate`: Connect to the generic bluetooth heart rate characteristic (compatible with many devices)

#### USB
- `nrf5x`: Connect to our [nRF52 microcontroller prototypes] over USB.
- `freeEEG32`: Connect to the [FreeEEG32](https://github.com/neuroidss/FreeEEG32-beta) over USB.
- `freeEEG32_optical`: Connect to the [FreeEEG32](https://github.com/neuroidss/FreeEEG32-beta) over optical USB.
- `freeEEG128`: Connect to the [FreeEEG128](https://github.com/neuroidss/FreeEEG128-alpha) over USB.
- `hegduino`: Connect to the [HEGduino](https://github.com/joshbrew/HEG_ESP32) over USB.
- `cyton`: Connect to the [OpenBCI Cyton](https://shop.openbci.com/products/cyton-biosensing-board-8-channel) over USB.
- `cyton_daisy`: Connect to the [OpenBCI Cyton + Daisy](https://shop.openbci.com/products/cyton-daisy-biosensing-boards-16-channel) over USB.
- `peanut`: Connect to the Peanut HEG over USB.
- `statechanger`: Connect to the Statechanger HEG over USB.
- `cognixionONE`: Connect to the [Cognixion ONE](https://one.cognixion.com/) over USB.

#### CUSTOM

- `simulator`: generates sine waves. You can easily modify this protocol.
- `webgazer`: (via `device-decoder.third_party`), webcam-based eye tracking via [Webgazer.js](https://webgazer.cs.brown.edu/)!

#### BLE_CUSTOM (under `device-decoder.third_party`)
- `muse`: Integrates with the [muse-js](https://github.com/urish/muse-js) library.
- `ganglion`: Modifies the [ganglion-ble](https://github.com/neurosity/ganglion-ble/tree/master/src) library.

Other ideas would be creating media stream drivers to run processes on threads e.g. for audio and video.

These drivers are formatted with simple objects to generalize easily and get the multithreading benefits of `device-decoder`.

You can create these simple objects to pipe anything through our threading system!

### Monitoring Multiple Characteristics
For BLE devices with multiple notification or read characteristics, you can supply an object to the `ondecoded` property in `initDevice`. 
This allows you to specify callback functions for each characteristic. 

You will need to know which characteristics to specify from the device profile.
```js

const device =  Devices['BLE']['nrf5x']
const services = device.services
let service = Object.keys(services)[0];
let characteristics = Object.keys(services[service]);

let info = initDevice(
    device,

    {
        ondecoded: {
            [characteristics[0]]: (data) => console.log(data),
            [characteristics[1]]: (data) => console.log(data)
        },
    }
)
```

You may also specify `roots` in the config object which will subscribe to all outputs from the stream worker thread to be used with [`graphscript`](https://github.com/brainsatplay/graphscript) formatting. In the [`eegnfb`](https://github.com/brainsatplay/graphscript/examples/eegnfb) example in the GS repo we demonstrated piping multiple workers this way e.g. to run algorithms or build CSV files in IndexedDB.

## Contributing

### How to Write your Own Drivers
> **Note:** To add your new driver the library's source, in [`./src/devices/index.ts`](./src/devices/index.ts), link the new settings to the Devices object. You can add chart and filter settings too which can be enabled following the streamWorkerRoutes calls, which right now are demonstrated in a couple examples.

#### BLE
To create a device profile for our [nRF52 microcontroller prototypes], you would create a new file in [`./src/devices`](./src/devices) called `nrf5x.ts` and add the following:

> **Note:** For a simpler example, you can look at the the [Blueberry](./src/devices/blueberry.ts) device profile.

```js
export const bleSettings = {
    deviceType:'BLE',
    deviceName:'nrf5x',
    services:{
        '0000cafe-b0ba-8bad-f00d-deadbeef0000':{
            '0001cafe-b0ba-8bad-f00d-deadbeef0000':{
                write:undefined
            },
            '0002cafe-b0ba-8bad-f00d-deadbeef0000':{ //ads131m08
                notify:true,
                codec:ads131m08codec
            },
            '0003cafe-b0ba-8bad-f00d-deadbeef0000':{ //max30102
                notify:true,
                codec:max3010xcodec
            },
            '0004cafe-b0ba-8bad-f00d-deadbeef0000':{ //mpu6050
                notify:true,
                codec:mpu6050codec
            },
            '0006cafe-b0ba-8bad-f00d-deadbeef0000':{ //ads131m08-2
                notify:true,
                codec:ads131m08codec
            }
        }// each notification is for a different sensor
    }
}
```

#### USB
Adding USB support for our [nRF52 microcontroller prototypes] is pretty similar:

```js
import { ads131m08codec } from './ads131m08';
import { max3010xcodec } from './max30102';
import { mpu6050codec } from './mpu6050';

export function usbcodec(data) {
    let arr; 
    if (!data.buffer) arr = new Uint8Array(data); 
    else arr = data as Uint8Array;

    const output = {};

    if (arr[0] === 2) Object.assign(output,ads131m08codec(arr.subarray(2)));
    else if (arr[0] === 3) {
        let result = ads131m08codec(arr.subarray(2));
        Object.keys(result).forEach((key,i) => {
            output[i+8] = result[key];
        })
    } 
    else if (arr[0] === 4) Object.assign(output,mpu6050codec(arr.subarray(2)));
    else if (arr[0] === 5) Object.assign(output,max3010xcodec(arr.subarray(2)));
    else Object.assign(output,ads131m08codec(arr));

    return output;
}

export const serialSettings = {
    deviceType:'USB',
    deviceName:'nrf5x',
    baudRate:115200,
    buffering:{
        searchBytes:new Uint8Array([240,240])
    },
    codec: usbcodec
}
```

#### Custom API
If you have an existing API that acquires or generates data, you can wrap this in a `device-decoder` device profile to take advantage of the same threading features:

```js

export const customDevice = {
    deviceType:'CUSTOM',
    deviceName:'custom',
    connect:(settings) => {

        let info = Object.assign(Object.assign({},customDevice),settings); //e.g. create a copy of this settings object for this connection instance
        
        let device = Device()
        
        device.ondata = info.ondata;
        
        device.connect();

        info.device = device;

        info.onconnect(info);

        return info;
        
    },
    disconnect: (info) => {
        info.device.disconnect();
        info.ondisconnect(info);
    },
    onconnect: (info) => console.log('connected!', info),
    ondata: (data:any) => customDevice.codec(data),
    ondisconnect: (info) => console.log('disconnected!', info),
    codec: (data:any) => JSON.stringify(data),
    read: (command:any) => device.read(command).
    write: (command:any) => device.write(command)
}

```

### Adding Chart and Filter Settings
This is just an extra feature for the debugger example and in our other examples. You may ignore this otherwise.

```js
export const chartSettings = {
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

export const filterSettings = {
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

### Stream Worker Template
This is the required base template for our web worker system. You can update the Devices list yourself with your own custom list this way. Otherwise, there is a worker service baked into the library.

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

export default self as any;

```

## Acknowledgments
This repository is maintained by [Joshua Brewster](https://github.com/joshbrew) and [Garrett Flynn](https://github.com/garrettmflynn), who use contract work and community contributions through [Open Collective](https://opencollective.com/brainsatplay) to support themselves.

### Backers
[Support us with a monthly donation](https://opencollective.com/brainsatplay#backer) and help us continue our activities!

<a href="https://opencollective.com/brainsatplay/backer/0/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/0/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/1/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/1/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/2/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/2/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/3/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/3/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/4/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/4/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/5/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/5/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/6/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/6/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/7/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/7/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/8/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/8/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/9/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/9/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/10/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/10/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/11/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/11/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/12/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/12/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/13/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/13/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/14/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/14/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/15/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/15/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/16/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/16/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/17/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/17/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/18/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/18/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/19/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/19/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/20/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/20/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/21/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/21/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/22/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/22/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/23/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/23/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/24/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/24/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/25/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/25/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/26/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/26/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/27/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/27/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/28/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/28/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/29/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/29/avatar.svg"></a>

### Sponsors

[Become a sponsor](https://opencollective.com/brainsatplay#sponsor) and get your logo here with a link to your site!

<a href="https://opencollective.com/brainsatplay/sponsor/0/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/1/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/2/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/3/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/4/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/5/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/6/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/7/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/8/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/9/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/9/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/10/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/10/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/11/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/11/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/12/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/12/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/13/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/13/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/14/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/14/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/15/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/15/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/16/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/16/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/17/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/17/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/18/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/18/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/19/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/19/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/20/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/20/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/21/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/21/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/22/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/22/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/23/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/23/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/24/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/24/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/25/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/25/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/26/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/26/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/27/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/27/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/28/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/28/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/29/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/29/avatar.svg"></a>


[nRF52 microcontroller prototypes]: (https://github.com/brainsatplay/nRF52-Biosensing-Boards
