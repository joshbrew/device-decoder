import { WebglLinePlotProps } from "webgl-plot-utils";
import { webgazer } from "./dependencies/webgazer.esm";
export { webgazer };
export declare const webgazerSettings: {
    sps: number;
    deviceType: string;
    deviceName: string;
    debug: boolean;
    regression: string;
    regressionModule: any;
    tracker: any;
    trackerModule: any;
    connect: (settings?: any) => Promise<unknown>;
    codec: (reading: {
        eyeFeatures: any;
        x: number;
        y: number;
    }) => {
        eyeFeatures: any;
        x: number;
        y: number;
    };
    disconnect: (info: any) => void;
    onconnect: (info: any) => void;
    beforedisconnect: (info: any) => void;
    ondisconnect: (info: any) => void;
    ondata: (data: any) => void;
    read: (info: any, command?: any) => any;
    distance: (x1: any, y1: any, x2: any, y2: any) => number;
};
export declare const webgazerChartSettings: Partial<WebglLinePlotProps>;
