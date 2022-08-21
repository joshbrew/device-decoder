## General purpose BLE and USB browser debugger
The BLE will bundle to mobile too, we will release an APK of this app to test.

This app is a multiple concurrent BLE and USB Serial device debugger with programmable decoders and selective interaction with each device/ble service characteristic. Produces a little debugger window for each connected device with individual controls and output consoles/charts. Hover over the chart for more controls.

Live demo: https://devicedebugger.netlify.app


#### To run:

`tinybuild` or `npm i -g tinybuild & tinybuild`

### Built-in drivers:

See [`src/devices/README.md`](./src/devices/README.md) for adding your own drivers or customizing existing ones

```ts
//containe unique (non-default) BLE and Serial device connection settings + codecs to parse key:value pairs from streamed data channels
export const Devices = {
    BLE:{
        'nrf5x':nrf5xBLESettings,
        'hegduino':hegduinoBLESettings,
        'cognixionONE':cognixionONEBLESettings,
        'statechanger':statechangerBLESettings,
        'blueberry':blueberryBLESettings,
        'blueberry2':blueberry2BLESettings
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
        'muse':museSettings
    },
    USB_OTHER : {},
    OTHER : {}
};

```

##### BLE and USB API wrappers:

- [`ble_client.ts`](./src/ble) wraps @capacitor-community/bluetooth-le with easier handles
- [`serialstream.ts`](./src/serial) wraps the Web Serial API with easy handles and buffering + transform stream support

##### General purpose wrapper: 

- [`device.frontend.ts`](./src)

Use `initDevice` and provide settings based on the above Devices object to create a multithreaded decoding and rendering pipeline.

```ts
let info = initDevice(
    'BLE', 
    'hegduino', 
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

See [`test.ts`](./test.ts) for an example of it in action.

#### Debugger app Features: 
- Generate consoles and charts for each connected BLE and Serial device. Decode raw data using our presets or write-in your own decoders. Each serial device or notification stream gets dedicated workers for parsing and charting data. 
- See BLE services based on the primary service characteristics you provide (due to security rules in browser you need to know the UUIDs)
- Apply digital filters and scalars to charts, toggle lines being viewed, attempt to generate lines in unknown streams
- Parse UTF8 and arduino-like debug streams e.g. 'red: 123 \t blue:345 \r\n'
- Set endstops bytes in serial streams, write-in custom decoders or look at src/devices/index.ts for how to integrate your own decoder, charting, and filtering preset rules into the browser.


- For BLE: @capacitor-community/ble library so this can be dropped right into native mobile applications without changing your code. 
- For USB: Web Serial API, which is not available on mobile.

Live demo: https://devicedebugger.netlify.app

#### TODO:
- csvs on a data collection thread, use indexeddb to prevent memory overflows
- more styling, bug proofing

#### Why?

We need this for our own hardware to remove any performance concerns with massive amounts of data. We we wanted to produce a proper web benchmark and debugger tool for Serial and BLE sensors in general as this is super useful stuff.

Features [graphscript](https://github.com/brainsatplay/graphscript) to script the site efficiently.

![d](./debugger.png)


License: AGPL v3.0

Joshua Brewster