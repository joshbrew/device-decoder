
import {WorkerService, ServiceMessage, WorkerInfo} from 'graphscript'////
import {WebSerial} from './serial/serialstream'
import {BiquadChannelFilterer, FilterSettings} from './util/BiquadFilters'
import gsworker from './debugger.worker'

export const workers = new WorkerService(); 

import { WebglLinePlotUtil, WebglLinePlotProps, WebglLinePlotInfo, WebglLineProps } from 'webgl-plot-utils'



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
    }, 
    draw:boolean=true
) => {
    //let parsed = globalThis.WebglLinePlotUtil.formatDataForCharts(lines);
    if(typeof lines === 'object')
    {    
        //console.log(parsed);
        globalThis.plotter.update(plot,lines,draw);
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
    transferFunction(
        worker,
        function getChartSettings(plotId) {
            return globalThis.plotter.getChartSettings(plotId);
        }
    )
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
        function toggleAnim() {
            globalThis.runningAnim = !globalThis.runningAnim;

            return globalThis.runningAnim; //pass along to the animation message port?
        },
        'toggleAnim'
    );
    transferFunction(
        worker,
        function setFilters(
            filters:{
                [key:string]:FilterSettings
            },
            clearFilters=false //clear any other filters not being overwritten
        ) {
            if(!globalThis.filters || clearFilters) globalThis.filters = {};
            for(const key in filters) {
                globalThis.filters[key] = new BiquadChannelFilterer(filters[key]); 
            }
            return true;
        },
        'setFilters'
    );
    transferFunction(
        worker,
        function getFilterSettings() {
            if(globalThis.filters) {
                let filters = {};
                for(const key in globalThis.filters) {
                    filters[key] = {
                        sps:globalThis.filters[key].sps,
                        useScaling:globalThis.filters[key].useScaling,
                        scalar:globalThis.filters[key].scalar,
                        useNotch50:globalThis.filters[key].useNotch50,
                        useNotch60:globalThis.filters[key].useNotch60,
                        useDCBlock:globalThis.filters[key].useDCBlock,
                        useLowpass:globalThis.filters[key].useLowpass,
                        lowpassHz: globalThis.filters[key].lowpassHz,
                        useBandpass: globalThis.filters[key].useBandpass,
                        bandpassLower: globalThis.filters[key].bandpassLower,
                        bandpassUpper: globalThis.filters[key].bandpassUpper
                    }
                }
                return filters;
            }

            return undefined;
        },
        'getFilterSettings'
    )
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
        function openPort(settings:SerialOptions & { usbVendorId:number, usbProductId:number, pipeTo?:string|{route:string, _id:string, extraArgs:any[]}, frequency?:number, buffering?:{searchBytes:Uint8Array} }) {
            
            const WorkerService = this.graph as WorkerService;
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
                                        WorkerService.transmit(value, undefined, [value.buffer] as any);
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
        function closeStream(streamId) {
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
        function writeStream(streamId, message:any) {

            (globalThis.Serial as WebSerial).writeStream(globalThis.Serial.streams[streamId], message);

            return true;
        },
        'writeStream'
    );
    transferFunction(
        worker,
        function updateStreamSettings( streamId:string, settings:any) {
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
    chartworker:WorkerInfo, 
    settings:Partial<WebglLinePlotProps>, //default graph one line
    parentDiv:string|HTMLElement,
    streamworker:WorkerInfo //for setting filers on outputs
) {
    transferChartCommands(chartworker);

    if(!settings._id) {
        settings._id = `chart${Math.floor(Math.random()*1000000000000000)}`;
    }

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
    chart.id = settings._id + 'chartcanvas';

    const overlay = document.createElement('canvas');

    (overlay as any).width = parentDiv.clientWidth ? parentDiv.clientWidth : window.innerWidth;
    (overlay as any).height = parentDiv.clientHeight ? parentDiv.clientHeight : 450;
    overlay.style.width = (parentDiv.clientWidth ? parentDiv.clientWidth : window.innerWidth) + 'px';
    overlay.style.height = (parentDiv.clientHeight ? parentDiv.clientHeight : 450) + 'px';
    overlay.style.transform = `translateY(-${overlay.height}px)`;
    overlay.id = settings._id + 'chartoverlay'

    const controls = document.createElement('div');
    controls.id = settings._id + 'controls';
    controls.className = 'chartcontrols'
    controls.innerHTML = `
        <div>
            Chart Controls:<br>
            Time Window (s): <input type='number' value='10' placeholder='10' id='${settings._id}window'>
            <button id='${settings._id}setchartsettings'>Update Chart Settings</button>
        </div>
        <div>
            Signal Controls:
            <table id='${settings._id}signals'></table>
        </div>
    `;

    
    (controls as any).width = parentDiv.clientWidth ? parentDiv.clientWidth : window.innerWidth;
    (controls as any).height = parentDiv.clientHeight ? parentDiv.clientHeight : 450;
    controls.style.width = (parentDiv.clientWidth ? parentDiv.clientWidth : window.innerWidth) + 'px';
    controls.style.height = (parentDiv.clientHeight ? parentDiv.clientHeight : 450) + 'px';
    controls.style.transform = `translateY(-${(parentDiv.clientHeight? parentDiv.clientHeight : 450)*2}px)`;
    controls.style.display = 'none';

    overlay.onmouseover = () => {
        chartworker.run('getChartSettings', settings._id).then((chartsettings:Partial<WebglLinePlotProps>) => {
            streamworker.run('getFilterSettings').then((filters) => {
                //console.log(filters);
                controls.style.display = '';
                setSignalControls(settings._id, chartsettings, filters, streamworker, chartworker);
                (document.getElementById(settings._id+'window') as any).oninput = (ev) => {
                    for(const line in chartsettings.lines) {
                        let nSec = document.getElementById(settings._id+line+'nSec') as HTMLInputElement;
                        nSec.value = (ev.target as HTMLInputElement).value;
                    }
                }

                (document.getElementById(settings._id + 'setchartsettings') as any).onclick = () => {
                    let linesettings = {};
                    for(const line in chartsettings.lines) {
                        let sps = document.getElementById(settings._id+line+'sps') as HTMLInputElement;
                        let nSec = document.getElementById(settings._id+line+'nSec') as HTMLInputElement;
                        linesettings[line] = { 
                            sps:parseFloat(sps.value) ? parseFloat(sps.value) : 100,
                            nSec:parseFloat(nSec.value) ? parseFloat(nSec.value) : 10
                        };
                    }
                    chartsettings.lines = linesettings;
                    console.log(linesettings);
                    chartworker.run('resetChart', [settings._id,chartsettings]);
                }
            });
        });
    }

    controls.onmouseleave = () => { controls.style.display = 'none'; }

    plotDiv.appendChild(chart);
    plotDiv.appendChild(overlay);
    plotDiv.appendChild(controls);

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


    let request = chartworker.request({
        route:'setupChart',
        args:updated
    }, [offscreenchart, offscreenoverlay]);
    
    //}, 100)

    return {
        request,
        chart,
        overlay,
        controls,
        plotDiv,
        parentDiv
    };


}

export function setSignalControls(
    plotId:string,
    chartSettings:Partial<WebglLinePlotProps>,
    filterSettings:FilterSettings, 
    streamworker:WorkerInfo,
    chartworker:WorkerInfo
) {
    let controls = document.getElementById(plotId + 'signals');
    if(!controls) return false;

    if(chartSettings?.lines) {
        //console.log(chartSettings);
        let body = ``;

        let viewingall = true;
        let scalingall = true;
        let n50all = true;
        let n60all = true;
        let dcall = true;
        let lpall = true;
        let bpall = true;

        for(const prop in chartSettings.lines) {
            let line = chartSettings.lines[prop] as WebglLineProps
            body += `
            <tr>
                <td id='${plotId}${prop}name'><input id='${plotId}${prop}viewing' type='checkbox' ${(line.viewing) ? 'checked' : ''}>${prop}</td>
                <td><input id='${plotId}${prop}sps' type='number' step='1' value='${line.sps ? line.sps : 100}'></td>
                <td><input id='${plotId}${prop}nSec' type='number' step='1' value='${line.nSec ? line.nSec : (line.nPoints ? Math.floor(line.nPoints/(line.sps ? line.sps : 100)) : 10)}'></td>
                <td><input id='${plotId}${prop}scalar'  type='number' value='${filterSettings[prop]?.scalar ? filterSettings[prop].scalar : 1}'><input id='${plotId}${prop}useScaling' type='checkbox' ${filterSettings[prop]?.useScaling ? 'checked' : ''}></td>
                <td><input id='${plotId}${prop}units' type='text' value='${line.units ? line.units : ''}'></td>
                <td><input id='${plotId}${prop}ymin' type='number' value='${line.ymin ? line.ymin : '0'}'></td>
                <td><input id='${plotId}${prop}ymax' type='number' value='${line.ymax ? line.ymax : '1'}'></td>
                <td><input id='${plotId}${prop}useNotch50' type='checkbox' ${filterSettings[prop]?.useNotch50 ? 'checked' : ''}></td>
                <td><input id='${plotId}${prop}useNotch60' type='checkbox' ${filterSettings[prop]?.useNotch60 ? 'checked' : ''}></td>
                <td><input id='${plotId}${prop}useDCBlock' type='checkbox' ${filterSettings[prop]?.useDCBlock ? 'checked' : ''}></td>
                <td><input id='${plotId}${prop}lowpassHz'  type='number' value='${filterSettings[prop]?.lowpassHz ? filterSettings[prop].lowpassHz : 100}'>Hz<input id='${plotId}${prop}useLowpass' type='checkbox' ${filterSettings[prop]?.useLowpass ? 'checked' : ''}></td>
                <td><input id='${plotId}${prop}bandpassLower'  type='number' value='${filterSettings[prop]?.bandpassLower ? filterSettings[prop].bandpassLower : 3}'>Hz to <input id='${plotId}${prop}bandpassUpper'  type='number' value='${filterSettings[prop]?.bandpassUpper ? filterSettings[prop].bandpassUpper : 45}'>Hz<input id='${plotId}${prop}useBandpass' type='checkbox' ${filterSettings[prop]?.useBandpass ? 'checked' : ''}></td>
            </tr>`

            if(!line.viewing) viewingall = false;
            if(!filterSettings[prop]?.useScaling) scalingall = false;
            if(!filterSettings[prop]?.useNotch50) n50all = false;
            if(!filterSettings[prop]?.useNotch60) n60all = false;
            if(!filterSettings[prop]?.useDCBlock) dcall = false;
            if(!filterSettings[prop]?.useLowpass) lpall = false;
            if(!filterSettings[prop]?.useBandpass) bpall = false;

        }
        
        let head = `
        <tr>
            <th>Name <input type='checkbox' id='${plotId}viewing' ${viewingall ? 'checked' : ''}></th>
            <th>SPS</th>
            <th>Plot nSec</th>
            <th>Scalar <input type='checkbox' id='${plotId}useScaling' ${scalingall ? 'checked' : ''}></th>
            <th>Units</th>
            <th>Lower Bound</th>
            <th>Upper Bound</th>
            <th>50Hz Notch <input type='checkbox' id='${plotId}useNotch50' ${n50all ? 'checked' : ''}></th>
            <th>60Hz Notch <input type='checkbox' id='${plotId}useNotch60' ${n60all ? 'checked' : ''}></th>
            <th>DC Block <input type='checkbox' id='${plotId}useDCBlock' ${dcall ? 'checked' : ''}></th>
            <th>Lowpass <input type='checkbox' id='${plotId}useLowpass' ${lpall ? 'checked' : ''}></th>
            <th>Bandpass <input type='checkbox' id='${plotId}useBandpass' ${bpall ? 'checked' : ''}></th>
        </tr>
        `;


        controls.innerHTML = head + body;

        //apply to all
        let viewall = document.getElementById(plotId+'viewing') as HTMLInputElement;
        let usescalar = document.getElementById(plotId+'useScaling') as HTMLInputElement;
        let usen50 = document.getElementById(plotId+'useNotch50') as HTMLInputElement;
        let usen60 = document.getElementById(plotId+'useNotch60') as HTMLInputElement;
        let usedcb = document.getElementById(plotId+'useDCBlock') as HTMLInputElement;
        let uselp = document.getElementById(plotId+'useLowpass') as HTMLInputElement;
        let usebp = document.getElementById(plotId+'useBandpass') as HTMLInputElement;

        let headeronchange = (checked, idsuffix) => {
            for(const prop in chartSettings.lines) {
                let elm = document.getElementById(plotId+prop+idsuffix) as HTMLInputElement;
                if(elm?.checked !== checked) elm.click(); //trigger its onchange to set reset the filter
            }
        }

        viewall.onchange = (ev) => {
            headeronchange((ev.target as HTMLInputElement).checked,'viewing')
        }
        usescalar.onchange = (ev) => {
            headeronchange((ev.target as HTMLInputElement).checked,'useScaling')
        }
        usen50.onchange = (ev) => {
            headeronchange((ev.target as HTMLInputElement).checked,'useNotch50')
        }
        usen60.onchange = (ev) => {
            headeronchange((ev.target as HTMLInputElement).checked,'useNotch60')
        }
        usedcb.onchange = (ev) => {
            headeronchange((ev.target as HTMLInputElement).checked,'useDCBlock')
        }
        uselp.onchange = (ev) => {
            headeronchange((ev.target as HTMLInputElement).checked,'useLowpass')
        }
        usebp.onchange = (ev) => {
            headeronchange((ev.target as HTMLInputElement).checked,'useBandpass')
        }

        for(const prop in chartSettings.lines) {
            let viewing = document.getElementById(plotId+prop+'viewing') as HTMLInputElement;
            let sps = document.getElementById(plotId+prop+'sps') as HTMLInputElement;
            let nSec = document.getElementById(plotId+prop+'nSec') as HTMLInputElement;
            let useScaling = document.getElementById(plotId+prop+'useScaling') as HTMLInputElement;
            let scalar = document.getElementById(plotId+prop+'scalar') as HTMLInputElement;
            let units = document.getElementById(plotId+prop+'units') as HTMLInputElement;
            let ymin = document.getElementById(plotId+prop+'ymin') as HTMLInputElement;
            let ymax = document.getElementById(plotId+prop+'ymax') as HTMLInputElement;
            let useNotch50 = document.getElementById(plotId+prop+'useNotch50') as HTMLInputElement;
            let useNotch60 = document.getElementById(plotId+prop+'useNotch60') as HTMLInputElement;
            let useDCBlock = document.getElementById(plotId+prop+'useDCBlock') as HTMLInputElement;
            let useLowpass = document.getElementById(plotId+prop+'useLowpass') as HTMLInputElement;
            let lowpassHz = document.getElementById(plotId+prop+'lowpassHz') as HTMLInputElement;
            let useBandpass = document.getElementById(plotId+prop+'useBandpass') as HTMLInputElement;
            let bandpassLower = document.getElementById(plotId+prop+'bandpassLower') as HTMLInputElement;
            let bandpassUpper = document.getElementById(plotId+prop+'bandpassUpper') as HTMLInputElement;



            viewing.onchange = () => {

                if((!Array.isArray(chartSettings.lines?.[prop] as WebglLineProps))) {

                    (chartSettings.lines?.[prop] as WebglLineProps).viewing = viewing.checked;
                    (chartSettings as WebglLinePlotProps).generateNewLines = false; //make sure the lines don't regenerate automatically
                    chartworker.run('resetChart', [plotId,chartSettings]);

                }
            }
            

            let filteronchange = () => {

                let setting = {
                    [prop]:{
                        sps: sps.value ? parseFloat(sps.value) : 100,
                        useScaling:useScaling.checked,
                        scalar: scalar.value ? parseFloat(scalar.value) : 1,
                        useNotch50:useNotch50.checked,
                        useNotch60:useNotch60.checked,
                        useDCBlock:useDCBlock.checked,
                        useLowpass:useLowpass.checked,
                        lowpassHz:  lowpassHz.value ? parseFloat(lowpassHz.value) : 100,
                        useBandpass: useBandpass.checked,
                        bandpassLower:  bandpassLower.value ? parseFloat(bandpassLower.value) : 3,
                        bandpassUpper:  bandpassUpper.value ? parseFloat(bandpassUpper.value) : 45
                    } as FilterSettings
                }

                streamworker.post('setFilters', setting); //replace current filter for this line
            }

            sps.onchange = () => {
                filteronchange();
            }

            units.onchange = () => {
                if((!Array.isArray(chartSettings.lines?.[prop] as WebglLineProps))) {
                    (chartSettings.lines?.[prop] as WebglLineProps).units = units.value;
                    chartworker.run('resetChart', [plotId,chartSettings]);
                }
            }
            ymax.onchange = () => {
                if((!Array.isArray(chartSettings.lines?.[prop] as WebglLineProps))) {
                    (chartSettings.lines?.[prop] as WebglLineProps).ymax = ymax.value ? parseFloat(ymax.value) : 1;
                    (chartSettings.lines?.[prop] as WebglLineProps).ymin = ymin.value ? parseFloat(ymin.value) : 0;
                    chartworker.run('resetChart', [plotId,chartSettings]);
                }
            }
            ymin.onchange = () => {
                if((!Array.isArray(chartSettings.lines?.[prop] as WebglLineProps))) {
                    (chartSettings.lines?.[prop] as WebglLineProps).ymax = ymax.value ? parseFloat(ymax.value) : 1;
                    (chartSettings.lines?.[prop] as WebglLineProps).ymin = ymin.value ? parseFloat(ymin.value) : 0;
                    chartworker.run('resetChart', [plotId,chartSettings]);
                }
            }

            useScaling.onchange = filteronchange;
            useNotch50.onchange = filteronchange;
            useNotch60.onchange = filteronchange;
            useDCBlock.onchange = filteronchange;
            useLowpass.onchange = filteronchange;
            useBandpass.onchange = filteronchange;
            lowpassHz.onchange = filteronchange;
            scalar.onchange = filteronchange;
            bandpassLower.onchange = filteronchange;
            bandpassUpper.onchange = filteronchange;

            nSec.onchange = sps.onchange;
        }
    }
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
        function decodeAndPassToChart(data:any, chartPortId:string) {
            let decoded = this.graph.run('decode',data);
            if(decoded) {
                let parsed = globalThis.WebglLinePlotUtil.formatDataForCharts(decoded);
                if(!parsed) return decoded;
                if(Object.keys(parsed).length === 0) return decoded;
            
                if(parsed) {
                    if(globalThis.filtering) {
                        for(const prop in parsed) {
                            if(globalThis.filters[prop]) { //apply biquad filters
                                let filter = globalThis.filters[prop] as BiquadChannelFilterer;
                                if(Array.isArray(parsed[prop])) {
                                    parsed[prop] = parsed[prop].map((v:number) => filter.apply(v));
                                } else if (parsed[prop]?.values) {
                                    parsed[prop].values = parsed[prop].values.map((v:number) => filter.apply(v));
                                }
                            }
                        }
                    }

                    //console.log('parsed', parsed);
            
                    if(globalThis.runningAnim) {
                        this.graph.workers[chartPortId].send(
                            {
                                route:'updateChartData',
                                args:[chartPortId,parsed]
                            }//,
                            //chartPortId
                        );
                    }

                    return parsed;
                }
            }
            //console.log(decoded, this.graph)
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
        chartParent,
        streamworker
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
//             function setupSerial() {
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
