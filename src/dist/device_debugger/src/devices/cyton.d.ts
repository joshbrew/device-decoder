import { WebglLinePlotProps } from "webgl-plot-utils";
import { SerialPortOptions } from "../serial/serialstream";
import { FilterSettings } from "../util/BiquadFilters";
export declare function cytoncodec(data: any): any;
export declare function daisycytoncodec(data: any): any;
export declare const cytonSerialSettings: SerialPortOptions;
export declare const daisycytonSerialSettings: SerialPortOptions;
export declare const cytonChartSettings: Partial<WebglLinePlotProps>;
export declare const cytonFilterSettings: {
    [key: string]: FilterSettings;
};
