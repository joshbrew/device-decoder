import { TimeoutOptions } from '@capacitor-community/bluetooth-le/dist/plugin';
import { BLEDeviceOptions } from '../ble/ble_client';
import { SerialPortOptions } from '../serial/serialstream';
export type BLEDeviceSettings = {
    deviceType: 'BLE';
    deviceName: string;
    sps?: number;
    codec?: (data: any) => {
        [key: string]: any;
    };
    services?: {
        [key: string]: {
            [key: string]: {
                codec?: (data: any) => {
                    [key: string]: any;
                };
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
} & BLEDeviceOptions;
export type SerialDeviceSettings = {
    deviceType: 'USB';
    deviceName: string;
    sps?: number;
    buffering?: {
        searchBytes: Uint8Array;
    };
    codec: (data: any) => {
        [key: string]: any;
    };
} & SerialPortOptions;
export type CustomDeviceSettings = {
    deviceType: 'CUSTOM' | 'CUSTOM_BLE' | 'CUSTOM_USB';
    deviceName: string;
    sps?: any;
    connect: (settings: any) => {
        _id: string;
        [key: string]: any;
    };
    codec: (data: any) => {
        [key: string]: any;
    };
    disconnect: (info: any) => void;
    onconnect?: (info: any) => void;
    beforedisconnect?: (info: any) => void;
    ondisconnect?: (info: any) => void;
    read?: (command: any) => any;
    write?: (command: any) => any;
};
