# device-decoder

`npm i device-decoder`

See https://github.com/joshbrew/device_debugger for more details and examples

Supports Web Bluetooth API + Mobile Native (via `@capacitor-community/bluetooth-le`) and Web Serial API with convenient wrappers.

Easily add your own decoders to Devices by following the formats outlined at the above github link.

```ts

import {initDevice, Devices} from 'device-decoder

console.log(Devices); //see supported devices and customize callbacks before instantiating

let info = initDevice(
    'BLE', 
    'hegduino', //e.g. selected from lists, or we can only support specific devices as needed
    (data)=>{ //data received back from codec thread
        console.log(data)
    }//,
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

It also exports `BLE`, `workers`, and `gsworker` as a usable dataUrl of stream.worker, which it uses internally, so you can control more about the API as you need.