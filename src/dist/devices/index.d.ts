import { WebglLinePlotProps } from 'webgl-plot-utils';
import { FilterSettings } from '../util/BiquadFilters';
import { ads131m08codec } from './ads131m08';
import { cytoncodec } from './cyton';
import { freeeeg128codec } from './freeeeg128';
import { freeeeg32codec } from './freeeeg32';
import { hegduinocodec } from './hegduino';
import { max3010xcodec } from './max30102';
import { mpu6050codec } from './mpu6050';
import { cognixionONE_EEG_codec } from './cognixionONE';
import { peanutcodec } from './peanut';
import { nrf5x_usbcodec } from './nrf5x_usb';
import { statechangercodec } from './statechanger';
export declare const Devices: {
    BLE: {
        nrf5x: {
            services: {
                '0000cafe-b0ba-8bad-f00d-deadbeef0000': {
                    '0001cafe-b0ba-8bad-f00d-deadbeef0000': {
                        write: any;
                    };
                    '0002cafe-b0ba-8bad-f00d-deadbeef0000': {
                        notify: boolean;
                        notifyCallback: any;
                        codec: typeof ads131m08codec;
                    };
                    '0003cafe-b0ba-8bad-f00d-deadbeef0000': {
                        notify: boolean;
                        notifyCallback: any;
                        codec: typeof max3010xcodec;
                    };
                    '0004cafe-b0ba-8bad-f00d-deadbeef0000': {
                        notify: boolean;
                        notifyCallback: any;
                        codec: typeof mpu6050codec;
                    };
                    '0006cafe-b0ba-8bad-f00d-deadbeef0000': {
                        notify: boolean;
                        notifyCallback: any;
                        codec: typeof ads131m08codec;
                    };
                };
            };
        };
        hegduino: import("../ble/ble_client").BLEDeviceOptions;
        cognixionONE: {
            services: {
                [x: string]: {
                    [x: string]: {
                        notify: boolean;
                        notifyCallback: any;
                        codec: typeof cognixionONE_EEG_codec;
                    };
                } | {
                    [x: string]: {
                        write: any;
                        read?: undefined;
                    } | {
                        read: boolean;
                        write?: undefined;
                    };
                };
            };
        };
        statechanger: import("../ble/ble_client").BLEDeviceOptions;
        blueberry: import("../ble/ble_client").BLEDeviceOptions;
        blueberry2: import("../ble/ble_client").BLEDeviceOptions;
    };
    USB: {
        nrf5x: {
            baudRate: number;
            buffering: {
                searchBytes: Uint8Array;
            };
            codec: typeof nrf5x_usbcodec;
        };
        freeEEG32: {
            baudRate: number;
            bufferSize: number;
            frequency: number;
            codec: typeof freeeeg32codec;
        };
        freeEEG32_optical: {
            baudRate: number;
            bufferSize: number;
            frequency: number;
            codec: typeof freeeeg32codec;
        };
        freeEEG128: {
            baudRate: number;
            bufferSize: number;
            frequency: number;
            codec: typeof freeeeg128codec;
        };
        hegduino: {
            baudRate: number;
            write: string;
            codec: typeof hegduinocodec;
        };
        cyton: {
            baudRate: number;
            codec: typeof cytoncodec;
        };
        cyton_daisy: {
            baudRate: number;
            codec: typeof cytoncodec;
        };
        peanut: {
            baudRate: number;
            bufferSize: number;
            write: string;
            buffering: {
                searchBytes: Uint8Array;
            };
            codec: typeof peanutcodec;
        };
        statechanger: {
            baudRate: number;
            codec: typeof statechangercodec;
        };
        cognixionONE: {
            baudRate: number;
            codec: typeof cytoncodec;
        };
    };
    BLE_OTHER: {
        muse: {
            connect: (settings?: any) => Promise<unknown>;
            codec: (reading: any) => any;
            disconnect: (info: any) => void;
            onconnect: (info: any) => void;
            ondisconnect: (info: any) => void;
            ondata: (parsed: any) => void;
        };
        ganglion: {
            connect: (settings?: any) => Promise<unknown>;
            codec: (reading: any) => {
                0: any;
                1: any;
                2: any;
                3: any;
                ax?: undefined;
                ay?: undefined;
                az?: undefined;
            } | {
                ax: any;
                ay: any;
                az: any;
                0?: undefined;
                1?: undefined;
                2?: undefined;
                3?: undefined;
            };
            disconnect: (info: any) => void;
            onconnect: (info: any) => void;
            ondisconnect: (info: any) => void;
            ondata: (parsed: any) => void;
        };
    };
    USB_OTHER: {};
    OTHER: {};
};
export declare const defaultChartSettings: any;
export declare const filterPresets: {
    [key: string]: {
        [key: string]: FilterSettings;
    };
};
export declare const chartSettings: {
    [key: string]: Partial<WebglLinePlotProps>;
};
export declare const decoders: any;
