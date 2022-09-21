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
import { hrcodec } from './genericBLE';
export declare const Devices: {
    BLE: {
        nrf5x: {
            sps: number;
            services: {
                '0000cafe-b0ba-8bad-f00d-deadbeef0000': {
                    '0001cafe-b0ba-8bad-f00d-deadbeef0000': {
                        write: any;
                    };
                    '0002cafe-b0ba-8bad-f00d-deadbeef0000': {
                        notify: boolean;
                        notifyCallback: any;
                        codec: typeof ads131m08codec;
                        sps: number;
                    };
                    '0003cafe-b0ba-8bad-f00d-deadbeef0000': {
                        notify: boolean;
                        notifyCallback: any;
                        codec: typeof max3010xcodec;
                        sps: number;
                    };
                    '0004cafe-b0ba-8bad-f00d-deadbeef0000': {
                        notify: boolean;
                        notifyCallback: any;
                        codec: typeof mpu6050codec;
                        sps: number;
                    };
                    '0005cafe-b0ba-8bad-f00d-deadbeef0000': {
                        notify: boolean;
                        notifyCallback: any;
                        codec: typeof ads131m08codec;
                        sps: number;
                    };
                    '0006cafe-b0ba-8bad-f00d-deadbeef0000': {
                        notify: boolean;
                        notifyCallback: any;
                        codec: (data: any) => any;
                        sps: number;
                    };
                };
            };
        };
        hegduino: import("../ble/ble_client").BLEDeviceOptions;
        hegduinoV1: {
            baudRate: number;
            write: string;
            codec: typeof hegduinocodec;
            sps: number;
        };
        cognixionONE: {
            services: {
                [x: string]: {
                    [x: string]: {
                        notify: boolean;
                        notifyCallback: any;
                        codec: typeof cognixionONE_EEG_codec;
                        sps: number;
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
            sps: number;
        };
        statechanger: import("../ble/ble_client").BLEDeviceOptions;
        blueberry: import("../ble/ble_client").BLEDeviceOptions;
        blueberry2: import("../ble/ble_client").BLEDeviceOptions;
        heart_rate: {
            services: {
                heart_rate: {
                    heart_rate_measurement: {
                        notify: boolean;
                        notifyCallback: any;
                        codec: typeof hrcodec;
                    };
                };
            };
        };
    };
    USB: {
        nrf5x: {
            baudRate: number;
            buffering: {
                searchBytes: Uint8Array;
            };
            codec: typeof nrf5x_usbcodec;
            sps: number;
        };
        freeEEG32: {
            baudRate: number;
            bufferSize: number;
            frequency: number;
            codec: typeof freeeeg32codec;
            sps: number;
        };
        freeEEG32_optical: {
            baudRate: number;
            bufferSize: number;
            frequency: number;
            codec: typeof freeeeg32codec;
            sps: number;
        };
        freeEEG128: {
            baudRate: number;
            bufferSize: number;
            frequency: number;
            codec: typeof freeeeg128codec;
            sps: number;
        };
        hegduino: {
            baudRate: number;
            write: string;
            codec: typeof hegduinocodec;
            sps: number;
        };
        hegduinoV1: {
            baudRate: number;
            write: string;
            codec: typeof hegduinocodec;
            sps: number;
        };
        cyton: {
            baudRate: number;
            codec: typeof cytoncodec;
            sps: number;
        };
        cyton_daisy: {
            baudRate: number;
            codec: typeof cytoncodec;
            sps: number;
        };
        peanut: {
            baudRate: number;
            bufferSize: number;
            write: string;
            buffering: {
                searchBytes: Uint8Array;
            };
            codec: typeof peanutcodec;
            sps: number;
        };
        statechanger: {
            baudRate: number;
            codec: typeof statechangercodec;
        };
        cognixionONE: {
            baudRate: number;
            codec: typeof cytoncodec;
            sps: number;
        };
    };
    BLE_OTHER: {};
    USB_OTHER: {};
    OTHER: {
        simulator: {
            sps: number;
            simulate: {
                '0': {
                    sps: number;
                    freq: number;
                    amplitude: number;
                    offset: number;
                };
                '1': {
                    sps: number;
                    freq: number;
                    amplitude: number;
                    offset: number;
                };
                '2': {
                    sps: number;
                    freq: number;
                    amplitude: number;
                    offset: number;
                };
                '3': {
                    sps: number;
                    freq: number;
                    amplitude: number;
                    offset: number;
                };
            };
            connect: (settings?: any) => Promise<unknown>;
            codec: (reading: any) => any;
            disconnect: (info: any) => void;
            onconnect: (info: any) => void;
            ondisconnect: (info: any) => void;
            ondata: (data: any) => void;
        };
    };
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
