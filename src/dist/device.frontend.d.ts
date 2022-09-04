import { WorkerInfo, WorkerService } from 'graphscript';
import gsworker from './stream.worker';
import { BLEClient } from './ble/ble_client';
import { Devices } from './devices';
export declare function isMobile(): boolean;
export declare const BLE: BLEClient;
export declare const workers: WorkerService;
export { Devices, gsworker };
export declare function initDevice(deviceType: 'BLE' | 'USB' | 'OTHER' | 'BLE_OTHER' | 'USB_OTHER', //other includes prewritten drivers that don't fit our format very well, e.g. cloud streaming drivers or the musejs driver as they are self contained
deviceName: string, //one of the supported settings in Devices
options: {
    ondecoded: ((data: any) => void) | {
        [key: string]: (data: any) => void;
    };
    onconnect?: ((device: any) => void);
    ondisconnect?: ((device: any) => void);
    subprocesses?: {
        [key: string]: {
            route: string;
            otherArgs?: any[];
            init?: string;
            initArgs?: any[];
            url?: any;
            callback?: string | ((data: any) => any);
            pipeTo?: {
                portId: string;
                route: string;
                otherArgs: any[];
            };
            worker?: WorkerInfo;
            subscribeRoute?: string;
            source?: WorkerInfo;
        };
    };
    renderer?: {
        canvas: HTMLCanvasElement;
        context: string;
        _id?: string;
        width?: number;
        height?: number;
        draw?: string | ((self: any, canvas: any, context: any) => void);
        update?: string | ((self: any, canvas: any, context: any, input: any) => void);
        init?: string | ((self: any, canvas: any, context: any) => void);
        clear?: string | ((self: any, canvas: any, context: any) => void);
        animating?: boolean;
        renderworker?: WorkerInfo;
    };
}): Promise<{
    workers: {
        streamworker: WorkerInfo;
        renderworker?: WorkerInfo;
    };
    device: any;
    disconnect: () => void;
    read: (command?: any) => any;
    write: (command?: any) => any;
}>;
export declare function createStreamPipeline(dedicatedSerialWorker?: boolean, dedicatedRenderWorker?: boolean, renderer?: {
    canvas: HTMLCanvasElement;
    context: string;
    _id?: string;
    draw?: string | ((self: any, canvas: any, context: any) => {});
    init?: string | ((self: any, canvas: any, context: any) => {});
    clear?: string | ((self: any, canvas: any, context: any) => {});
    animating?: boolean;
}): any;
