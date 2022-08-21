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
ondecoded: ((data: any) => void) | {
    [key: string]: (data: any) => void;
}, //a single ondata function or an object with keys corresponding to BLE characteristics
renderSettings?: {
    canvas: HTMLCanvasElement;
    context: string;
    _id?: string;
    draw?: string | ((self: any, canvas: any, context: any) => void);
    update?: string | ((self: any, canvas: any, context: any, input: any) => void);
    init?: string | ((self: any, canvas: any, context: any) => void);
    clear?: string | ((self: any, canvas: any, context: any) => void);
    animating?: boolean;
}): Promise<{
    workers: {
        streamworker: WorkerInfo;
        renderworker?: WorkerInfo;
    };
    device: any;
    disconnect: () => void;
}>;
export declare function createStreamPipeline(dedicatedSerialWorker?: boolean, dedicatedRenderWorker?: boolean, renderSettings?: {
    canvas: HTMLCanvasElement;
    context: string;
    _id?: string;
    draw?: string | ((self: any, canvas: any, context: any) => {});
    init?: string | ((self: any, canvas: any, context: any) => {});
    clear?: string | ((self: any, canvas: any, context: any) => {});
    animating?: boolean;
}): any;
