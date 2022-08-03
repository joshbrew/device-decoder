import {StreamInfo, WebSerial} from './src/serial/serialstream'
import {BLEClient, DeviceOptions} from './src/ble/ble_client'
import {Router, DOMService, WorkerService, ServiceMessage, proxyWorkerRoutes, workerCanvasRoutes, DOMElement } from '../GraphServiceRouter/index'
import { ElementInfo, ElementProps } from 'graphscript/dist/services/dom/types/element';
import { DOMElementProps } from 'graphscript/dist/services/dom/types/component';
import { WorkerInfo } from 'graphscript';

import gsworker from './src/debugger.worker'

//import beautify_js from './src/beautify.min'
import { decoders } from './src/decoders/index'
import { WebglLinePlotUtil, WebglLinePlotProps, WebglLinePlotInfo, WebglLineProps } from '../BrainsAtPlay_Libraries/webgl-plot-utils/webgl-plot-utils'//'webgl-plot-utils';




/**
    <Debugger window component>
        <------------------------------------------>
            <BLE Button>
            <BLE Config>
                <device filters> - i.e. the namePrefix 

            Browser only:
            <Serial Button>
            <Serial Config>
                <device filters>
                <baudRate>
                <bufferSize>


            Create a window for active serial connections with selective disconnecting and decoding etc.
        <------------------------------------------>
            Connections
            <Console window> - takes up most of the screen
                Creates a console for each active usb connection/ble characteristic (read/write/notify), just stuff them next to each other with flex boxes.
                Each console has controls for each connection with a full test suite and selective notification/read/write controls/decoder selection etc..

                Connection Info
                Decoder Options, Output Modes
                Console mode (toggle one):
                <Latest> (only the most recent samples in raw text)
                <Scrolling> (up to 1000 samples in raw text)
                <Charting> (if debugger output matches a given format - use arduino output format?)
                <Blocks> (for ble services)

                Console

                TODO: more stuff like latencies, callback info, etc.
        <------------------------------------------>
            Custom decoder writer:
            Test input (e.g. copied from above consoles, evaluating any comma separated numbers into an array),
            Eval a text inputted decoder function
            Test output, keep editing till it gives a templated response

            then at the bottom e.g. 'suggested output format: "1000,3000,400,5000"' or maybe an object with named keys. and we will take care of timestamping for the charts and csvs

*/

function isMobile() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||(window as any).opera);
    return check;
};

const Serial = new WebSerial();
const BLE = new BLEClient();
const plotter = new WebglLinePlotUtil();


const workers = new WorkerService(); 

const defaultChart = {
    lines:{
        '0':{nPoints:1000}
    },
    generateNewLines:true,
    cleanGeneration:true
}

// chart settings as per our WebglLineProps interface
const chartSettings:{[key:string]:Partial<WebglLinePlotProps>} = {
    'raw':defaultChart,
    'utf8':defaultChart,
    'console-f12':defaultChart,
    'debug':defaultChart,
    'ads131m08':{
        lines:{
            '0':{nSec:10, sps:250},
            '1':{nSec:10, sps:250},
            '2':{nSec:10, sps:250},
            '3':{nSec:10, sps:250},
            '4':{nSec:10, sps:250},
            '5':{nSec:10, sps:250},
            '6':{nSec:10, sps:250},
            '7':{nSec:10, sps:250}
        }
    },
    'max3010x':{
        lines:{
            red:{nPoints:1000},
            ir:{nPoints:1000}
        }
    },
    'mpu6050':{
        lines:{
            'ax':{nSec:10, sps:100},
            'ay':{nSec:10, sps:100},
            'az':{nSec:10, sps:100},
            'gx':{nSec:10, sps:100},
            'gy':{nSec:10, sps:100},
            'gz':{nSec:10, sps:100}
        }
    },
    'freeeeg32':{ //adding the rest below
        lines:{
            'ax':{nSec:10, sps:500},
            'ay':{nSec:10, sps:500},
            'az':{nSec:10, sps:500},
            'gx':{nSec:10, sps:500},
            'gy':{nSec:10, sps:500},
            'gz':{nSec:10, sps:500}
        }
    }, //https://github.com/joshbrew/freeeeg32.js
    'freeeeg128':{  //adding the rest below
        lines:{
            'ax':{nSec:10, sps:500},
            'ay':{nSec:10, sps:500},
            'az':{nSec:10, sps:500},
            'gx':{nSec:10, sps:500},
            'gy':{nSec:10, sps:500},
            'gz':{nSec:10, sps:500}
        }
    },
    'cyton':{
        lines:{
            '0':{nSec:10, sps:250},
            '1':{nSec:10, sps:250},
            '2':{nSec:10, sps:250},
            '3':{nSec:10, sps:250},
            '4':{nSec:10, sps:250},
            '5':{nSec:10, sps:250},
            '6':{nSec:10, sps:250},
            '7':{nSec:10, sps:250},
            'ax':{nSec:10, sps:250},
            'ay':{nSec:10, sps:250},
            'az':{nSec:10, sps:250},
            'gx':{nSec:10, sps:250},
            'gy':{nSec:10, sps:250},
            'gz':{nSec:10, sps:250},
        }
    }, //https://github.com/joshbrew/cyton.js
    //'cognixionBLE':{}, //see the super secret docs
    'hegduino':{
        lines:{
            red:{nPoints:1000},
            ir:{nPoints:1000},
            ratio:{nPoints:1000},
            ambient:{nPoints:1000},
            temperature:{nPoints:1000},
        }
    }, //https://github.com/joshbrew/hegduino.js -- incl check for android (3 outputs only) output
    //'peanut':{} //https://github.com/joshbrew/peanutjs/blob/main/peanut.js
    //...custom?
}

for(let i = 0; i < 128; i++) {
    if(i<32) {
        chartSettings['freeeeg32'].lines[i] = {sps:500,nSec:10};
    }
    chartSettings['freeeeg128'].lines[i] = {sps:500,nSec:10};
}


const setupChart = (settings:WebglLinePlotProps) => {
    console.log('initializing chart', settings)
    if(!globalThis.plotter) globalThis.plotter = new globalThis.WebglLinePlotUtil();
    return globalThis.plotter.initPlot(settings).settings._id;
}

