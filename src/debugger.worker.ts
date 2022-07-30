import { WorkerService, unsafeRoutes, proxyWorkerRoutes, workerCanvasRoutes, GPUService } from "graphscript";
import { WebSerial } from './serial/serialstream'; //extended classes need to be imported for compilation
import { decoders } from './decoders/index';
import {WebglLinePlotUtils} from 'webgl-plot-utils';

declare var WorkerGlobalScope;

if(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
    (self as any).SERVICE = new WorkerService({
        routes:[
            (self as any).SERVICE,
            GPUService,
            proxyWorkerRoutes,
            workerCanvasRoutes,
            unsafeRoutes //allows dynamic route loading
        ],
        includeClassName:false
    });

    globalThis.WebSerial = WebSerial;
    globalThis.decoders = decoders;
    globalThis.WebglLinePlotUtils = WebglLinePlotUtils;

    self.onmessage = (ev:MessageEvent) => {
        let result = ((self as any).SERVICE as WorkerService).runRequest(ev.data.args, ev.data.origin, ev.data.callbackId); //this will handle graph logic and can run requests for the window or messsage ports etc etc.
        //console.log(ev.data, result, (self as any).SERVICE)
        //console.log(result);
    }
    
}

export default self as any;