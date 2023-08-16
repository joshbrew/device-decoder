import { WebglLinePlotProps } from 'webgl-plot-utils';
import { FilterSettings } from '../util/BiquadFilters';
import { ads131m08codec } from './ads131m08';
import { freeeeg128codec } from './freeeeg128';
import { freeeeg32codec } from './freeeeg32';
import { freeeeg16codec } from './freeeeg16';
import { hegduinocodec } from './hegduino';
import { max3010xcodec } from './max30102';
import { mpu6050codec } from './mpu6050';
import { cognixionONE_EEG_codec } from './cognixionONE';
import { peanutcodec } from './peanut';
import { nrf5x_usbcodec } from './nrf5x_driver';
import { statechangercodec } from './statechanger';
import { hrcodec } from './genericBLE';
export * from '../util/BiquadFilters';
export * from './ads131m08';
export * from './cyton';
export * from './freeeeg128';
export * from './freeeeg32';
export * from './freeeeg16';
export * from './hegduino';
export * from './max30102';
export * from './mpu6050';
export * from './cognixionONE';
export * from './peanut';
export * from './nrf5x_driver';
export * from './statechanger';
export * from './blueberry';
export * from './blueberry2';
export * from './genericBLE';
export * from './bme280';
export * from './simulator';
export * from './types';
export declare const Devices: {
    BLE: {
        nrf5x: {
            deviceType: string;
            deviceName: string;
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
        nrf5x_singleended: {
            deviceType: string;
            deviceName: string;
            sps: number;
            services: {
                '0000cafe-b0ba-8bad-f00d-deadbeef0000': {
                    '0001cafe-b0ba-8bad-f00d-deadbeef0000': {
                        write: any;
                    };
                    '0002cafe-b0ba-8bad-f00d-deadbeef0000': {
                        notify: boolean;
                        notifyCallback: any;
                        codec: typeof import("./ads131m08").ads131m08codec_singleended;
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
                        codec: typeof import("./ads131m08").ads131m08codec_singleended;
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
            deviceType: string;
            deviceName: string;
            baudRate: number;
            write: string;
            codec: typeof hegduinocodec;
            sps: number;
        };
        cognixionONE: {
            deviceType: string;
            deviceName: string;
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
            deviceType: string;
            deviceName: string;
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
        freeEEG16: {
            deviceType: string;
            deviceName: string;
            services: {
                [x: string]: {
                    '6e400002-b5a3-f393-e0a9-e50e24dcca9e': {
                        write: any;
                    };
                    '6e400003-b5a3-f393-e0a9-e50e24dcca9e': {
                        notify: boolean;
                        notifyCallback: any;
                        codec: typeof import("./freeeeg16").freeeeg16BLEcodec;
                        sps: number;
                    };
                };
            };
        };
    };
    USB: {
        nrf5x: {
            deviceType: string;
            deviceName: string;
            baudRate: number;
            buffering: {
                searchBytes: Uint8Array;
            };
            codec: typeof nrf5x_usbcodec;
            sps: number;
        };
        nrf5x_singleended: {
            deviceType: string;
            deviceName: string;
            baudRate: number;
            buffering: {
                searchBytes: Uint8Array;
            };
            codec: typeof import("./nrf5x_driver").nrf5x_usbcodec_singleended;
            sps: number;
        };
        freeEEG16: {
            deviceType: string;
            deviceName: string;
            baudRate: number;
            bufferSize: number;
            frequency: number;
            codec: typeof freeeeg16codec;
            sps: number;
            buffering: {
                searchBytes: Uint8Array;
            };
        };
        freeEEG32: {
            deviceType: string;
            deviceName: string;
            baudRate: number;
            bufferSize: number;
            frequency: number;
            codec: typeof freeeeg32codec;
            sps: number;
            buffering: {
                searchBytes: Uint8Array;
            };
        };
        freeEEG32_optical: {
            deviceType: string;
            deviceName: string;
            baudRate: number;
            bufferSize: number;
            frequency: number;
            codec: typeof freeeeg32codec;
            sps: number;
            buffering: {
                searchBytes: Uint8Array;
            };
        };
        freeEEG128: {
            deviceType: string;
            deviceName: string;
            baudRate: number;
            bufferSize: number;
            frequency: number;
            codec: typeof freeeeg128codec;
            sps: number;
            buffering: {
                searchBytes: Uint8Array;
            };
        };
        hegduino: {
            deviceType: string;
            deviceName: string;
            baudRate: number;
            write: string;
            codec: typeof hegduinocodec;
            sps: number;
        };
        hegduinoV1: {
            deviceType: string;
            deviceName: string;
            baudRate: number;
            write: string;
            codec: typeof hegduinocodec;
            sps: number;
        };
        cyton: import("./types").SerialDeviceSettings;
        cyton_daisy: import("./types").SerialDeviceSettings;
        peanut: {
            deviceType: string;
            deviceName: string;
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
            deviceType: string;
            deviceName: string;
            baudRate: number;
            codec: typeof statechangercodec;
            sps: number;
        };
        cognixionONE: import("./types").SerialDeviceSettings;
    };
    BLE_CUSTOM: {};
    USB_CUSTOM: {};
    CUSTOM: {
        simulator: {
            sps: number;
            deviceType: string;
            deviceName: string;
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