const updateChartData = (
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

const clearChart = (
    plot:WebglLinePlotInfo|string
) => {
    globalThis.plotter.deinitPlot(plot);
    return true;
}

const resetChart = (
    plot:WebglLinePlotInfo|string,
    settings:WebglLinePlotProps
) => {
    globalThis.plotter.reinitPlot(plot,settings);
    return settings._id;
}


//transfer decoders
function transferFunction(worker:WorkerInfo, fn:any, fnName?:string) {
    if(!fnName) fnName = fn.name;
    return worker.request({
        route:'setRoute',
        args:[
            fn.toString(),
            fnName
        ]
    } as ServiceMessage);
}

function transferClass(worker:WorkerInfo, cls:any, className?:string) {
    if(!className) className = cls.name;
    return worker.request({
        route:'receiveClass',
        args:[
            cls.toString(),
            className
        ] 
    } as ServiceMessage);
}


function transferChartCommands(worker:WorkerInfo) {
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
function transferStreamAPI(worker:WorkerInfo) {

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

            globalThis.Serial.getPorts().then(console.log)
            return true;
        },
        'setupSerial'
    );

    transferFunction(
        worker,
        function openPort(self, origin, settings:SerialOptions & { usbVendorId:number, usbProductId:number, pipeTo?:string|{route:string, _id:string}, frequency?:number }) {
            globalThis.Serial.getPorts().then((ports)=>{
                const WorkerService = self.graph as WorkerService;
                if(!globalThis.Serial) WorkerService.run('setupSerial');
    
                const Serial = globalThis.Serial as WebSerial;

                let port = ports.find((port)=>{
                    return port.getInfo().usbVendorId === settings.usbVendorId && port.getInfo().usbProductId === settings.usbProductId;
                });
                if(port) {
                    Serial.openPort(port, settings).then(() => {
                        const stream = Serial.createStream({
                            port, 
                            frequency:settings.frequency ? settings.frequency : 10,
                            ondata: (value:ArrayBuffer) => { 
                                if(globalThis.decoder) value = WorkerService.run(globalThis.decoder, value); //run the decoder if set on this thread, else return the array buffer result raw or pipe to another thread
    
                                if(stream.settings.pipeTo) {
                                    if(typeof stream.settings.pipeTo === 'string')
                                        WorkerService.transmit(value, stream.settings.pipeTo, (value instanceof ArrayBuffer || (value as any).constructor?.name.indexOf('Array') > 0) ? [value] as any : undefined);
                                    //we can subscribe on the other end to this worker output by id
                                    else if (stream.settings.pipeTo?.route) {
                                        WorkerService.transmit({route:stream.settings.pipeTo.route, args:value }, stream.settings.pipeTo._id, (value instanceof ArrayBuffer || (value as any).constructor?.name.indexOf('Array') > 0) ? [value] as any : undefined);
                                    }
                                } else {
                                    WorkerService.transmit(value, origin, (value instanceof ArrayBuffer || (value as any).constructor?.name.indexOf('Array') > 0) ? [value] as any : undefined);
                                    //we can subscribe on the other end to this worker output by id
                                }
                            }
                        });
                        stream.settings = settings; //save the settings 
    
                        Serial.readStream(stream);
                    });
                } else {
                    return false;
                }
            })
        },
        'openPort'
    )
    transferFunction(
        worker,
        function startSerialStream(self, origin, settings:SerialOptions & { usbVendorId:number, usbProductId:number, pipeTo?:string|{route:string, _id:string}, frequency?:number }) {

            const WorkerService = self.graph as WorkerService;
            if(!globalThis.Serial) WorkerService.run('setupSerial');

            const Serial = globalThis.Serial as WebSerial;

            Serial.requestPort(settings.usbVendorId, settings.usbProductId).then((port) => {
                Serial.openPort(port, settings).then(() => {
                    const stream = Serial.createStream({
                        port, 
                        frequency:settings.frequency ? settings.frequency : 10,
                        ondata: (value:ArrayBuffer) => { 
                            if(globalThis.decoder) value = WorkerService.run(globalThis.decoder, value); //run the decoder if set on this thread, else return the array buffer result raw or pipe to another thread

                            if(stream.settings.pipeTo) {
                                if(typeof stream.settings.pipeTo === 'string')
                                    WorkerService.transmit(value, stream.settings.pipeTo, (value instanceof ArrayBuffer || (value as any).constructor?.name.indexOf('Array') > 0) ? [value] as any : undefined);
                                //we can subscribe on the other end to this worker output by id
                                else if (stream.settings.pipeTo?.route) {
                                    WorkerService.transmit({route:stream.settings.pipeTo.route, args:value }, stream.settings.pipeTo._id, (value instanceof ArrayBuffer || (value as any).constructor?.name.indexOf('Array') > 0) ? [value] as any : undefined);
                                }
                            } else {
                                WorkerService.transmit(value, origin, (value instanceof ArrayBuffer || (value as any).constructor?.name.indexOf('Array') > 0) ? [value] as any : undefined);
                                //we can subscribe on the other end to this worker output by id
                            }
                        }
                    });
                    stream.settings = settings; //save the settings 

                    Serial.readStream(stream);
                    
                });
            }).catch(console.error);
        
            return true;
        },
        'startSerialStream'
    );
    transferFunction(
        worker,
        function closeStream(self, origin, streamId) {
            const Serial = globalThis.Serial as WebSerial;

            Serial.closeStream(Serial.streams[streamId]);

            return true;
        },
        'closeStream'
    );
    transferFunction(
        worker,
        function writeStream(self, origin, streamId, message:any) {
            const Serial = globalThis.Serial as WebSerial;

            Serial.writeStream(Serial.streams[streamId], message).then(console.log);

            return true;
        },
        'writeStream'
    );
}
//make a serial stream worker and a decoder worker separately,
//workers.establishMessageChannel(worker1, worker2);
//setup the serial with pipeTo set to the second worker, and the second worker set up with the decoder
//subscribe the decoder worker to run decoder on worker1's message and then pass result to main thread and/or render thread(s)


