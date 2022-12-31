# device-decoder


`npm i device-decoder`

This is a streamlined package to work with streaming devices in-browser or in-app efficiently and create a uniform pattern for outputs. 

You can also import initDevice and Devices directly into browser from the cdnjs link (installed to window.initDevice and window.Devices) via 
```html
<script src="https://cdn.jsdelivr.net/npm/device-decoder@latest/dist/device.frontend.js"></script>

##### General purpose wrapper: 

- [`device.frontend.ts`](./src/device.frontend.ts)

Use `initDevice` and provide settings based on the above Devices object to create a multithreaded decoding and rendering pipeline.

```

```ts
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

Easily add your own decoders to Devices by following the formats outlined at the above github link.

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
    BLE_OTHER:{ //OTHER indicates drivers not written by us that do not fit into our format readily, but we can generalize easily to get the multithreading benefits
        'muse':museSettings,
        'ganglion':ganglionSettings
    },
    USB_OTHER : {},
    OTHER : {}
};

```

The `OTHER` drivers are contained in a separate `device-decoder.third-party` package as they contain much larger third party drivers that have been formatted with simple objects you can also create yourself to pipe through our threading system.


##### Standalone BLE and USB API wrappers:

These are installable as independent and very minimal packages, the BLE library includes capacitor's BLE library for native mobile support (better than Web Bluetooth)

- [`ble_client.ts`](./src/ble) wraps @capacitor-community/bluetooth-le with easier handles
- [`serialstream.ts`](./src/serial) wraps the Web Serial API with easy handles and buffering + transform stream support

