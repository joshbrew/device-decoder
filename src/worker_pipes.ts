
import {WorkerService, ServiceMessage} from '../../GraphServiceRouter/index' //'graphscript'//
import { WorkerInfo } from 'graphscript';
import {WebSerial} from './serial/serialstream'
import gsworker from './debugger.worker'

export const workers = new WorkerService(); 

import { WebglLinePlotUtil, WebglLinePlotProps, WebglLinePlotInfo, WebglLineProps } from 'webgl-plot-utils'//'../../BrainsAtPlay_Libraries/webgl-plot-utils/webgl-plot-utils'//'webgl-plot-utils';



//transfer decoders
export function transferFunction(worker:WorkerInfo, fn:any, fnName?:string) {
    if(!fnName) fnName = fn.name;
    return worker.request({
        route:'setRoute',
        args:[
            fn.toString(),
            fnName
        ]
    } as ServiceMessage);
}

export function transferClass(worker:WorkerInfo, cls:any, className?:string) {
    if(!className) className = cls.name;
    return worker.request({
        route:'receiveClass',
        args:[
            cls.toString(),
            className
        ] 
    } as ServiceMessage);
}


export const setupChart = (settings:WebglLinePlotProps) => {
    console.log('initializing chart', settings)
    if(!globalThis.plotter) globalThis.plotter = new globalThis.WebglLinePlotUtil();
    return globalThis.plotter.initPlot(settings).settings._id;
}

export const updateChartData = (
    plot:WebglLinePlotInfo|string, 
    lines?:{
        [key:string]:{
            values:number[]|number,
            position?:number,
            autoscale?:boolean,
            interpolate?:boolean
        }
    }|number|(number|number[])[]|string, 
    draw:boolean=true
) => {
    let parsed = globalThis.WebglLinePlotUtil.formatDataForCharts(lines);
    if(typeof parsed === 'object')
    {    
        globalThis.plotter.update(plot,parsed,draw);
        return true;
    } return false;
}

export const clearChart = (
    plot:WebglLinePlotInfo|string
) => {
    globalThis.plotter.deinitPlot(plot);
    return true;
}

export const resetChart = (
    plot:WebglLinePlotInfo|string,
    settings:WebglLinePlotProps
) => {
    globalThis.plotter.reinitPlot(plot,settings);
    return settings._id;
}


