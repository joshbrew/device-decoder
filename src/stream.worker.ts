import { 
    WorkerService, 
    workerCanvasRoutes, 
    //GPUService, 
    subprocessRoutes,
//    loadAlgorithms
} from 'graphscript'//"../../GraphServiceRouter/index"//'graphscript'//"../../GraphServiceRouter/index"//'graphscript'/////"../../GraphServiceRouter/index";//from 'graphscript'
import { streamWorkerRoutes } from './stream.routes';

// import { 
//     algorithms,
//     //csvRoutes,
//     //BFSRoutes
//  } from 'graphscript-services'//"../../GraphServiceRouter/extras/index.services"//'graphscript-services'//"../../GraphServiceRouter/extras/index.services"
//  //; //"../../GraphServiceRouter/index.services"

// loadAlgorithms(algorithms);

declare var WorkerGlobalScope;

if(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {

    const worker = new WorkerService({
        //props:{} //could set the props instead of globalThis but it really does not matter unless you want to bake in for more complex service modules
        routes:[
            //GPUService as any,
            workerCanvasRoutes,
            //unsafeRoutes, //allows dynamic route loading
            subprocessRoutes, //includes unsafeRoutes
            // BFSRoutes,
            // csvRoutes,
            streamWorkerRoutes
        ],
        includeClassName:false
    });
}

export default self as any;

