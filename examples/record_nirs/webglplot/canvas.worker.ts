
import { workerCanvasRoutes } from 'graphscript/src/services/worker/WorkerCanvas';//'../../../graphscript/services/worker/WorkerCanvas'//
import {WebglLinePlotUtil} from 'webgl-plot-utils'; //'../../../webgl-plot-utils'//
//minimal web worker for running offscreen canvases, 
//no graphscript required


declare var WorkerGlobalScope;

if(typeof WorkerGlobalScope !== 'undefined') {

    globalThis.plotter = new WebglLinePlotUtil();
    
    const routes = {
        ...workerCanvasRoutes
        //add more compatible routes that don't require graphscript
    };
    
    self.onmessage = (ev) => {
        
        //console.log(ev);
        
        if(ev.data.route) {
            if(Array.isArray(ev.data.args)) {
                routes[ev.data.route](...ev.data.args);
            } else routes[ev.data.route](ev.data.args);
        } //that's it! The functions handle worker communication internally
    
    }

}

export default self as any;