export function transferChartCommands(worker:WorkerInfo) {
    transferFunction(
        worker,
        function setupPlotter() {
            globalThis.plotter = new globalThis.WebglLinePlotUtil() as WebglLinePlotUtil;
        },
        'setupPlotter'
    );
    transferFunction(
        worker,
        setupChart,
        'setupChart'
    );
    transferFunction(
        worker,
        updateChartData,
        'updateChartData'
    );
    transferFunction(
        worker,
        resetChart,
        'resetChart'
    );
    transferFunction(
        worker,
        clearChart,
        'clearChart'
    );
}
//onclick we will add worker, transfer the api, then call all of the functions in the correct order, passing available arguments
export function transferStreamAPI(worker:WorkerInfo) {

    transferClass(worker, WebSerial, 'WebSerial');

    transferFunction(
        worker,
        function receiveDecoder(decoder:any, decoderName:string) {
            globalThis.decoders[decoderName] = (0, eval)('('+decoder+')');
        },
        'receiveDecoder'
    )
    transferFunction(
        worker,
        function decode(data:any) {
            return globalThis.decoders[globalThis.decoder](data);
        },
        'decode'
    );
    transferFunction(
        worker,
        function setActiveDecoder(decoderName) {
            //console.log('received decoder:',decoderName)
            globalThis.decoder = decoderName;

            return true;
        },
        'setActiveDecoder'
    );
    transferFunction(
        worker, 
        function setupSerial() {
            globalThis.Serial = new globalThis.WebSerial() as WebSerial; 
            globalThis.decoder = 'raw';
            console.log('worker: Setting up Serial', globalThis.Serial)

            //globalThis.Serial.getPorts().then(console.log)
            return true;
        },
        'setupSerial'
    );

    transferFunction(
        worker,
        function openPort(self, origin, settings:SerialOptions & { usbVendorId:number, usbProductId:number, pipeTo?:string|{route:string, _id:string, extraArgs:any[]}, frequency?:number, buffering?:{searchBytes:Uint8Array} }) {
            
            const WorkerService = self.graph as WorkerService;
            if(!globalThis.Serial) WorkerService.run('setupSerial');
            return new Promise((res,rej) => {
                globalThis.Serial.getPorts().then((ports)=>{
        
                    const Serial = globalThis.Serial as WebSerial;
    
                    let port = ports.find((port)=>{
                        return port.getInfo().usbVendorId === settings.usbVendorId && port.getInfo().usbProductId === settings.usbProductId;
                    });
                    if(port) {
                        Serial.openPort(port, settings).then(() => {
                            const stream = Serial.createStream({
                                port, 
                                frequency:settings.frequency ? settings.frequency : 10,
                                buffering:settings.buffering,
                                ondata: (value:Uint8Array) => { 
                                    //if(globalThis.decoder) value = WorkerService.run(globalThis.decoder, value); //run the decoder if set on this thread, else return the array buffer result raw or pipe to another thread
                                    //console.log(value);
                                    if(stream.settings.pipeTo) {
                                        if(typeof stream.settings.pipeTo === 'string')
                                            WorkerService.transmit(value, stream.settings.pipeTo, [value.buffer] as any);
                                        //we can subscribe on the other end to this worker output by id
                                        else if (stream.settings.pipeTo?.route) {
                                            let args:any = value;
                                            if(stream.settings.pipeTo.extraArgs) args = [value, ...stream.settings.pipeTo.extraArgs];
                                            WorkerService.transmit({route:stream.settings.pipeTo.route, args }, stream.settings.pipeTo._id,  [value.buffer] as any);
                                        }
                                    } else {
                                        WorkerService.transmit(value, origin, [value.buffer] as any);
                                        //we can subscribe on the other end to this worker output by id
                                    }
                                }
                            });
                            stream.settings = settings; //save the settings 
        
                            Serial.readStream(stream);
        
                            console.log(stream);

                            res({
                                _id:stream._id,
                                settings,
                                info:stream.info
                            })
                        });
                    } else {
                        rej(false);
                    }
                })
            })
            
        },
        'openPort'
    )
   
    transferFunction(
        worker,
        function closeStream(self, origin, streamId) {
            return new Promise((res,rej) => {

                const Serial = globalThis.Serial as WebSerial;

                Serial.closeStream(Serial.streams[streamId]).then((resolved) => {
                    res(resolved);
                }).catch(rej);
            });

        },
        'closeStream'
    );
    transferFunction(
        worker,
        function writeStream(self, origin, streamId, message:any) {

            (globalThis.Serial as WebSerial).writeStream(globalThis.Serial.streams[streamId], message).then(console.log);

            return true;
        },
        'writeStream'
    );
    transferFunction(
        worker,
        function updateStreamSettings(self,origin, streamId:string, settings:any) {
            if(globalThis.Serial?.streams[streamId]) {
                for(const key in settings) {
                    if(typeof settings[key] === 'object') {
                        Object.assign(globalThis.Serial.streams[streamId].settings[key], settings[key]);
                    }
                    else globalThis.Serial.streams[streamId][key] = settings[key];
                }
            }
        },
        'updateStreamSettings'
    )
}
//make a serial stream worker and a decoder worker separately,
//workers.establishMessageChannel(worker1, worker2);
//setup the serial with pipeTo set to the second worker, and the second worker set up with the decoder
//subscribe the decoder worker to run decoder on worker1's message and then pass result to main thread and/or render thread(s)


//create the necessary canvases and transfer to the worker, run the setup routines. etc
export function initWorkerChart(
    worker:WorkerInfo, 
    settings:Partial<WebglLinePlotProps>, //default graph one line
    parentDiv:string|HTMLElement
) {
    transferChartCommands(worker);

    if(typeof parentDiv === 'string') parentDiv = document.getElementById(parentDiv) as HTMLElement;
    if(!parentDiv) parentDiv = document.body;

    const plotDiv = document.createElement('div');
    plotDiv.style.width = '100%';
    plotDiv.style.height = '100%';

    parentDiv.appendChild(plotDiv)

    const chart = document.createElement('canvas');

    const devicePixelRatio = window.devicePixelRatio || 1;
    (chart as any).width = parentDiv.clientWidth ? parentDiv.clientWidth : window.innerWidth;
    (chart as any).height = parentDiv.clientHeight ? parentDiv.clientHeight : 450;
    chart.style.width = '100%';
    chart.style.height = '100%';

    const overlay = document.createElement('canvas');

    (overlay as any).width = parentDiv.clientWidth ? parentDiv.clientWidth : window.innerWidth;
    (overlay as any).height = parentDiv.clientHeight ? parentDiv.clientHeight : 450;
    overlay.style.left = parentDiv.offsetLeft + 'px';
    overlay.style.top = parentDiv.offsetTop + 'px';
    overlay.style.width = (parentDiv.clientWidth ? parentDiv.clientWidth : window.innerWidth) + 'px';
    overlay.style.height = (parentDiv.clientHeight ? parentDiv.clientHeight : 450) + 'px';
    overlay.style.transform = `translateY(-${overlay.height}px)`;

    plotDiv.appendChild(chart);
    plotDiv.appendChild(overlay);

    let offscreenchart = (chart as any).transferControlToOffscreen();
    let offscreenoverlay = (overlay as any).transferControlToOffscreen();

    // offscreenchart.width = (chart as any).width * devicePixelRatio;
    // offscreenchart.height = (chart as any).height * devicePixelRatio;

    // offscreenoverlay.width = (overlay as any).width * devicePixelRatio;
    // offscreenoverlay.height = (overlay as any).height * devicePixelRatio;

    parentDiv.appendChild(plotDiv);

    //setTimeout(() => {
    let updated = Object.assign({
        canvas:offscreenchart,
        overlay:offscreenoverlay,
    },settings);


    let request = worker.request({
        route:'setupChart',
        args:updated
    }, [offscreenchart, offscreenoverlay]);
    
    //}, 100)

    return {
        request,
        chart,
        overlay,
        plotDiv,
        parentDiv
    };


}


