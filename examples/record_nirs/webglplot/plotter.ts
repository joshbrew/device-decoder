import {WebglLinePlotUtil, WebglLinePlotProps} from 'graphscript-services';//'../../../webgl-plot-utils/webgl-plot-utils'//

import canvasworker from './canvas.worker'

import { 
    CanvasControls, 
    CanvasProps, 
    workerCanvasRoutes 
} from 'graphscript/src/services/worker/WorkerCanvas' //'../../../../graphscript/src/services/worker/WorkerCanvas'//

type WGPlotterOptions = CanvasProps & {
    overlay?:HTMLCanvasElement, 
    worker?:boolean|Worker|string|Blob|MessagePort, 
    route?:string
} & WebglLinePlotProps

export class WGLPlotter {

    plotter = new WebglLinePlotUtil();
    plot:CanvasControls
    options: WGPlotterOptions

    constructor(options?:WGPlotterOptions) {
        if(options) {
            this.options = options;
            this.create(options);
        }
    }

    create = (options=this.options) => {

        // provide the functions for the canvas routes, in our case wrapping the webglplot renderer instead of our own canvas render
        const init = (options, canvas, context) => {

            this.plotter.initPlot(options);

            //console.log(this); // should be worker scope on the thread
            
            let onresize = (o) => {    
                if(canvas.clientHeight) {
                    canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight;
                    options.overlay.width = canvas.clientWidth; options.overlay.height = canvas.clientHeight;
                    ((this.plotter.plots[options._id].plot as any).webgl as WebGLRenderingContext).viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
                    (this.plotter.plots[options._id].plot as any).update();
                }
            }

            if(typeof window !== 'undefined') window.addEventListener('resize',onresize);
            else canvas.addEventListener('resize',onresize);

            setTimeout(()=>{onresize(canvas)},10);

        }

        const update = (options, canvas, context, input) => {
            //console.log('update plotter')
            this.plotter.update(options._id, input);
        }

        const clear = (options, canvas, context) => {
            this.plotter.deinitPlot(options._id);   
        }

        options.init = init;
        options.update = update;
        options.clear = clear;
    
        if(options.worker) {
    
            if(options.worker === true) options.worker = new Worker(canvasworker);
            else if (typeof options.worker === 'string' || options.worker instanceof Blob) options.worker = new Worker(options.worker as any);
            
            if(options.overlay) {
                let offscreen = (options.overlay as any).transferControlToOffscreen();
                options.overlay = offscreen;
                options.transfer = [options.overlay];
            }
        }
    
        this.plot = workerCanvasRoutes.Renderer(options as CanvasProps) as CanvasControls;
        return this.plot;
    }

    __operator = (data:{[key:string]:any}) => {
        if (!this.plot) this.create(this.options); // NOTE: Using global scope will result in issues since the (wrapper) promise is not awaited
        this.plot.update(data);
    }

}


