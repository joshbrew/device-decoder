import { WebglLinePlotProps } from "webgl-plot-utils";
import { FilterSettings } from "../util/BiquadFilters";
export declare function freeeeg16codec(data: any): any;
export declare function freeeeg16BLEcodec(data: any): any;
export declare const freeeeg16BLESettings: {
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
                codec: typeof freeeeg16BLEcodec;
                sps: number;
            };
        };
    };
};
export declare const freeeeg16SerialSettings: {
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
export declare const freeeeg16ChartSettings: Partial<WebglLinePlotProps>;
export declare const freeeeg16FilterSettings: {
    [key: string]: FilterSettings;
};