export function createStreamRenderPipeline(dedicatedSerialWorker=false) {
    let streamworker = workers.addWorker({url:gsworker}) as WorkerInfo;
    let chartworker = workers.addWorker({url:gsworker}) as WorkerInfo;
    let serialworker, decoderPort, chartPort;

    if(dedicatedSerialWorker) {
        serialworker = workers.addWorker({url:gsworker}) as WorkerInfo;
        transferStreamAPI(serialworker);
        decoderPort = workers.establishMessageChannel(serialworker.worker, streamworker.worker); //returns the id of the port so we can orchestrate port communication
    
        serialworker.post('setupSerial');
    }   

    transferStreamAPI(streamworker);
    transferChartCommands(chartworker);

    chartPort = workers.establishMessageChannel(streamworker.worker, chartworker.worker); //returns the id of the port so we can orchestrate port communication

    // initWorkerChart(
    //     chartworker
    // )

    transferFunction(
        streamworker,
        function decodeAndPassToChart(self, origin, data:any, chartPortId:string) {
            let decoded = self.graph.run('decode',data);
            if(decoded) self.graph.workers[chartPortId].send(
                {
                    route:'updateChartData',
                    args:[chartPortId,decoded]
                }//,
                //chartPortId
            );
            //console.log(decoded, self.graph)
            return decoded;
        },
        'decodeAndPassToChart'
    );

    //for BLE we need to pass the output to the stream worker and run decode,
    //for serial we need to tell the serial port/decoder worker to do that instead of the main thread,
    // and proxy the serial port controls

    let result:any = {
        streamworker,
        chartworker,
        chartPort, //stream --> chart worker message port
    };
    if(serialworker) {
        result.serialworker = serialworker;
        result.decoderPort = decoderPort; //serial --> stream worker message port
    }

    return result;
}

//after calling createStreamRenderPipeline
export function initWorkerSerialStream(
    streamworker:WorkerInfo, 
    chartworker:WorkerInfo,
    portId:string, 
    streamSettings:SerialOptions & { usbVendorId:number, usbProductId:number, pipeTo?:string|{route:string, _id:string}, frequency?:number },
    chartSettings:WebglLinePlotProps,
    chartParent:HTMLElement|string
) {
    
    streamSettings.pipeTo = {route:'updateChartData', _id:portId};
    
    streamworker.send({
        route:'startSerialStream',
        args:streamSettings
    });

    initWorkerChart(
        chartworker, 
        chartSettings, 
        chartParent
    );
}


export function cleanupWorkerStreamPipeline(streamworker, chartworker, plotDiv?:HTMLElement, serialworker?) {
    if(streamworker) workers.terminate(streamworker.worker);
    if(chartworker) workers.terminate(chartworker.worker);
    if(serialworker) workers.terminate(serialworker.worker);

    if(plotDiv) plotDiv.remove();   
}

//also incl https://github.com/joshbrew/BiquadFilters.js/blob/main/BiquadFilters.js

// //TODO: Make a worker for each stream & visual, TO THE MAXXX, they will just run in order, too bad we can't force cores to mainline different tasks so device source streams and frontend logic don't compete
// const decoderworker = workers.addWorker({url:gsworker}); //this will handle decoder logic//

// transferStreamAPI(decoderworker);

// decoderworker.request({route:'decode', args:[[1,2,3]]}).then((res)=>{console.log('decoded', res)});
// // const chartworker = workers.addWorker({url:gsworker}); //this will visualize data for us if formats fit

// decoderworker.send('test')

// decoderworker.request( 
//     {
//         route:'setRoute', 
//         args:[
//             function (value:any) { //to be overwritten when we want to swap decoders
//                 return value; //ping pong
//             }.toString(),
//             'decode'
//         ]
//     } as ServiceMessage //use service messages to communicate with disconnected service graphs
// ).then(console.log);

// // //let's load the serial library in a worker and try to run it there >_>
// // decoderworker.request(
// //     {
// //         route:'receiveClass',
// //         args:[WebSerial.toString(),'WebSerial'] 
// //     } as ServiceMessage
// // ).then(console.log);

// // //create a callback to setup our transferred class
// decoderworker.request(
//     {
//         route:'setRoute',
//         args:[
//             function setupSerial(self) {
//                 globalThis.Serial = new globalThis.WebSerial() as WebSerial; 
//                 console.log('worker: Setting up Serial', globalThis.Serial)

//                 globalThis.Serial.getPorts().then(console.log)
//                 return true;
//             }.toString(),
//             'setupSerial'
//         ]
//     } as ServiceMessage
// ).then(console.log);

// decoderworker.request({route:'setupSerial'}).then(console.log); //now make sure it is ready
