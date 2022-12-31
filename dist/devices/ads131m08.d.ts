/**
 *
 * ads131m08 BLE packet output for our board:
 * [0,1,2],[3,4,5],[6,7,8],[9,10,11],[12,13,14],[15,16,17],[19,19,20],[21,22,23], [24],  [25,26,27],... * 9 samples per packet, then \r\n
 *                                                             first 8 channels,  ctr,   next channel set
 *
 */
import { WebglLinePlotProps } from "webgl-plot-utils";
import { FilterSettings } from "../util/BiquadFilters";
export declare function ads131m08codec(data: any): {
    0: any[];
    1: any[];
    2: any[];
    3: any[];
    4: any[];
    5: any[];
    6: any[];
    7: any[];
    timestamp: number;
};
export declare function ads131m08_arduinocodec(data: any): {
    '0': number;
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
    '6': number;
    '7': number;
    timestamp: number;
};
export declare const ads131m08ChartSettings: Partial<WebglLinePlotProps>;
export declare const ads131m08FilterSettings: {
    [key: string]: FilterSettings;
};
