import { WebglLinePlotProps } from "webgl-plot-utils";
import { FilterSettings } from "../../util/BiquadFilters";
export declare const museSettings: {
    sps: number;
    deviceType: string;
    deviceName: string;
    connect: (settings?: any) => Promise<unknown>;
    codec: (reading: any) => any;
    disconnect: (info: any) => void;
    onconnect: (info: any) => void;
    beforedisconnect: (info: any) => void;
    ondisconnect: (info: any) => void;
    ondata: (data: any) => void;
};
export declare const museFilterSettings: {
    [key: string]: FilterSettings;
};
export declare const museChartSettings: Partial<WebglLinePlotProps>;
