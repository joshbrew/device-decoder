# device-decoder

`npm i device-decoder`

This is a streamlined package to work with streaming devices in-browser or in-app efficiently and create a uniform pattern for outputs.

The `OTHER` drivers are contained in a separate `device-decoder.third-party` package as they contain much larger third party drivers that have been formatted with simple objects you can also create yourself to pipe through our threading system. Two drivers are the same size as our whole library (not including the browserfs and gpujs additions)

See https://github.com/joshbrew/device_debugger for more details and examples

Supports Web Bluetooth API + Mobile Native (via `@capacitor-community/bluetooth-le`) and Web Serial API with convenient wrappers.

Easily add your own decoders to Devices by following the formats outlined at the above github link.

You can also import initDevice and Devices directly into browser from the cdnjs link (installed to window.initDevice and window.Devices) via 
```html
<script src="https://cdn.jsdelivr.net/npm/device-decoder@latest/dist/device.frontend.js"></script>
```


```ts

import {initDevice, Devices} from 'device-decoder'

console.log(Devices); //see supported devices and customize callbacks before instantiating


let info = initDevice(
    'BLE', 
    'hegduino', 
    {
        ondecoded:(data)=>{ //data received back from codec thread
            console.log(data)
        },
        onconnect: (deviceInfo) => {}, //optionally specify an onconnect handler
        ondisconnect:(deviceInfo) => {}, //optionally specify an ondisconnect handler
    }
    //renderSettings //e.g. specify a thread with rendering functions that receives data directly from the decoder thread (no round trip to main thread)
) as DeviceInfo;
//devices are subscribed to automatically when passing an ondecoded callback or object e.g. with specifics for different BLE notifications


type DeviceInfo = {
    device:any, //the info object, api-specific data object
    workers:any, //workes associated with this device stream
    disconnect:()=>void //device disconnect macro
    read:(command:any)=>Promise<any> //device read macro (e.g. for BLE read characteristics),
    write:(command:any)=>Promise<any> //device write macro (e.g. for Serial commands or BLE write characteristics)
}

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

It also exports `BLE`, `workers` which are instances of utilities used internally. It also exports `gsworker` as a usable compiled dataUrl of stream.worker, which it uses internally, so you can control more about the API as you need without additional files from the main dist/device.frontend.js 

NOTE: that for BLE devices with multiple notification or read characteristics, you can supply an object to the `ondecoded` property in initDevice and then specify callback functions per-characteristic. The routes will subscribe to the dedicating stream parsing worker (one per initDevice call) and will receive all outputs from there so you will need to constrain the pipeline from there yourself. 
