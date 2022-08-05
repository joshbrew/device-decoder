import { WorkerService, unsafeRoutes, proxyWorkerRoutes, workerCanvasRoutes, GPUService } from 'graphscript'/////"../../GraphServiceRouter/index";//from 'graphscript'
import { WebSerial } from './serial/serialstream'; //extended classes need to be imported for compilation
import { decoders } from './devices/index';
import { WebglLinePlotUtil } from 'webgl-plot-utils';
import { bitflippin } from "./bitflippin";

declare var WorkerGlobalScope;

if(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
    (self as any).SERVICE = new WorkerService({
        routes:[
            GPUService as any,
            proxyWorkerRoutes,
            workerCanvasRoutes,
            unsafeRoutes //allows dynamic route loading
        ],
        includeClassName:false
    });

    globalThis.WebSerial = WebSerial;
    globalThis.decoders = decoders;
    globalThis.decoder = 'raw';
    globalThis.bitflippin = bitflippin;
    globalThis.WebglLinePlotUtil = WebglLinePlotUtil;

    self.onmessage = (ev:MessageEvent) => {
        let result = ((self as any).SERVICE as WorkerService).receive(ev.data); //this will handle graph logic and can run requests for the window or messsage ports etc etc.
        //console.log(JSON.stringify(ev.data), JSON.stringify(result),JSON.stringify(Array.from((self as any).SERVICE.nodes.keys())))
        //console.log(result);
    }

    //console.log(self.SERVICE)
    
}

export default self as any;