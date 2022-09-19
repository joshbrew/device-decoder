import { WebglLinePlotProps } from "webgl-plot-utils";
import { FilterSettings } from "../../util/BiquadFilters";
export declare const ganglionSettings: {
    sps: number;
    connect: (settings?: any) => Promise<unknown>;
    codec: (reading: any) => {
        0: any;
        1: any;
        2: any;
        3: any;
        timestamp: number;
        ax?: undefined;
        ay?: undefined;
        az?: undefined;
    } | {
        ax: any;
        ay: any;
        az: any;
        timestamp: number;
        0?: undefined;
        1?: undefined;
        2?: undefined;
        3?: undefined;
    };
    disconnect: (info: any) => void;
    onconnect: (info: any) => void;
    ondisconnect: (info: any) => void;
    ondata: (parsed: any) => void;
};
export declare const ganglionFilterSettings: {
    [key: string]: FilterSettings;
};
export declare const ganglionChartSettings: Partial<WebglLinePlotProps>;
