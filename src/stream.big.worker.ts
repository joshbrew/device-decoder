import { 
    WorkerService, 
    workerCanvasRoutes, 
    //GPUService, 
    subprocessRoutes,
    loadAlgorithms
} from 'graphscript'//"../../GraphServiceRouter/index"//'graphscript'//"../../GraphServiceRouter/index"//'graphscript'/////"../../GraphServiceRouter/index";//from 'graphscript'
import { streamWorkerRoutes } from './stream.routes';
import {Devices} from './devices/third_party'

import { 
    csvRoutes,
    BFSRoutes
 } from 'graphscript-services.storage'//"../../GraphServiceRouter/extras/index.services"//'graphscript-services'//"../../GraphServiceRouter/extras/index.services"

import {
    algorithms
} from 'graphscript-services'

import {
    gpualgorithms
} from 'graphscript-services.gpu'
 //'graphscript-services'; //"../../GraphServiceRouter/index.services"


loadAlgorithms(algorithms);
loadAlgorithms(gpualgorithms);

declare var WorkerGlobalScope;

if(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
    globalThis.devices = Devices; //access all devices incl third party (bloated)

    const worker = new WorkerService({
        //props:{} //could set the props instead of globalThis but it really does not matter unless you want to bake in for more complex service modules
        routes:[
            //GPUService as any,
            workerCanvasRoutes,
            //unsafeRoutes, //allows dynamic route loading
            subprocessRoutes, //includes unsafeRoutes
            BFSRoutes,
            csvRoutes,
            streamWorkerRoutes
        ],
        includeClassName:false
    });
}

export default self as any;


///Grraaaaadient.. DESCENT *explodes*