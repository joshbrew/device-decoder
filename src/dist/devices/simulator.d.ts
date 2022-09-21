export declare const simulatorSettings: {
    sps: number;
    simulate: {
        '0': {
            sps: number;
            freq: number;
            amplitude: number;
            offset: number;
        };
        '1': {
            sps: number;
            freq: number;
            amplitude: number;
            offset: number;
        };
        '2': {
            sps: number;
            freq: number;
            amplitude: number;
            offset: number;
        };
        '3': {
            sps: number;
            freq: number;
            amplitude: number;
            offset: number;
        };
    };
    connect: (settings?: any) => Promise<unknown>;
    codec: (reading: any) => any;
    disconnect: (info: any) => void;
    onconnect: (info: any) => void;
    ondisconnect: (info: any) => void;
    ondata: (data: any) => void;
};
