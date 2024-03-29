import { WorkerInfo, WorkerService, WorkerRoute } from "../../graphscript/index";
import gsworker from './stream.worker';
import { BLEClient } from './ble/ble_client';
import { Devices } from './devices';
import { filterPresets, chartSettings, decoders } from './devices/index';
import { FilterSettings } from './util/BiquadFilters';
export declare function isMobile(): boolean;
export declare const BLE: BLEClient;
export declare const workers: WorkerService;
export { Devices, gsworker, filterPresets, chartSettings, decoders, FilterSettings };
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
    roots?: {
        [key: string]: WorkerRoute;
    };
    workerUrl?: any;
    service?: WorkerService;
}): Promise<{
    workers: {
        streamworker: WorkerInfo;
    };
    device: any;
    options: any;
    disconnect: () => void;
    read: (command?: any) => any;
    write: (command?: any) => any;
    roots: {
        [key: string]: WorkerRoute;
    };
}>;
export declare function createStreamPipeline(dedicatedSerialWorker?: boolean, dedicatedRenderWorker?: boolean, renderer?: {
    canvas: HTMLCanvasElement;
    context: string;
    _id?: string;
    draw?: string | ((self: any, canvas: any, context: any) => {});
    init?: string | ((self: any, canvas: any, context: any) => {});
    clear?: string | ((self: any, canvas: any, context: any) => {});
    animating?: boolean;
}, workerUrl?: any): any;
