export * from './muse';
export * from './ganglion';
export declare const Devices3rdParty: {
    CUSTOM_BLE: {
        muse: {
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
        ganglion: {
            sps: number;
            deviceType: string;
            deviceName: string;
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
            beforedisconnect: (info: any) => void;
            ondisconnect: (info: any) => void;
            ondata: (data: any) => void;
        };
    };
    CUSTOM: {
        webgazer: {
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
    };
};
declare const Devices: {};
export { Devices };
