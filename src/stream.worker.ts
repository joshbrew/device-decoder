import { 
    WorkerService, 
    remoteGraphRoutes, 
    workerCanvasRoutes, 
    //GPUService, 
//    loadAlgorithms
} from 'graphscript-workers'//"../../GraphServiceRouter/index"//'graphscript'/////"../../GraphServiceRouter/index";//from 'graphscript'
import { 
    streamWorkerRoutes 
} from './stream.routes';

import { Devices } from './devices';

// import { 
//     algorithms,
//     //csvRoutes,
//     //BFSRoutes
//  } from 'graphscript-services'//"../../GraphServiceRouter/extras/index.services"//'graphscript-services'//"../../GraphServiceRouter/extras/index.services"
//  //; //"../../GraphServiceRouter/index.services"

// loadAlgorithms(algorithms);

declare var WorkerGlobalScope;

if(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {

    globalThis.Devices = Devices; //you can customize this list yourself, else the streamWorkerRoutes uses the library defaults 
    // so if you want more default drivers e.g. with complicated imports then make your own worker so you can update this list

    const worker = new WorkerService({
        //props:{} //could set the props instead of globalThis but it really does not matter unless you want to bake in for more complex service modules
        roots:{
            //GPUService as any,
            ...workerCanvasRoutes,
            ...remoteGraphRoutes, //allows dynamic route loading
            // BFSRoutes,
            // csvRoutes,
            ...streamWorkerRoutes
        }
    });
}

export default self as any;