//create the necessary canvases and transfer to the worker, run the setup routines. etc
function initWorkerChart(
    worker:WorkerInfo, 
    settings:Partial<WebglLinePlotProps>, //default graph one line
    parentDiv:string|HTMLElement
) {
    transferChartCommands(worker);

    if(typeof parentDiv === 'string') parentDiv = document.getElementById(parentDiv);
    if(!parentDiv) parentDiv = document.body;

    const plotDiv = document.createElement('div');
    plotDiv.style.width = '100%';
    plotDiv.style.height = '100%';

    parentDiv.appendChild(plotDiv)

    const chart = document.createElement('canvas');

    const devicePixelRatio = window.devicePixelRatio || 1;
    (chart as any).width = parentDiv.clientWidth;
    (chart as any).height = parentDiv.clientHeight;
    chart.style.width = '100%';
    chart.style.height = '100%';

    const overlay = document.createElement('canvas');

    overlay.style.position = 'absolute';
    overlay.style.zIndex = '10';
    (overlay as any).width = parentDiv.clientWidth;
    (overlay as any).height = parentDiv.clientHeight;
    overlay.style.left = parentDiv.offsetLeft + 'px';
    overlay.style.top = parentDiv.offsetTop + 'px';
    overlay.style.width = parentDiv.clientWidth + 'px';
    overlay.style.height = parentDiv.clientHeight + 'px';

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


function createStreamRenderPipeline() {
    let streamworker = workers.addWorker({url:gsworker});
    let chartworker = workers.addWorker({url:gsworker});

    transferStreamAPI(streamworker);
    transferChartCommands(chartworker);

    let portId = workers.establishMessageChannel(streamworker.worker, chartworker.worker); //returns the id of the port so we can orchestrate port communication

    // initWorkerChart(
    //     chartworker
    // )

    transferFunction(
        streamworker,
        function decodeAndPassToChart(self, origin, data:any, chartPortId:string) {
            let decoded = self.graph.run('decode',data);
            //console.log('decoded', decoded)
            if(decoded) self.graph.workers[chartPortId].send(
                {
                    route:'updateChartData',
                    args:[chartPortId,decoded]
                }//,
                //chartPortId
            );
            return decoded;
        },
        'decodeAndPassToChart'
    );

    //for BLE we need to pass the output to the stream worker and run decode,
    //for serial we need to tell the serial port/decoder worker to do that instead of the main thread,
    // and proxy the serial port controls

    return {
        streamworker,
        chartworker,
        portId
    };
}

//after calling createStreamRenderPipeline
function initWorkerSerialStream(
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


function cleanupWorkerStreamPipeline(streamworker, chartworker, plotDiv?:HTMLElement) {
    workers.terminate(streamworker.worker);
    workers.terminate(chartworker.worker);

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


//alternatively, implement this all in a single web component
const domtree = {
    'debugger': {
        template:()=>{return '';},//`<div>Test</div>`;}, //`<div>Test</div>`
        tagName:'device-debugger',
        styles:`

        label {
            display:inline-block;
            width:100%;
            border-bottom:1px solid black;
        }

        label > input {
            width:35%;
            float:right;
        }

        input {
            font-family: Consolas,monaco,monospace;
            font-size:10px;
        }
        
        select {
            font-family: Consolas,monaco,monospace; 
            font-size: 10px;
        }

        textarea {
            font-family: Consolas,monaco,monospace; 
            font-size: 10px;
            height: 100px;
            min-width: 150px;
        }
        

        label > select {
            float:right;
        }

        td {
            border-bottom: 1px solid white;
        }

        .debugger {
            font-family: Consolas,monaco,monospace; 
            position:absolute;
            left:0px;
            top:0px;
            border:2px solid black;
            font-size:10px; 
            width:99.7%;
        }

        .config {
            width:50%;
            display:inline-block;
            vertical-align:top;
        }

        .connectiontemplate {
           color:white; 
        }
        
        .console {
            color:white; 
            background-color:black; 
            font-size:10px; 
            font-family:Consolas,monaco,monospace; 
            overflow-y:scroll;
            max-width:100vw;
            height:300px;
            display:flex;
            flex-direction: column-reverse;
        }

        .console canvas {
            position:absolute;
            z-index:2;
            width:100%;
            height:100%;
        }

        `,
        children:{
            'debuggerbody':{
                tagName:'div',
                attributes:{
                    className:'debugger'
                },
                children:{
                    'header':{
                        tagName:'div',
                        children:{
                            'connectionopts':{
                                tagName:'div',
                                children:{
                                    'bleopts':{
                                        tagName:'div',
                                        attributes:{
                                            className:'config'
                                        },
                                        children:{                
                                            'bleconnect':{
                                                tagName:'button',
                                                innerText:'Connect BLE Device',
                                                onrender:(self: HTMLElement, info?: ElementInfo)=>{
                                                    self.onclick = () => {

                                                        let parent = document.querySelector('device-debugger');
                                                        let services:any = {}; //comma separated
                                                        let reqlen = '0000CAFE-B0BA-8BAD-F00D-DEADBEEF0000'.length;
                                                        (parent.querySelector('#serviceuuid') as HTMLInputElement).value.split(',').forEach((uu) => { if(uu.length === reqlen) services[uu.toLowerCase()] = {}; else console.error('uuid format is wonk', uu, 'expected format (e.g.):', '0000CAFE-B0BA-8BAD-F00D-DEADBEEF0000'.toLowerCase()) }); //todo, set up characteristics on first go
                                                        if(Object.keys(services).length === 0) services = {['0000CAFE-B0BA-8BAD-F00D-DEADBEEF0000'.toLowerCase()]:{}};

                                                        let disconnectCallbacks = {}

                                                        const setupOpts:DeviceOptions = {
                                                            services,
                                                            ondisconnect:(deviceId:string) => {
                                                                console.log('disconnected', deviceId);
                                                                if(disconnectCallbacks[deviceId]) {
                                                                    for(const key in disconnectCallbacks[deviceId]) {
                                                                        disconnectCallbacks[deviceId][key](deviceId);
                                                                    }
                                                                }
                                                            }
                                                        };
                                                        if((parent.querySelector('#deviceId') as HTMLInputElement).value) {
                                                            setupOpts.deviceId = (parent.querySelector('#deviceId') as HTMLInputElement).value;
                                                        }
                                                        else if((parent.querySelector('#namePrefix') as HTMLInputElement).value) {
                                                            setupOpts.namePrefix = (parent.querySelector('#namePrefix') as HTMLInputElement).value;
                                                        }

                                                        BLE.setup(setupOpts).then((stream)=>{
                                                            console.log(stream)

                                                            class ConnectionTemplate extends DOMElement {
                                                                    
                                                                stream=stream;
                                                                output:any;
                                                                outputText:string='';
                                                                workers={};

                                                                anim:any;

                                                                template = ()=>{ return `
                                                                    <div id='${this.stream.deviceId}' style='display:none;' class='connectiontemplate'>
                                                                        BLE Connection 
                                                                        <div>
                                                                            <span> BLE Device Name: </span><span>${this.stream.device.name}</span><span> BLE Device ID: </span><span>${this.stream.deviceId}</span>
                                                                        </div>
                                                                        <table id='${this.stream.deviceId}info'>
                                                                        </table>
                                                                        <div>
                                                                            <button id='${this.stream.deviceId}xconnect'>Disconnect</button>
                                                                            <button id='${this.stream.deviceId}x'>Remove</button>
                                                                        </div>
                                                                        <div>
                                                                            <label>
                                                                                Output Mode: <br/>
                                                                                <select id='${this.stream.deviceId}outputmode'>
                                                                                    <option value='b' selected> All </option>
                                                                                    <option value='a'> Latest </option>
                                                                                </select>
                                                                            </label>
                                                                        </div>
                                                                        <div id='${this.stream.deviceId}connectioninfo'> RSSI: <span id='${this.stream.deviceId}rssi'></span></div>
                                                                        <div 
                                                                            id='${this.stream.deviceId}console' 
                                                                            class='console'>
                                                                        </div>
                                                                        <div
                                                                            id='${this.stream.deviceId}chart' 
                                                                            style='height:300px; width:100%;'
                                                                        ></div>
                                                                    </div>`;
                                                                }

                                                                oncreate = (self:DOMElement,props:any) => {
                                                                    //spawn a graph based prototype hierarchy for the connection info?
                                                                    //e.g. to show the additional modularity off
                                                                    disconnectCallbacks[this.stream.deviceId] = {
                                                                        'rmworkers':()=>{
                                                                            if(this.workers) 
                                                                                for(const key in this.workers) {
                                                                                    cleanupWorkerStreamPipeline( this.workers[key].streamworker,  this.workers[key].chartworker);
                                                                                    delete this.workers[ this.workers[key].portId as string];
                                                                                }
                                                                        }
                                                                    }
                            
                                                                    let c = self.querySelector('[id="'+this.stream.deviceId+'console"]') as HTMLElement;
                                                                    let outputmode = self.querySelector('[id="'+this.stream.deviceId+'outputmode"]') as HTMLInputElement;
                            
                                                                    this.anim = () => { 
                                                                        if(outputmode.value === 'a') 
                                                                            c.innerText = `${this.output}`; 
                                                                        else if (outputmode.value === 'b') {
                                                                            if(this.outputText.length > 20000) { //e.g 20K char limit
                                                                                this.outputText = this.outputText.substring(this.outputText.length - 20000, this.outputText.length); //trim output
                                                                            }
                                                                            c.innerText = this.outputText;
                                                                        }
                                                                    }

                                                                    (self.querySelector('[id="'+this.stream.deviceId+'"]') as HTMLElement).style.display = '';

                                                                    const xconnectEvent = (ev) => {
                                                                        BLE.disconnect(this.stream.device).then(() => {
                                                                            (self.querySelector('[id="'+this.stream.deviceId+'xconnect"]') as HTMLButtonElement).innerHTML = 'Reconnect';
                                                                            (self.querySelector('[id="'+this.stream.deviceId+'xconnect"]') as HTMLButtonElement).onclick = (ev) => {  
                                                                                BLE.reconnect(this.stream.deviceId).then((device) => {
                                                                                    this.output = 'Reconnected to ' + device.deviceId;
                                                                                    //self.render(); //re-render, will trigger oncreate again to reset this button and update the template 
                                                                                })
                                                                            }
                                                                        });
                                                                    }

                                                                    (self.querySelector('[id="'+this.stream.deviceId+'xconnect"]') as HTMLButtonElement).onclick = xconnectEvent;

                                                                    (self.querySelector('[id="'+this.stream.deviceId+'x"]') as HTMLButtonElement).onclick = () => {
                                                                        BLE.disconnect(this.stream.device);
                                                                        this.delete();
                                                                        self.querySelector('[id="'+this.stream.deviceId+'console"]').remove(); //remove the adjacent output console
                                                                    }
                                                                
                                                                    // (self.querySelector('[id="'+this.stream.deviceId+'decoder"]') as HTMLInputElement).onchange = (ev) => {
                                                                    //     this.decoder = decoders[(self.querySelector('[id="'+this.stream.deviceId+'decoder"]') as HTMLInputElement).value];
                                                                    // }

                                                                    let rssielm = self.querySelector('[id="'+this.stream.device.deviceId + 'rssi"]') as HTMLElement;

                                                                    //mobile only
                                                                    let rssiFinder = () => {
                                                                        if(BLE.devices[this.stream.device.deviceId]) {
                                                                            BLE.readRssi(this.stream.device).then((rssi) => {
                                                                                rssielm.innerText = `${rssi}`;
                                                                                setTimeout(()=>{rssiFinder();},250);
                                                                            }).catch((er)=> {rssielm.innerText = er; console.error(er); });
                                                                        }
                                                                    }

                                                                    if(isMobile()) rssiFinder(); //mobile only


                                                                    BLE.getServices(this.stream.device.deviceId).then((svcs) => {
                                                                        console.log('services', svcs)
                                                                        self.querySelector('[id="'+this.stream.deviceId+'info"]').innerHTML = `<tr><th>UUID</th><th>Notify</th><th>Read</th><th>Write</th><th>Broadcast</th><th>Indicate</th></tr>`
                                                                        svcs.forEach((s) => {    
                                                                            self.querySelector('[id="'+this.stream.deviceId+'info"]').insertAdjacentHTML('beforeend', `<tr colSpan=6><th>${s.uuid}</th></tr>`)
                                                                            s.characteristics.forEach((c) => { 
                                                                                //build interactivity/subscriptions for each available service characteristic based on readable/writable/notify properties
                                                                                self.querySelector('[id="'+this.stream.deviceId+'info"]').insertAdjacentHTML(
                                                                                    'beforeend', 
                                                                                    `<tr>
                                                                                        <td id='${c.uuid}'>${c.uuid}</td>
                                                                                        <td id='${c.uuid}notify'>${c.properties.notify ? `<button id="${c.uuid}notifybutton">Subscribe</button> Decoder: <select id="${c.uuid}notifydecoder">${Object.keys(decoders).map((d,i) => `<option value='${d}' ${i === 0 ? 'selected' : ''}>${d.toUpperCase()}</option>`).join('')}</select>` : 'false'}</td>
                                                                                        <td id='${c.uuid}read'>${c.properties.read ? `<button id="${c.uuid}readbutton">Read</button> Decoder: <select id="${c.uuid}readdecoder">${Object.keys(decoders).map((d,i) => `<option value='${d}' ${i === 0 ? 'selected' : ''}>${d.toUpperCase()}</option>`).join('')}</select>` : 'false'}</td>
                                                                                        <td id='${c.uuid}write'>${c.properties.write ? `<input type='text' id="${c.uuid}writeinput"></input><button id="${c.uuid}writebutton">Write</button>` : 'false'}</td>
                                                                                        <td id='${c.uuid}broadcast'>${c.properties.broadcast}</td>
                                                                                        <td id='${c.uuid}indicate'>${c.properties.indicate}</td>
                                                                                    </tr>`
                                                                                );

                                                                                if(c.properties.notify) {
                                                                                    let decoderselect = self.querySelector('[id="'+c.uuid+'notifydecoder"]') as HTMLInputElement;
                                                                                    let debugmessage = `${c.uuid} notify:`;

                                                                                    const notifyOnClick = () => {
                                                                                        //init decoder and chart worker
                                                                                        let streamworkers = createStreamRenderPipeline();
                                                                                        let decoderval = decoderselect.value;
                                                                                        let initialChart = chartSettings[decoderval];
                                                                                        initialChart._id = streamworkers.portId;

                                                                                        streamworkers.streamworker.send({route:'setActiveDecoder', args:decoderselect.value});

                                                                                        decoderselect.addEventListener('change',(ev)=> {
                                                                                            streamworkers.streamworker.send({route:'setActiveDecoder', args:decoderselect.value});
                                                                                            streamworkers.chartworker.send({route:'reinitPlot', args:[initialChart._id,chartSettings[decoderselect.value]]});
                                                                                        })

                                                                                        let chartDeets = initWorkerChart(
                                                                                            streamworkers.chartworker, 
                                                                                            initialChart, 
                                                                                            this.querySelector('[id="'+this.stream.deviceId+'chart"]') as HTMLElement
                                                                                        );

                                                                                        this.workers[streamworkers.portId as string] = streamworkers;

                                                                                        BLE.subscribe(this.stream.device, s.uuid, c.uuid, (result:DataView) => {
                                                                                            //console.log('notify', result)
                                                                                            const uint8 = new Uint8Array(result.buffer);
                                                                                            streamworkers.streamworker.request({route:'decodeAndPassToChart', args:[uint8,streamworkers.portId]},[uint8.buffer]).then((output) => {
                                                                                                //console.log('decoded', output);
                                                                                                if(output) {
                                                                                                    this.output = output;
                                                                                            
                                                                                                    if(outputmode.value === 'b') {
                                                                                                        if(decoderselect.value === 'debug') this.outputText += debugmessage + ' ';
                                                                                                        this.outputText += typeof this.output === 'string' ? `${this.output}\n` : `${JSON.stringify(this.output)}\n`
                                                                                                    }
                                                                                                    requestAnimationFrame(this.anim);
                                                                                                }
                                                                                            });
                                                                                            this.anim();
                                                                                        });

                                                                                        (self.querySelector('[id="'+c.uuid+'notifybutton"]') as HTMLButtonElement).innerText = 'Unsubscribe';
                                                                                        (self.querySelector('[id="'+c.uuid+'notifybutton"]') as HTMLButtonElement).onclick = ()=> {
                                                                             
                                                                                            BLE.unsubscribe(this.stream.device, s.uuid, c.uuid);
                                                                                            
                                                                                            cleanupWorkerStreamPipeline( streamworkers.streamworker, streamworkers.chartworker, chartDeets.plotDiv);
                                                                                            delete this.workers[streamworkers.portId as string];

                                                                                            (self.querySelector('[id="'+c.uuid+'notifybutton"]') as HTMLButtonElement).innerText = 'Subscribe';
                                                                                            (self.querySelector('[id="'+c.uuid+'notifybutton"]') as HTMLButtonElement).onclick = notifyOnClick;
                                                                                        }
                                                                                    }

                                                                                    (self.querySelector('[id="'+c.uuid+'notifybutton"]') as HTMLButtonElement).onclick = notifyOnClick;
                                                                                }
                                                                                if(c.properties.read) {
                                                                                    let decoderselect = self.querySelector('[id="'+c.uuid+'readdecoder"]') as HTMLInputElement;
                                                                                    let debugmessage = `${c.uuid} read:`;
                                                                                    (self.querySelector('[id="'+c.uuid+'readbutton"]') as HTMLButtonElement).onclick = () => { 
                                                                                        BLE.read(this.stream.device, s.uuid, c.uuid, (result:DataView) => {
                                                                                            this.output = decoders[decoderselect.value](result.buffer,debugmessage);

                                                                                            if(outputmode.value === 'b') {
                                                                                                this.outputText += `${this.output}\n`
                                                                                            }
                                                                                            requestAnimationFrame(this.anim);
                                                                                            //this.anim();
                                                                                        })
                                                                                    }
                                                                                }
                                                                                if(c.properties.write) {
                                                                                    let writeinput = self.querySelector('[id="'+c.uuid+'writeinput"]') as HTMLInputElement;
                                                                                    (self.querySelector('[id="'+c.uuid+'writebutton"]') as HTMLButtonElement).onclick = () => { 
                                                                                        let value:any = writeinput.value;
                                                                                        if(parseInt(value)) value = parseInt(value);
                                                                                        BLE.write(this.stream.device, s.uuid, c.uuid, BLEClient.toDataView(value), () => {
                                                                                            this.output = 'Wrote ' + value + 'to '+ c.uuid;

                                                                                            if(outputmode.value === 'b') {
                                                                                                this.outputText += `${this.output}\n`
                                                                                            }
                                                                                            requestAnimationFrame(this.anim);
                                                                                            //this.anim();
                                                                                        })
                                                                                    }
                                                                                }
                                                                            }); 
                                                                        });
                                                                    })   
                                                                }

                                                            }

                                                            let id = `ble${Math.floor(Math.random()*1000000000000000)}`;

                                                            ConnectionTemplate.addElement(`${id}-info`);
                                                            let elm = document.createElement(`${id}-info`);
                                                            //document.getElementById('connections').appendChild(elm);

                                                            document.querySelector('device-debugger').querySelector('#connections').appendChild(elm);
                                                            
                                                        }); //set options in bleconfig
                                                    }
                                                }
                                            } as ElementProps,
                                            'bleconfigdropdown':{
                                                tagName:'button',
                                                innerText:'--',
                                                style:{
                                                    float:'right'
                                                },
                                                attributes:{
                                                    onclick:(ev)=>{
                                                        //to make this more modular to select the adjacent node, ev.target.parentNode.querySelector('#bleconfigcontainer')
                                                        if( ev.target.parentNode.querySelector('#bleconfigcontainer').style.display === 'none') {
                                                            ev.target.parentNode.querySelector('#bleconfigcontainer').style.display = '';
                                                            ev.target.innerText = '--'
                                                        }
                                                        else {
                                                            ev.target.parentNode.querySelector('#bleconfigcontainer').style.display = 'none';
                                                            ev.target.innerText = '++'
                                                        }
                                                        // console.log(ev)
                                                        // let node = ev.target.node;
                                                        // for(const key in node.children) {
                                                        //     if(node.children[key].element) {
                                                        //         if(!node.children[key].element.style.display) node.children[key].element.style.display = 'none';
                                                        //         else node.children[key].element.style.display = '';
                                                        //     }
                                                        // }
                                                    }
                                                }
                                            },
                                            'bleconfig':{
                                                tagName:'div',
                                                children:{
                                                    'bleconfigcontainer':{
                                                        tagName:'div',
                                                        children:{
                                                            'namePrefixLabel':{
                                                                tagName:'label',
                                                                innerText:'BLE Device Name',
                                                                children:{
                                                                    'namePrefix':{
                                                                        tagName:'input',
                                                                        attributes:{
                                                                            type:'text',
                                                                            placeholder:'e.g. ESP32',
                                                                        }
                                                                    } as ElementProps,
                                                                }
                                                            } as ElementProps,
                                                            'ln':{template:'<br/>'},
                                                            'deviceIdLabel':{
                                                                tagName:'label',
                                                                innerText:'BLE Device ID (direct connect)',
                                                                children:{
                                                                    'deviceId':{
                                                                        tagName:'input',
                                                                        attributes:{
                                                                            type:'text'
                                                                        }
                                                                    } as ElementProps,
                                                                }
                                                            } as ElementProps,
                                                            'ln2':{template:'<br/>'},
                                                            'serviceuuidLabel':{
                                                                tagName:'label',
                                                                innerText:'Primary Service UUID(s), comma separated',
                                                                children:{
                                                                    'serviceuuid':{
                                                                        tagName:'input',
                                                                        attributes:{
                                                                            type:'text',
                                                                            value:'0000CAFE-B0BA-8BAD-F00D-DEADBEEF0000'.toLowerCase(),
                                                                            placeholder:'0000CAFE-B0BA-8BAD-F00D-DEADBEEF0000'.toLowerCase()
                                                                        }
                                                                    } as ElementProps,
                                                                }
                                                            } as ElementProps,
                                                            // 'ln3':{template:'<br/>'},
                                                            // 'servicesLabel':{
                                                            //     tagName:'label',
                                                            //     innerText:'Services Config ',
                                                            //     children:{
                                                            //         'services':{ //need to configure options for multiple services and multiple characteristics per service in like a table
                                                            //             tagName:'table',
                                                            //             style:{
                                                            //                 border:'1px solid black',
                                                            //                 display:'flex'
                                                            //             },
                                                            //             children:{
                                                            //             }
                                                            //         } as ElementProps
                                                            //     }
                                                            // }
                                                        }
                                                    } as ElementProps,
                                                } as ElementProps,
                                            } as ElementProps,
                                        }
                                    } as ElementProps,
                                    'serialopts':{
                                        tagName:'div',
                                        attributes:{
                                            className:'config'
                                        },
                                        onrender:(self)=>{
                                            if(isMobile()) self.style.display = 'none';
                                        },
                                        children:{
                                            'serialconnect':{
                                                tagName:'button',
                                                innerText:'Connect USB Device',
                                                onrender:(self: HTMLElement, info?: ElementInfo)=>{
                
                                                    let parent = document.querySelector('device-debugger');
                
                                                    const getSettings = (port:SerialPort) => { 
                
                                                        let settings:any = {
                                                            baudRate:(parent.querySelector('#baudRate') as HTMLInputElement).value ? parseInt((parent.querySelector('#baudRate') as HTMLInputElement).value) : 115200, //https://lucidar.me/en/serialib/most-used-baud-rates-table/
                                                            bufferSize:(parent.querySelector('#bufferSize') as HTMLInputElement).value ? parseInt((parent.querySelector('#bufferSize') as HTMLInputElement).value) : 255,
                                                            parity:(parent.querySelector('#parity') as HTMLInputElement).value ? (parent.querySelector('#parity') as HTMLInputElement).value as ParityType : 'none',
                                                            dataBits:(parent.querySelector('#dataBits') as HTMLInputElement).value ? parseInt((parent.querySelector('#dataBits') as HTMLInputElement).value) : 8,
                                                            stopBits:(parent.querySelector('#stopBits') as HTMLInputElement).value ? parseInt((parent.querySelector('#stopBits') as HTMLInputElement).value) : 1,
                                                            flowControl:(parent.querySelector('#flowControl') as HTMLInputElement).value ? (parent.querySelector('#flowControl') as HTMLInputElement).value as FlowControlType : 'none',
                                                            onconnect:(ev)=>{ console.log('connected! ', JSON.stringify(port.getInfo())); },
                                                            ondisconnect:(ev)=>{ console.log('disconnected! ', JSON.stringify(port.getInfo())); },
                                                            decoder:'raw' //default
                                                        }
                
                                                        return settings;
                                                    }
                
                                                    self.onclick = () => {
                                                        //TODO: do this on a thread instead...
                                                        Serial.requestPort(
                                                            (parent.querySelector('#usbVendorId') as HTMLInputElement).value ? parseInt((parent.querySelector('#usbVendorId') as HTMLInputElement).value) : undefined,
                                                            (parent.querySelector('#usbProductId') as HTMLInputElement).value ? parseInt((parent.querySelector('#usbProductId') as HTMLInputElement).value) : undefined
                                                        ).then((port)=>{
                
                                                            let id = `port${Math.floor(Math.random()*1000000000000000)}`;

                                                            class ConnectionTemplate extends DOMElement {
                                                                    
                                                                stream:StreamInfo;
                                                                output:any;
                                                                outputText:string='';
                                                                settings:any;
                                                                lastRead:number=0;
                                                                readRate:number=0;
                                                                anim:any;
                                                                decoder='raw'
                                                                workers={};
                
                                                                constructor() {
                                                                    super(); 
                
                                                                    this.settings = getSettings(port);

                                                                };
                
                                                                template = ()=>{ 
                                                                    
                                                                    return `
                                                                    <div id='${id}' style='display:none;' class='connectiontemplate'>
                                                                        Serial Connection
                                                                        <div>
                                                                            <span>USB Vendor ID: </span><span>${port.getInfo().usbVendorId}</span><span> USB Product ID: </span><span>${port.getInfo().usbProductId}</span>
                                                                        </div>
                                                                        <table id='${id}info'>
                                                                            <tr>
                                                                                <th>Baud Rate</th>
                                                                                <th>Buffer Size</th>
                                                                                <th>Parity</th>
                                                                                <th>Data Bits</th>
                                                                                <th>Stop Bits</th>
                                                                                <th>Flow Control</th>
                                                                            </tr>
                                                                            <tr>
                                                                                <td>${this.settings.baudRate}</td>
                                                                                <td>${this.settings.bufferSize}</td>
                                                                                <td>${this.settings.parity}</td>
                                                                                <td>${this.settings.dataBits}</td>
                                                                                <td>${this.settings.stopBits}</td>
                                                                                <td>${this.settings.flowControl}</td>
                                                                            </tr>
                                                                        </table>
                                                                        <div>
                                                                            <input id='${id}input' type='text' value='0x01'></input>
                                                                            <button id='${id}send'>Send</button>
                                                                            <button id='${id}xconnect'>Disconnect</button>
                                                                            <button id='${id}x'>Remove</button>
                                                                        </div>
                                                                        <div>
                                                                            <label>
                                                                                Decoder:
                                                                                <select id='${id}decoder'>
                                                                                    ${Object.keys(decoders).map((d,i) => `<option value='${d}' ${i === 0 ? 'selected' : ''}>${d.toUpperCase()}</option>`).join('')}
                                                                                </select>
                                                                            </label>
                                                                            <label>
                                                                                Output Mode: <br/>
                                                                                <select id='${id}outputmode'>
                                                                                    <option value='b' selected> All </option>
                                                                                    <option value='a'> Latest </option>
                                                                                </select>
                                                                            </label>
                                                                        </div>
                                                                        <div id='${id}connectioninfo'>Read Rate: <span id='${id}readrate'></span> updates/sec</div>
                                                                        <div id='${id}console' class='console'>
                                                                            <canvas id='${id}canvas'></canvas>
                                                                        </div>
                                                                    </div>`;
                                                                }
                
                                                                oncreate = (self:DOMElement,props:any) => {
                
                                                                    //spawn a graph based prototype hierarchy for the connection info?
                                                                    //e.g. to show the additional modularity off
                            
                                                                    let c = self.querySelector('[id="'+id+'console"]') as HTMLElement;
                                                                    let outputmode = self.querySelector('[id="'+id+'outputmode"]') as HTMLInputElement;
                                                                    let readrate = self.querySelector('[id="'+id+'readrate"]') as HTMLElement;

                                                                    this.anim = () => { 
                
                                                                        readrate.innerText = this.readRate.toFixed(6);
                            
                                                                        if(outputmode.value === 'a') 
                                                                            c.innerText = `${this.output}`; 
                                                                        else if (outputmode.value === 'b') {
                                                                            if(this.outputText.length > 20000) { //e.g 20K char limit
                                                                                this.outputText = this.outputText.substring(this.outputText.length - 20000, this.outputText.length); //trim output
                                                                            }
                                                                            c.innerText = this.outputText;
                                                                        }
                                                                    }

                                                                    //transfer serial api stuff,
                                                                    //setup the workers
                                                                    //now supplant this below code

                                                                    let info = port.getInfo();

                                                                    Serial.openPort(port, this.settings).then(()=>{

                                                                        this.stream = Serial.createStream({
                                                                            port,
                                                                            frequency:1,
                                                                            ondata: (value:ArrayBuffer) => { console.log(value) },
                                                                            buffering: true //buffer results and look for newlines, default \r\n --> new Uint8Array([0x0D,0x0A])
                                                                        });
                                                                        
                                                                        let debugmessage = `serial port ${port.getInfo().usbVendorId}:${port.getInfo().usbProductId} read:`;

                                                                        this.stream.ondata=(data:ArrayBuffer)=>{
                                                                            //pass to console
                                                                            this.output = decoders[this.decoder](data,debugmessage);
                
                                                                            let now = performance.now();
                                                                            this.readRate = 1/(0.001*(now - this.lastRead)); //reads per second.
                                                                            this.lastRead = now;

                                                                            if(outputmode.value === 'b') {
                                                                                this.outputText += typeof this.output === 'string' ? `${this.output}\n` : `${JSON.stringify(this.output)}\n`
                                                                            }

                                                                            if(this.anim) requestAnimationFrame(this.anim); //throttles animations to refresh rate
                                                                            //if(this.anim) this.anim();
                                                                            //roughly...
                                                                            //decoderworker.request({route:'decode',args:data},[data]).then((value) => {document.getElementById('console').innerText = `${value}`;} )
                                                                        }

                                                                        (self.querySelector('[id="'+id+'send"]') as HTMLButtonElement).onclick = () => {
                                                                            let value = (self.querySelector('[id="'+id+'input"]') as HTMLButtonElement).value;
                                                                            if(parseInt(value)) {
                                                                                Serial.writeStream(this.stream,WebSerial.toDataView(parseInt(value)));
                                                                            } else Serial.writeStream(this.stream,WebSerial.toDataView((value)));
                                                                        }
                
                                                                        Serial.readStream(this.stream);
                                                                        console.log('reading stream', this.stream);

                                                                        (self.querySelector('[id="'+id+'"]') as HTMLElement).style.display = '';
                
                                                                        const xconnectEvent = (ev) => {
                                                                            Serial.closeStream(this.stream).then(() => {
                                                                                (self.querySelector('[id="'+id+'xconnect"]') as HTMLButtonElement).innerHTML = 'Reconnect';
                                                                                (self.querySelector('[id="'+id+'xconnect"]') as HTMLButtonElement).onclick = (ev) => {
                                                                                    Serial.closeStream(this.stream,()=>{
                                                                                        Serial.getPorts().then((ports) => { //check previously permitted ports for auto reconnect
                                                                                            for(let i = 0; i<ports.length; i++) {
                                                                                                if(ports[i].getInfo().usbVendorId === this.stream.info.usbVendorId && ports[i].getInfo().usbProductId === this.stream.info.usbProductId) {
                                                                                                    let settings = getSettings(ports[i]);
                                                                                                    Serial.openPort(ports[i], settings).then(()=>{
                                                                                                        let debugmessage = `serial port ${ports[i].getInfo().usbVendorId}:${ports[i].getInfo().usbProductId} read:`;
                                                                                                        this.stream = Serial.createStream({
                                                                                                            port:ports[i],
                                                                                                            frequency:1,
                                                                                                            ondata:(data:ArrayBuffer)=>{
                                                                                                                //pass to console
                                                                                                                this.output = decoders[this.decoder](data, debugmessage);
                                                                                                                
                                                                                                                if(outputmode.value === 'b') {
                                                                                                                    this.outputText += `${this.output}\n`
                                                                                                                }
                                                                                                                
                                                                                                                requestAnimationFrame(this.anim); //throttles animations to refresh rate
                                                                                                                //roughly...
                                                                                                                //decoderworker.request({route:'decode',args:data},[data]).then((value) => {document.getElementById('console').innerText = `${value}`;} )
                                                                                                            }
                                                                                                        });
                                                                                                        this.settings = settings;
                                                                                                        self.render(); //re-render, will trigger oncreate again to reset this button and update the template 
                                                                                                    });
                                                                                                    break;
                                                                                                }
                                                                                            }
                                                                                        });
                                                                                    });
                                                                                }
                                                                            });
                                                                        }
                
                                                                        (self.querySelector('[id="'+id+'xconnect"]') as HTMLButtonElement).onclick = xconnectEvent;
                
                                                                        (self.querySelector('[id="'+id+'x"]') as HTMLButtonElement).onclick = () => {
                                                                            Serial.closeStream(this.stream,()=>{
                                                                                
                                                                            }).catch(er=>console.error(er));
                                                                            this.delete();
                                                                            self.querySelector('[id="'+id+'console"]').remove(); //remove the adjacent output console
                                                                        }
                                                                    
                                                                        (self.querySelector('[id="'+id+'decoder"]') as HTMLInputElement).onchange = (ev) => {
                                                                            this.decoder = (self.querySelector('[id="'+id+'decoder"]') as HTMLInputElement).value;
                                                                        }
                                                                        
                                                                    });
                                                                }
                
                                                            }
                
                
                                                            ConnectionTemplate.addElement(`${id}-info`);
                                                            let elm = document.createElement(`${id}-info`);
                                                            //document.getElementById('connections').appendChild(elm);
                                                            
                                                            document.querySelector('device-debugger').querySelector('#connections').appendChild(elm);
                                                        });
                
                                    
                                                            
                                                            }
                                                        },
                                                    
                                                
                                            } as ElementProps,
                                            'serialconfigdropdown':{
                                                tagName:'button',
                                                innerText:'--',
                                                style:{
                                                    float:'right'
                                                },
                                                attributes:{
                                                    onclick:(ev)=>{
                                                        if(ev.target.parentNode.querySelector('#serialconfigcontainer').style.display === 'none') {
                                                            ev.target.parentNode.querySelector('#serialconfigcontainer').style.display = '';
                                                            ev.target.innerText = '--'
                                                        }
                                                        else {
                                                            ev.target.parentNode.querySelector('#serialconfigcontainer').style.display = 'none';
                                                            ev.target.innerText = '++'
                                                        }
                
                                                    }
                                                }
                                            } as ElementProps,
                                            'serialconfig':{ //need labels
                                                tagName:'div',
                                                children:{
                                                    'serialconfigcontainer':{
                                                        tagName:'div',
                                                        children:{
                                                            'baudRateLabel':{
                                                                tagName:'label',
                                                                innerText:'Baud Rate (bps)',
                                                                children:{
                                                                    'baudRate':{
                                                                        tagName:'input',
                                                                        attributes:{
                                                                            type:'number',
                                                                            placeholder:115200,
                                                                            value:115200,
                                                                            min:1, //anything below 9600 is unlikely
                                                                            max:10000000 //10M baud I think is highest web serial supports... might only be 921600
                                                                        }
                                                                    } as ElementProps
                                                                }
                                                            } as ElementProps,
                                                            'ln':{template:'<br/>'},
                                                            'bufferSizeLabel':{
                                                                tagName:'label',
                                                                innerText:'Read/Write buffer size (bytes)',
                                                                children:{
                                                                    'bufferSize':{
                                                                        tagName:'input',
                                                                        attributes:{
                                                                            type:'number',
                                                                            placeholder:255,
                                                                            value:255,
                                                                            min:1,
                                                                            max:10000000 
                                                                        }
                                                                    } as ElementProps,
                                                                }
                                                            } as ElementProps,
                                                            'ln2':{template:'<br/>'},
                                                            'parityLabel':{
                                                                tagName:'label',
                                                                innerText:'Parity',
                                                                children:{
                                                                    'parity':{
                                                                        tagName:'select',
                                                                        children:{
                                                                            'none':{
                                                                                tagName:'option',
                                                                                attributes:{
                                                                                    value:'none',
                                                                                    selected:true,
                                                                                    innerText:'none'
                                                                                }
                                                                            },
                                                                            'even':{
                                                                                tagName:'option',
                                                                                attributes:{
                                                                                    value:'even',
                                                                                    innerText:'even'
                                                                                }
                                                                            },
                                                                            'odd':{
                                                                                tagName:'option',
                                                                                attributes:{
                                                                                    value:'odd',
                                                                                    innerText:'odd'
                                                                                }
                                                                            }
                                                                        }
                                                                    } as ElementProps,
                                                                }
                                                            } as ElementProps,
                                                            'ln3':{template:'<br/>'},
                                                            'dataBitsLabel':{
                                                                tagName:'label',
                                                                innerText:'Data bits (7 or 8)',
                                                                children:{
                                                                    'dataBits':{
                                                                        tagName:'input',
                                                                        attributes:{
                                                                            type:'number',
                                                                            placeholder:8,
                                                                            value:8,
                                                                            min:7, 
                                                                            max:8 
                                                                        }
                                                                    } as ElementProps,
                                                                }
                                                            } as ElementProps,
                                                            'ln4':{template:'<br/>'},
                                                            'stopBitsLabel':{
                                                                tagName:'label',
                                                                innerText:'Stop bits (1 or 2)',
                                                                children:{
                                                                    'stopBits':{
                                                                        tagName:'input',
                                                                        attributes:{
                                                                            type:'number',
                                                                            placeholder:1,
                                                                            value:1,
                                                                            min:1, 
                                                                            max:2 
                                                                        }
                                                                    } as ElementProps,
                                                                }
                                                            } as ElementProps,
                                                            'ln5':{template:'<br/>'},
                                                            'flowControlLabel':{
                                                                tagName:'label',
                                                                innerText:'Flow control (hardware?)',
                                                                children:{
                                                                    'flowControl':{
                                                                        tagName:'select',
                                                                        children:{
                                                                            'none':{
                                                                                tagName:'option',
                                                                                attributes:{
                                                                                    value:'none',
                                                                                    selected:true,
                                                                                    innerText:'none'
                                                                                }
                                                                            },
                                                                            'hardware':{
                                                                                tagName:'option',
                                                                                attributes:{
                                                                                    value:'hardware',
                                                                                    innerText:'hardware'
                                                                                }
                                                                            },
                                                                        }
                                                                    } as ElementProps,
                                                                }
                                                            } as ElementProps,
                                                            'ln6':{template:'<br/>'},
                                                            'usbVendorIdLabel':{
                                                                tagName:'label',
                                                                innerText:'Vendor ID Filter? (hexadecimal)',
                                                                children:{
                                                                    'usbVendorId':{
                                                                        tagName:'input',
                                                                        attributes:{
                                                                            type:'text',
                                                                            placeholder:'0xabcd',
                                                                        }
                                                                    } as ElementProps,
                                                                }
                                                            } as ElementProps,
                                                            'ln7':{template:'<br/>'},
                                                            'usbProductIdLabel':{
                                                                tagName:'label',
                                                                innerText:'Product ID Filter? (hexadecimal)',
                                                                children:{
                                                                    'usbProductId':{
                                                                        tagName:'input',
                                                                        attributes:{
                                                                            type:'text',
                                                                            placeholder:'0xefgh',
                                                                        }
                                                                    } as ElementProps,
                                                                }
                                                            } as ElementProps,
                                                            'ln8':{template:'<br/>'},
                                                            'frequencyLabel':{
                                                                tagName:'label',
                                                                innerText:'Maximum read frequency? (ms)',
                                                                children:{
                                                                    'frequency':{
                                                                        tagName:'input',
                                                                        attributes:{
                                                                            type:'number',
                                                                            placeholder:10,
                                                                            value:10,
                                                                            min:0.001,
                                                                            max:10000000,
                                                                            step:0.001
                                                                        }
                                                                    } as ElementProps
                                                                }
                                                            } as ElementProps
                                                        }
                                                    } as ElementProps
                                                }
                                            } as ElementProps
                                        }
                                    } as ElementProps
                                }
                            } as ElementProps
                        }
                    } as ElementProps,
                    'connections':{
                        tagName:'div',
                        style:{
                            minHeight:'300px',
                            backgroundColor:'black'
                        }
                    } as ElementProps,
                    'customdecoder':{
                        tagName:'div',
                        innerHTML:'Custom Decoder',
                        style:{
                            display:'flex'
                        },
                        children:{
                            'testinput':{
                                tagName:'textarea',
                                attributes:{
                                    value:'[24,52,230,125,243,112,0,0,10,2,30]',
                                    onchange:(ev:Event)=>{
                                        let elm = (ev.target as HTMLInputElement);
                                        let value = (ev.target as HTMLInputElement).value;
                                        if(value.includes(',') && !value.includes('[')) {
                                            value = `[${value}]`;
                                        }
                                        try {
                                            value = JSON.parse(value);   
                                            if(Array.isArray(value)) {
                                                let testfunction = (elm.parentNode.querySelector('#testfunction') as HTMLInputElement).value;
                                                try {
                                                    let fn = (0, eval)(testfunction);
                                                    if(typeof fn === 'function') {
                                                        (elm.parentNode.querySelector('#testoutput') as HTMLElement).innerText = fn(value);
                
                                                    }
                                                } catch (er) {
                                                    (elm.parentNode.querySelector('#testoutput') as HTMLElement).innerText = er;
                                                }
                                            }
                                        } catch(er) {
                                            (elm.parentNode.querySelector('#testoutput') as HTMLElement).innerText = er;
                                        }
                                    }
                                }
                            } as ElementProps,
                            'testfunction':{
                                tagName:'textarea',
                                onrender:(self) => {
                                    
                                },
                                attributes:{
                                    value:`//value is an ArrayBuffer
(value) => {
    return value;
}`,
                                    onchange:(ev:Event) => { //when you click away
                                        let elm = (ev.target as HTMLInputElement);
                                        let value = (ev.target as HTMLInputElement).value;
                                        
                                        try {
                                            let fn = (0, eval)(value);
                                            if(typeof fn === 'function') {
                                                let testvalue = (elm.parentNode.querySelector('#testinput') as HTMLInputElement).value;
                                                if(testvalue.includes(',') && !testvalue.includes('[')) {
                                                    testvalue = `[${testvalue}]`;
                                                }
                                                try {
                                                    testvalue = JSON.parse(testvalue);  
                                                    (elm.parentNode.querySelector('#testoutput') as HTMLElement).innerText = fn(testvalue);
                                                } catch(er) {
                                                    (elm.parentNode.querySelector('#testoutput') as HTMLElement).innerText = er;
                                                } 
                                            }
                                        } catch (er) {
                                            (elm.parentNode.querySelector('#testoutput') as HTMLElement).innerText = er;
                                        }
                                    }
                                }
                            } as ElementProps,
                            'testoutput':{
                                tagName:'div',
                                style:{
                                    minHeight:'50px',
                                    minWidth:'50px',
                                    color:'white',
                                    backgroundColor:'black',
                                    overflowX:'scroll'
                                }
                            } as ElementProps,
                            'testdecoder':{
                                tagName:'button',
                                innerText:'Test',
                                attributes:{
                                    onclick:(ev)=>{
                                        let elm = (ev.target as HTMLInputElement);
                                        let value = (elm.parentNode.querySelector('#testfunction') as HTMLInputElement).value;
                                        try {
                                            let fn = (0, eval)(value);
                                            if(typeof fn === 'function') {
                                                let testvalue = (elm.parentNode.querySelector('#testinput') as HTMLInputElement).value;
                                                if(testvalue.includes(',') && !testvalue.includes('[')) {
                                                    testvalue = `[${testvalue}]`;
                                                }
                                                try {
                                                    testvalue = JSON.parse(testvalue);  
                                                    (elm.parentNode.querySelector('#testoutput') as HTMLElement).innerText = fn(testvalue);
                                                } catch(er) {
                                                    (elm.parentNode.querySelector('#testoutput') as HTMLElement).innerText = er;
                                                } 
                                            }
                                        } catch (er) {
                                            (elm.parentNode.querySelector('#testoutput') as HTMLElement).innerText = er;
                                        }
                                    }
                                }
                            } as ElementProps,
                            // 'suggested':{
                            //     tagName:'div',
                            //     innerHTML:`Recognized chart/csv output format: return {[key:string]:number|number[]} where you are returning an object with key:value pairs for tagged channels and numbers/arrays to be appended`
                            // } as ElementProps,
                            'decodernameLabel':{
                                tagName:'label',
                                innerText:'Name Decoder:',
                                children:{
                                    'decodername':{
                                        tagName:'input',
                                        attributes:{
                                            type:'text',
                                            value:'testdecoder',
                                            placeholder:'mydecoder'
                                        }
                                    }
                                }
                            } as ElementProps,
                            'submitdecoder':{
                                tagName:'button',
                                innerText:'Set',
                                attributes:{
                                    onclick:(ev)=>{
                                        let elm = (ev.target as HTMLInputElement);
                                        let value = (elm.parentNode.querySelector('#testfunction') as HTMLInputElement).value;
                                        try {
                                            let fn = (0, eval)(value);
                                            if(typeof fn === 'function') {
                                                let testvalue = (elm.parentNode.querySelector('#testinput') as HTMLInputElement).value;
                                                if(testvalue.includes(',') && !testvalue.includes('[')) {
                                                    testvalue = `[${testvalue}]`;
                                                }
                                                try {
                                                    testvalue = JSON.parse(testvalue);  
                                                    (elm.parentNode.querySelector('#testoutput') as HTMLElement).innerText = fn(testvalue);
                                                    let name = (elm.parentNode.querySelector('#decodername') as HTMLInputElement).value;
                                                    if(!name) name = 'mydecoder';
                                                    decoders[name] = fn; //set the decoder since it was successful

                                                    let option = `<option value='${name}'>${name}</option>`;
                                                    document.querySelectorAll('select').forEach((e) => {
                                                        if(e.id.includes('decoder')) {
                                                            e.insertAdjacentHTML('beforeend',option);
                                                        } //update existing selectors
                                                    })

                                                } catch(er) {
                                                    (elm.parentNode.querySelector('#testoutput') as HTMLElement).innerText = er;
                                                } 
                                            }
                                        } catch (er) {
                                            (elm.parentNode.querySelector('#testoutput') as HTMLElement).innerText = er;
                                        }
                                    }
                                }
                            } as ElementProps
                        }
                    } as ElementProps
                }
            } as ElementProps
        } 
    } as DOMElementProps
};



const router = new Router([
    workers,
    proxyWorkerRoutes, 
    workerCanvasRoutes,
    new DOMService({routes:domtree})
]);


console.log(router)