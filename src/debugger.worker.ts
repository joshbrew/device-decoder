import { WorkerService, unsafeRoutes, proxyWorkerRoutes, workerCanvasRoutes, GPUService } from 'graphscript'/////"../../GraphServiceRouter/index";//from 'graphscript'
import { WebSerial } from './serial/serialstream'; //extended classes need to be imported for compilation
import { decoders } from './devices/index';
import { WebglLinePlotUtil } from '../../BrainsAtPlay_Libraries/webgl-plot-utils/webgl-plot-utils'//'webgl-plot-utils';
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
    globalThis.charting = true;
    globalThis.filtering = true;
    globalThis.filters = {};
    //console.log(self.SERVICE)
    
}

export default self as any;