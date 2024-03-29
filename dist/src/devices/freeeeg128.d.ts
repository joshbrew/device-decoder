import { WebglLinePlotProps } from "webgl-plot-utils";
import { FilterSettings } from "../util/BiquadFilters";
export declare function freeeeg128codec(data: any): any;
export declare const freeeeg128SerialSettings: {
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
export declare const freeeeg128ChartSettings: Partial<WebglLinePlotProps>;
export declare const freeeeg128FilterSettings: {
    [key: string]: FilterSettings;
};
