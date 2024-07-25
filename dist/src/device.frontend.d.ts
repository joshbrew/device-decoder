import { WorkerInfo, WorkerService, WorkerRoute } from 'graphscript-workers';
import gsworker from './stream.worker';
import { BLEClient, BLEDeviceInfo } from './ble/ble_client';
import { Devices } from './devices';
import { TimeoutOptions } from '@capacitor-community/bluetooth-le/dist/plugin';
import { filterPresets, chartSettings, decoders } from './devices/index';
import { FilterSettings } from './util/BiquadFilters';
import { streamWorkerRoutes } from './stream.routes';
export * from './devices/index';
export * from './stream.routes';
export declare function isMobile(): boolean;
export declare const BLE: BLEClient;
export declare const workers: WorkerService;
export { streamWorkerRoutes };
export { Devices, gsworker, filterPresets, chartSettings, decoders, FilterSettings };
export type InitDeviceOptions = {
    devices?: {
        [key: string]: {
            [key: string]: any;
        };
    };
    ondecoded: ((data: any) => void) | {
        [key: string]: (data: any) => void;
    };
    onconnect?: ((device: any) => void);
    beforedisconnect?: ((device: any) => void);
    ondisconnect?: ((device: any) => void);
    ondata?: ((data: DataView) => void);
    filterSettings?: {
        [key: string]: FilterSettings;
    };
    reconnect?: boolean;
    roots?: {
        [key: string]: WorkerRoute;
    };
    workerUrl?: any;
    service?: WorkerService;
};
export type CustomDeviceStream = {
    workers: {
        streamworker: WorkerInfo;
    };
    device: any;
    options: InitDeviceOptions;
    disconnect: () => void;
    read: (command?: any) => any;
    write: (command?: any) => any;
    setFilters: (filterSettings: {
        [key: string]: FilterSettings;
    }, clearFilters?: boolean) => Promise<true>;
    roots: {
        [key: string]: WorkerRoute;
    };
};
export type SerialDeviceStream = {
    workers: {
        serialworker: WorkerInfo;
        streamworker: WorkerInfo;
    };
    options: InitDeviceOptions;
    device: {
        _id: string;
        settings: any;
        info: Partial<SerialPortInfo>;
    };
    subscribeStream: (ondata: (data: any) => void) => Promise<any>;
    unsubscribeStream: (sub: number | undefined) => Promise<any>;
    setFilters: (filterSettings: {
        [key: string]: FilterSettings;
    }, clearFilters?: boolean) => Promise<true>;
    disconnect: () => void;
    read: () => Promise<any>;
    write: (command: string | number | DataView | ArrayBufferLike | number[], chunkSize?: number) => Promise<boolean>;
    roots: {
        [key: string]: WorkerRoute;
    };
};
export type BLEDeviceStream = {
    workers: {
        streamworker: WorkerInfo;
    };
    options: InitDeviceOptions;
    device: BLEDeviceInfo;
    subscribe: (service: any, notifyCharacteristic: any, ondata?: any, bypassWorker?: any) => Promise<void>;
    unsubscribe: (service: any, notifyCharacteristic: any) => Promise<void>;
    setFilters: (filterSettings: {
        [key: string]: FilterSettings;
    }, clearFilters?: boolean) => Promise<true>;
    disconnect: () => void;
    read: (command: {
        service: string;
        characteristic: string;
        ondata?: (data: DataView) => void;
        timeout?: TimeoutOptions;
    }) => Promise<DataView>;
    write: (command: {
        service: string;
        characteristic: string;
        data?: string | number | ArrayBufferLike | DataView | number[];
        callback?: () => void;
        chunkSize?: number;
        timeout?: TimeoutOptions;
    }) => Promise<void>;
    roots: {
        [key: string]: WorkerRoute;
    };
};
export declare function initDevice(settings: any, options: {
    devices?: {
        [key: string]: {
            [key: string]: any;
        };
    };
    ondecoded: ((data: any) => void) | {
        [key: string]: (data: any) => void;
    };
    onconnect?: ((device: any) => void);
    beforedisconnect?: ((device: any) => void);
    ondisconnect?: ((device: any) => void);
    ondata?: ((data: DataView) => void);
    filterSettings?: {
        [key: string]: FilterSettings;
    };
    reconnect?: boolean;
    roots?: {
        [key: string]: WorkerRoute;
    };
    workerUrl?: any;
    service?: WorkerService;
}): Promise<BLEDeviceStream | SerialDeviceStream | CustomDeviceStream>;
export declare function createStreamPipeline(dedicatedSerialWorker?: boolean, dedicatedRenderWorker?: boolean, renderer?: {
    canvas: HTMLCanvasElement;
    context: string;
    _id?: string;
    draw?: string | ((self: any, canvas: any, context: any) => {});
    init?: string | ((self: any, canvas: any, context: any) => {});
    clear?: string | ((self: any, canvas: any, context: any) => {});
    animating?: boolean;
}, workerUrl?: any): any;
