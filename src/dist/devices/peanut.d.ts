import { WebglLinePlotProps } from 'webgl-plot-utils';
export declare const PeanutCodes: {
    2: {
        type: string;
        format: string;
        byteLength: number;
    };
    144: {
        type: string;
        format: string;
        byteLength: number;
    };
    145: {
        type: string;
        format: string;
        byteLength: number;
    };
    147: {
        type: string;
        format: string;
        byteLength: number;
    };
    148: {
        type: string;
        format: string;
        byteLength: number;
    };
    160: {
        type: string;
        format: string;
        byteLength: number;
    };
    176: {
        type: string;
        format: string;
        byteLength: number;
    };
    177: {
        type: string;
        format: string;
        byteLength: number;
    };
    178: {
        type: string;
        format: string;
        byteLength: number;
    };
    179: {
        type: string;
        format: string;
        byteLength: number;
    };
    180: {
        type: string;
        format: string;
        byteLength: number;
    };
    181: {
        type: string;
        format: string;
        byteLength: number;
    };
    182: {
        type: string;
        format: string;
        byteLength: number;
    };
};
export declare function peanutcodec(data: any): any;
export declare const peanutSerialSettings: {
    baudRate: number;
    bufferSize: number;
    write: string;
    buffering: {
        searchBytes: Uint8Array;
    };
    codec: typeof peanutcodec;
    sps: number;
};
export declare const peanutChartSettings: Partial<WebglLinePlotProps>;
