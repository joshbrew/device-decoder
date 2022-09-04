import { ByteParser } from '../util/ByteParser';
import { BleClientInterface, BleDevice, InitializeOptions, RequestBleDeviceOptions, ScanResult, TimeoutOptions } from '@capacitor-community/bluetooth-le';
export declare type BLEDeviceOptions = {
    namePrefix?: string;
    name?: string;
    deviceId?: string;
    onconnect?: () => void;
    ondisconnect?: (deviceId: string) => void;
    connectOptions?: TimeoutOptions;
    services?: {
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
export declare type BLEDeviceInfo = {
    device: BleDevice;
} & BLEDeviceOptions;
export declare class BLEClient extends ByteParser {
    client: BleClientInterface;
    devices: {
        [key: string]: BLEDeviceInfo;
    };
    location?: boolean;
    initialized: boolean;
    constructor(options?: BLEDeviceOptions, location?: boolean);
    setup(options?: BLEDeviceOptions, location?: boolean): Promise<BLEDeviceInfo>;
    initialize(options?: InitializeOptions): Promise<true>;
    requestDevice(request?: RequestBleDeviceOptions, options?: BLEDeviceOptions): Promise<BleDevice>;
    getServices(deviceId: string): Promise<import("@capacitor-community/bluetooth-le").BleService[]>;
    setupDevice: (device: BleDevice, options?: BLEDeviceOptions) => Promise<BLEDeviceInfo>;
    connect(device: BleDevice, options?: BLEDeviceOptions): Promise<BleDevice>;
    reconnect(deviceId: string, options?: BLEDeviceOptions): Promise<BLEDeviceInfo>;
    disconnect(device: BleDevice | string): Promise<void>;
    write(device: BleDevice | string, service: string, characteristic: string, value: string | number | ArrayBufferLike | DataView | number[], callback?: () => void, options?: TimeoutOptions): Promise<void>;
    read(device: BleDevice | string, service: string, characteristic: string, ondata?: (result: DataView) => void, options?: TimeoutOptions): Promise<void> | Promise<DataView>;
    subscribe(device: BleDevice | string, service: string, characteristic: string, ondata: (result: DataView) => void): Promise<void>;
    unsubscribe(device: BleDevice | string, service: string, characteristic: string): Promise<void>;
    scan(options: RequestBleDeviceOptions, callback: (result: ScanResult) => void): Promise<void>;
    stopScanning(): Promise<void>;
    readDescriptor(device: BleDevice, service: string, characteristic: string, descriptor: string, options?: TimeoutOptions): Promise<DataView>;
    writeDescriptor(device: BleDevice, service: string, characteristic: string, descriptor: string, value: string | number | DataView | ArrayBufferLike | number[], options?: TimeoutOptions): Promise<void>;
    readRssi(device: BleDevice): Promise<number>;
    isMobile(): boolean;
    isAndroid(): boolean;
    distance(device: BleDevice, txPower: any, x: number, exp: number, c: number): Promise<number>;
    distanceFromPhone(//https://github.com/kevindigi/android-iot-samples/blob/7fb4b91eb769a3dba06891286f4f2f3249dab2a6/app/src/main/java/com/digicorp/helper/DistanceManager.java#L48
    device: BleDevice, txPower: number, //signal strength at 1 meter, hardware-specific
    model?: 'nexus5' | 'motoX' | 'iphone5'): Promise<number>;
    triangulate: (device: BleDevice, duration?: number, sampleRate?: number) => Promise<unknown>;
}
