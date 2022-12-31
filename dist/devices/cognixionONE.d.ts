import { WebglLinePlotProps } from 'webgl-plot-utils';
import { FilterSettings } from '../util/BiquadFilters';
export declare function cognixionONE_EEG_codec(data: any): {
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
export declare const cognixionONEBLESettings: {
    services: {
        [x: string]: {
            [x: string]: {
                notify: boolean;
                notifyCallback: any;
                codec: typeof cognixionONE_EEG_codec;
                sps: number;
            };
        } | {
            [x: string]: {
                write: any;
                read?: undefined;
            } | {
                read: boolean;
                write?: undefined;
            };
        };
    };
    sps: number;
};
export declare const cognixionONEChartSettings: Partial<WebglLinePlotProps>;
export declare const cognixionONEFilterSettings: {
    [key: string]: FilterSettings;
};
