export * from './muse';
export * from './ganglion';
export declare const Devices3rdParty: {
    BLE_OTHER: {
        muse: {
            sps: number;
            connect: (settings?: any) => Promise<unknown>;
            codec: (reading: any) => any;
            disconnect: (info: any) => void;
            onconnect: (info: any) => void;
            ondisconnect: (info: any) => void;
            ondata: (data: any) => void;
        };
        ganglion: {
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
            ondata: (data: any) => void;
        };
    };
};
declare const Devices: {};
export { Devices };
