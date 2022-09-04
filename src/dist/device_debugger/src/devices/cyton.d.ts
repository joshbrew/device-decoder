import { WebglLinePlotProps } from "webgl-plot-utils";
import { FilterSettings } from "../util/BiquadFilters";
export declare function cytoncodec(data: any): any;
export declare function daisycytoncodec(data: any): any;
export declare const cytonSerialSettings: {
    baudRate: number;
    codec: typeof cytoncodec;
    sps: number;
};
export declare const daisycytonSerialSettings: {
    baudRate: number;
    codec: typeof daisycytoncodec;
    sps: number;
};
export declare const cytonChartSettings: Partial<WebglLinePlotProps>;
export declare const cytonFilterSettings: {
    [key: string]: FilterSettings;
};
