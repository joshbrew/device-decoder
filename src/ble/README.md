
# BLEClient wrapper class

`npm i ble-wrapper`

Convenience features for the @capacitor-community/bluetooth-le API for browser or native mobile. See class usage below. Includes useful byte manipulation callbacks. 19.5kb dist

Instantiate with `const BLE = new BLEClient()`. See class details below.

The main dist includes a globalThis.BLEClient declaration for browser inclusion e.g. from jsdelivr. Only works in compatible browsers.

```ts

type DeviceOptions = {
    namePrefix?: string;
    deviceId?: string;
    onConnect?: () => void;
    onDisconnect?: () => void;
    connectOptions?: TimeoutOptions;
    services: {
        [key: string]: {
            [key: string]: {
                read?: boolean;
                readOptions?: TimeoutOptions;
                readCallback?: ((result: DataView) => void);
                write?: string | number | ArrayBufferLike | DataView;
                writeOptions?: TimeoutOptions;
                writeCallback?: (() => void);
                notify?: boolean;
                notifyCallback?: ((result: DataView) => void);
                [key: string]: any;
            };
        };
    };
};

type DeviceInfo = {
    device: BleDevice;
    options: DeviceOptions;
};

class BLEClient {
    client: BleClientInterface;
    devices: {
        [key: string]: DeviceInfo;
    };
    location?: boolean;
    constructor(options: DeviceOptions, location?: boolean);
    setup(options: DeviceOptions, location?: boolean): Promise<DeviceInfo>;
    initialize(options: InitializeOptions): Promise<true>;
    requestDevice(request: RequestBleDeviceOptions, options: DeviceOptions): Promise<BleDevice>;
    setupDevice: (device: BleDevice, options: DeviceOptions) => Promise<DeviceInfo>;
    connect(device: BleDevice, options: DeviceOptions): Promise<BleDevice>;
    reconnect(deviceId: string): Promise<BleDevice>;
    disconnect(device: BleDevice): Promise<void>;
    write(device: BleDevice, service: string, characteristic: string, value: string | number | ArrayBufferLike | DataView | number[], callback?: () => void, options?: TimeoutOptions): Promise<void>;
    read(device: BleDevice, service: string, characteristic: string, ondata?: (result: DataView) => void, options?: TimeoutOptions): Promise<void> | Promise<DataView>;
    subscribe(device: BleDevice, service: string, characteristic: string, ondata: (result: DataView) => void): Promise<void>;
    unsubscribe(device: BleDevice, service: string, characteristic: string): Promise<void>;
    scan(options: RequestBleDeviceOptions, callback: (result: ScanResult) => void): Promise<void>;
    stopScanning(): Promise<void>;
    readDescriptor(device: BleDevice, service: string, characteristic: string, descriptor: string, options?: TimeoutOptions): Promise<DataView>;
    writeDescriptor(device: BleDevice, service: string, characteristic: string, descriptor: string, value: string | number | DataView | ArrayBufferLike | number[], options?: TimeoutOptions): Promise<void>;
    readRssi(device: BleDevice): Promise<number>;
    distance(device: BleDevice, txPower: any, x: number, exp: number, c: number): Promise<number>;
    distanceFromPhone(//https://github.com/kevindigi/android-iot-samples/blob/7fb4b91eb769a3dba06891286f4f2f3249dab2a6/app/src/main/java/com/digicorp/helper/DistanceManager.java#L48
    device: BleDevice, txPower: number, //signal strength at 1 meter, hardware-specific
    model?: string): Promise<number>;
    triangulate: (device: BleDevice, duration?: number, sampleRate?: number) => Promise<unknown>;
    static toDataView(value: string | number | ArrayBufferLike | DataView | number[]): DataView;
    static searchBuffer(buffer: number[] | ArrayBuffer, searchString: Uint8Array, limit?: number): any[];
    static bytesToInt16(x0: number, x1: number): number;
    static bytesToUInt16(x0: number, x1: number): number;
    static Uint16ToBytes(y: number): number[];
    static bytesToInt24(x0: number, x1: number, x2: number): number;
    static bytesToUInt24(x0: number, x1: number, x2: number): number;
    static Uint24ToBytes(y: number): number[];
    static bytesToInt32(x0: number, x1: number, x2: number, x3: number): number;
    static bytesToUInt32(x0: number, x1: number, x2: number, x3: number): number;
    static Uint32ToBytes(y: number): number[];
    static get2sCompliment(val: number, nbits: number): number;
    static getSignedInt(...args: number[]): number;
    static asUint8Array(input: any): Uint8Array;
    static boyerMoore(patternBuffer: any): any;
}

```

Build with `tinybuild`, or `npm i -g tinybuild & tinybuild`

Wrapper for @capacitor-community/bluetooth-le library just for quicker config of multiple devices/services with multiple characteristics per service and customizable responses to those characteristics.

Capacitor required to build mobile apps after bundling the library. 


Capacitor instructions:
#### In your project root
`npm i`

Edit the index.js and optionally the index.html in the `dist/` folder. All public asset files need to end up in `dist/`


#### Build step: 
If no tinybuild installed globally: `npm i -g tinybuild` or to keep it in dev dependencies `npm i --save-dev tinybuild`

Build:
- `tinybuild`

#### Android Studio (install it first)
- `npx cap copy` or `npx cap sync` to sync the www/ dist to the platform-specific folders.
- `npx cap open android` to open android studio ready to build and serve the apk.

Build the android project by click the Make Project hammer icon if it doesn't start automatically. Then if you see BUILD SUCCESSFUL, run with your android device connected or the built-in android emulators active.


#### XCode
- `npx cap copy` or `npx cap sync`
- `npx cap open ios` to open xcode ready to build and serve the app

