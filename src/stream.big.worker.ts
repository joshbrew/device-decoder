import { 
    WorkerService, 
    workerCanvasRoutes, 
    //GPUService, 
    subprocessRoutes,
    loadAlgorithms
} from "../../graphscript/index"//'graphscript'//"../../GraphServiceRouter/index"//'graphscript'//"../../GraphServiceRouter/index"//'graphscript'/////"../../GraphServiceRouter/index";//from 'graphscript'

import { streamWorkerRoutes } from './stream.routes';
import { webglPlotRoutes } from "../../graphscript/extras/index.services"//'graphscript-services';

import {Devices} from './devices/third_party'

import { 
    csvRoutes,
    BFSRoutes
 } from "../../graphscript/extras/index.storage.services"//"../../GraphServiceRouter/extras/index.storage.services"//'graphscript-services.storage'//"../../GraphServiceRouter/extras/index.storage.services"//'graphscript-services'//"../../GraphServiceRouter/extras/index.services"

import {
    algorithms
} from "../../graphscript/extras/index.services"//'graphscript-services'

import {
    gpualgorithms
} from "../../graphscript/extras/index.gpu.services"//'graphscript-services.gpu'
 //'graphscript-services'; //



declare var WorkerGlobalScope;

if(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
    loadAlgorithms(algorithms);
    loadAlgorithms(gpualgorithms);
    
    globalThis.Devices = Devices; //access all devices incl third party (bloated)

    const worker = new WorkerService({
        //props:{} //could set the props instead of globalThis but it really does not matter unless you want to bake in for more complex service modules
        services:{
            //GPUService as any,
            workerCanvasRoutes,
            //unsafeRoutes, //allows dynamic route loading
            subprocessRoutes, //includes unsafeRoutes
            BFSRoutes,
            csvRoutes,
            streamWorkerRoutes,
            webglPlotRoutes
        }
    });

    console.log('worker', worker)
    
}

export default self as any;
