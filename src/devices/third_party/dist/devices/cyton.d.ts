import { WebglLinePlotProps } from "webgl-plot-utils";
import { FilterSettings } from "../util/BiquadFilters";
import { SerialDeviceSettings } from "./types";
export declare function cytoncodec(data: any): any;
export declare function daisycytoncodec(data: any): any;
export declare const cytonSerialSettings: SerialDeviceSettings;
export declare const daisycytonSerialSettings: SerialDeviceSettings;
export declare const cytonChartSettings: Partial<WebglLinePlotProps>;
export declare const cytonFilterSettings: {
    [key: string]: FilterSettings;
};
