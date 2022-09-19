import { WebglLinePlotProps } from "webgl-plot-utils";
import { FilterSettings } from "../util/BiquadFilters";
export declare function freeeeg32codec(data: any): any;
export declare const freeeeg32SerialSettings: {
    baudRate: number;
    bufferSize: number;
    frequency: number;
    codec: typeof freeeeg32codec;
    sps: number;
};
export declare const freeeeg32_optical_SerialSettings: {
    baudRate: number;
    bufferSize: number;
    frequency: number;
    codec: typeof freeeeg32codec;
    sps: number;
};
export declare const freeeeg32ChartSettings: Partial<WebglLinePlotProps>;
export declare const freeeeg32FilterSettings: {
    [key: string]: FilterSettings;
};
