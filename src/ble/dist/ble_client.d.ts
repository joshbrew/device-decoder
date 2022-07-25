import { BleClientInterface, BleDevice, InitializeOptions, RequestBleDeviceOptions, ScanResult, TimeoutOptions } from '@capacitor-community/bluetooth-le';
export declare type DeviceOptions = {
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
export declare type DeviceInfo = {
    device: BleDevice;
    options: DeviceOptions;
};
export declare class BLEClient {
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
