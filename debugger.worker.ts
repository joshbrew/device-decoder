import { 
    WorkerService, 
    unsafeRoutes, 
    workerCanvasRoutes,
     //GPUService 
    } from 'graphscript'/////"../../GraphServiceRouter/index";//from 'graphscript'
import { WebSerial } from './src/serial/serialstream'; //extended classes need to be imported for compilation
import { decoders } from './src/devices/index';
import { WebglLinePlotUtil } from 'webgl-plot-utils'//'../../BrainsAtPlay_Libraries/webgl-plot-utils/webgl-plot-utils'//
import { bitflippin } from "./src/util/bitflippin";
import { BiquadChannelFilterer } from './src/util/BiquadFilters';
//import * as bfs from './storage/BFSUtils'

declare var WorkerGlobalScope;

if(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
    (self as any).SERVICE = new WorkerService({
        routes:[
            //GPUService as any,
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
    globalThis.runningAnim = true;
    globalThis.filtering = true;
    globalThis.filters = {};
    globalThis.BiquadChannelFilterer = BiquadChannelFilterer;
    //console.log(self.SERVICE)
}

export default self as any;