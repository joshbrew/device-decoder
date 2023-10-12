# device-decoder
`device-decoder` is a JavaScript library for uniformly and efficiently working with streaming devices on web pages and native apps. It is multithreaded by default with dedicated codec threads, serial threads, and can be used with custom codecs you write following our conventions.

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
<script src="https://cdn.jsdelivr.net/npm/device-decoder@latest/dist/device.frontend.esm.js"></script>
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
        //reconnect?:true //for USB connections, if usbVendorId and usbProductId are provided and a previous connection was permitted. For BLE provide the deviceId from info.device.deviceId saved from a previous connection. For USB ports use info.device.port.getInfo();
        ondecoded: (data) => console.log(data), //results supplied through codec
        ondata?:(data) => console.log(data), //results direct from device, e.g. bypass codec threads (or use both)
        onconnect: (deviceInfo) => console.log(deviceInfo),
        ondisconnect: (deviceInfo) => console.log(deviceInfo),
        filterSettings: {red:{ useLowPass:true, lowpassHz:50 }, infrared:{ useLowpass:true, lowpassHz:50 }} //IIR Filter settings per output key based on the codec results. See FilterSettings type. sample rate is preprogrammed or can be set in each channel setting
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
- `freeEEG16` : Connect to Dmitry Sukhoruchkin's FreeEEG16 module (ESP32 based) over BLE

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
- `freeEEG16` : Connect to Dmitry Sukhoruchkin's FreeEEG16 module (ESP32 based) over USB

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

### Add your Own Drivers

See [docs](https://github.com/brainsatplay/device-decoder/tree/master/src/devices)

[nRF52 microcontroller prototypes]: (https://github.com/joshbrew/nRF52-Biosensing-Boards
