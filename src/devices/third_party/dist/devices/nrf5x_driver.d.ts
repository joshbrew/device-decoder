import { WebglLinePlotProps } from 'webgl-plot-utils';
import { FilterSettings } from '../util/BiquadFilters';
import { ads131m08codec, ads131m08codec_singleended } from './ads131m08';
import { max3010xcodec } from './max30102';
import { mpu6050codec } from './mpu6050';
export declare function nrf5x_usbcodec(data: any): any;
export declare function nrf5x_usbcodec_singleended(data: any): any;
export declare const nrf5xSerialSettings: {
    deviceType: string;
    deviceName: string;
    baudRate: number;
    buffering: {
        searchBytes: Uint8Array;
    };
    codec: typeof nrf5x_usbcodec;
    sps: number;
};
export declare const nrf5xSerialSettings_singleended: {
    deviceType: string;
    deviceName: string;
    baudRate: number;
    buffering: {
        searchBytes: Uint8Array;
    };
    codec: typeof nrf5x_usbcodec_singleended;
    sps: number;
};
export declare const nrf5xBLESettings: {
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
export declare const nrf5xBLESettings_singleended: {
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
                codec: typeof ads131m08codec_singleended;
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
                codec: typeof ads131m08codec_singleended;
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
export declare const nrf5x_usbChartSettings: Partial<WebglLinePlotProps>;
export declare const nrf5x_usbFilterSettings: {
    [key: string]: FilterSettings;
};
