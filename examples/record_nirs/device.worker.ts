import { 
    WorkerService, 
    remoteGraphRoutes, 
    workerCanvasRoutes, 
    nodeTemplates
    //GPUService, 
} from 'graphscript'//'../../../graphscript/index'//

import { webglPlotRoutes } from 'graphscript-services'; //"../../graphscript/extras/index.services"//

import { streamWorkerRoutes } from 'device-decoder/src/stream.routes';
import {Devices} from 'device-decoder'//'../device_debugger/src/device.frontend'

import { 
    csvRoutes,
    BFSRoutes
 } from 'graphscript-services.storage'//'../../graphscript/src/extras/index.storage.services'//'graphscript-services.storage'//"../../GraphServiceRouter/extras/index.storage.services"//'graphscript-services'//"../../GraphServiceRouter/extras/index.services"

import {
    algorithms
} from 'graphscript-services'

Object.assign(nodeTemplates, algorithms);

// import {
//     gpualgorithms
// } from 'graphscript-services.gpu'
 //'graphscript-services'; //

//Object.assign(nodeTemplates, gpualgorithms);


declare var WorkerGlobalScope;

if(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
    
    globalThis.Devices = Devices; //access all devices incl third party (bloated)

    const worker = new WorkerService({
        //props:{} //could set the props instead of globalThis but it really does not matter unless you want to bake in for more complex service modules
        roots:{
            //GPUService as any,
            ...workerCanvasRoutes,
            //unsafeRoutes, //allows dynamic route loading
            ...remoteGraphRoutes,
            ...BFSRoutes,
            ...csvRoutes,
            ...streamWorkerRoutes,
            ...webglPlotRoutes
        }
    });

    console.log('worker', worker)
    
}

export default self as any;
