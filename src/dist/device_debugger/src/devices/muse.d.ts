import { WebglLinePlotProps } from "webgl-plot-utils";
import { FilterSettings } from "../util/BiquadFilters";
export declare const museSettings: {
    connect: (settings?: any) => Promise<unknown>;
    codec: (reading: any) => any;
    disconnect: (info: any) => void;
    onconnect: (info: any) => void;
    ondisconnect: (info: any) => void;
    ondata: (parsed: any) => void;
};
export declare const museFilterSettings: {
    [key: string]: FilterSettings;
};
export declare const museChartSettings: Partial<WebglLinePlotProps>;