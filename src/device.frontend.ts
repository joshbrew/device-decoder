
import { 
    WorkerInfo, 
    WorkerService, 
    WorkerRoute, 
    remoteGraphRoutes,
    workerCanvasRoutes
} from 'graphscript-workers';////"../../graphscript/index"

import gsworker from './stream.worker'

//import { ArrayManip } from './arraymanip';
import { BLEClient, BLEDeviceOptions, BLEDeviceInfo } from './ble/ble_client';
import { WebSerial } from './serial/serialstream';
import { Devices } from './devices';


import { TimeoutOptions } from '@capacitor-community/bluetooth-le/dist/plugin';
import { filterPresets, chartSettings, decoders } from './devices/index';
import { FilterSettings } from './util/BiquadFilters';
import { streamWorkerRoutes } from './stream.routes';

export * from './devices/index'
export * from './stream.routes'

export function isMobile() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||(window as any).opera);
    return check;
};

export const BLE = new BLEClient();
export const workers = new WorkerService({
    roots:{
        ...workerCanvasRoutes,
        ...remoteGraphRoutes, //allows dynamic route loading
    }
}); 

//use these if making your own worker
export { streamWorkerRoutes } 

export { Devices, gsworker, filterPresets, chartSettings, decoders, FilterSettings }

export type InitDeviceOptions = { //you can update ondecoded and ondisconnect at any time
    devices?:{
        [key:string]:{
            [key:string]:any
        }
    },
    
    //this function is required
    ondecoded:((data:any) => void)|{[key:string]:(data:any)=>void}, //a single ondata function or an object with keys corresponding to BLE characteristics
    onconnect?:((device:any) => void),
    beforedisconnect?:((device:any) => void),
    ondisconnect?:((device:any) => void),
    ondata?:((data:DataView) => void), //get direct results, bypass workers (except for serial which is thread-native)
    filterSettings?:{[key:string]:FilterSettings},
    reconnect?:boolean, //this is for the USB codec but you MUST provide the usbProductId and usbVendorId in settings. For BLE it will attempt to reconnect if you provide a deviceId in settings
    roots?:{ //use secondary workers to run processes and report results back to the main thread or other
        [key:string]:WorkerRoute
    },
    workerUrl?:any,
    service?:WorkerService //can load up our own worker service, the library provides a default service
}

export type CustomDeviceStream = {
    workers:{
        streamworker:WorkerInfo
    },
    device:any,
    options:InitDeviceOptions,
    disconnect:()=>void,
    read:(command?:any)=>any,
    write:(command?:any)=>any,
    //FYI only works on time series data and on devices with a set sample rate:
    setFilters:(filterSettings:{[key:string]:FilterSettings}, clearFilters?:boolean) => Promise<true>,
    roots:{[key:string]:WorkerRoute}
};

export type SerialDeviceStream = {
    workers:{
        serialworker:WorkerInfo,
        streamworker:WorkerInfo
    },
    options:InitDeviceOptions,
    device:{
        _id:string,
        settings:any,
        info:Partial<SerialPortInfo>
    },
    subscribeStream:(ondata:(data:any) => void) => Promise<any>,
    unsubscribeStream:(sub:number|undefined) => Promise<any>,
    //FYI only works on time series data and on devices with a set sample rate:
    setFilters:(filterSettings:{[key:string]:FilterSettings}, clearFilters?:boolean) => Promise<true>,
    disconnect:()=>void,
    read:()=>Promise<any>,
    write:(command:string | number | DataView | ArrayBufferLike | number[],chunkSize?:number)=>Promise<boolean>,
    roots:{[key:string]:WorkerRoute}
};
    

export type BLEDeviceStream = {
    workers:{
        streamworker:WorkerInfo
    },
    options:InitDeviceOptions,
    device:BLEDeviceInfo,
    subscribe:(service, notifyCharacteristic, ondata?, bypassWorker?) => Promise<void>,
    unsubscribe:(service, notifyCharacteristic) => Promise<void>,
    //FYI only works on time series data and on devices with a set sample rate:
    setFilters:(filterSettings:{[key:string]:FilterSettings}, clearFilters?:boolean) => Promise<true>,
    disconnect:()=>void,
    read:(command:{ service:string, characteristic:string, ondata?:(data:DataView)=>void, timeout?:TimeoutOptions }) => Promise<DataView>,
    write:(command:{ service:string, characteristic:string, data?:string|number|ArrayBufferLike|DataView|number[], callback?:()=>void, chunkSize?:number, timeout?:TimeoutOptions})=>Promise<void>,
    roots:{[key:string]:WorkerRoute}
};


//create streaming threads
export function initDevice(
    settings:any,
    options:{ //you can update ondecoded and ondisconnect at any time
        devices?:{
            [key:string]:{
                [key:string]:any
            }
        },
        
        //this function is required
        ondecoded:((data:any) => void)|{[key:string]:(data:any)=>void}, //a single ondata function or an object with keys corresponding to BLE characteristics
        onconnect?:((device:any) => void),
        beforedisconnect?:((device:any) => void),
        ondisconnect?:((device:any) => void),
        ondata?:((data:DataView) => void), //get direct results, bypass workers (except for serial which is thread-native)
        filterSettings?:{[key:string]:FilterSettings},
        reconnect?:boolean, //this is for the USB codec but you MUST provide the usbProductId and usbVendorId in settings. For BLE it will attempt to reconnect if you provide a deviceId in settings
        roots?:{ //use secondary workers to run processes and report results back to the main thread or other
            [key:string]:WorkerRoute
        },
        workerUrl?:any,
        service?:WorkerService //can load up our own worker service, the library provides a default service
    }
):Promise<BLEDeviceStream|SerialDeviceStream|CustomDeviceStream> {
    if(!settings) return undefined;

    if(!options) options = { 
        ondecoded:(data) => { console.log(data); } 
    };

    let deviceType = settings.deviceType;
    let deviceName = settings.deviceName;

    if(!options.workerUrl) options.workerUrl = gsworker;
    if(!options.service) options.service = workers;

    let streamworker = options.service.addWorker({url:options.workerUrl});

    if(!options.devices) options.devices = Devices;
    if(!options.devices[deviceType][deviceName]) {
        let cpy = Object.assign({},settings);
        for(const key in cpy) {
            if(typeof cpy[key] === 'function') cpy[key] = cpy[key].toString();
        }
        streamworker.post('receiveDevice', cpy);
    }

    if(options.filterSettings) {
        streamworker.post('setFilters',[options.filterSettings]);
    }

    if(options.roots) {
        for(const key in options.roots) {
            let __parent = {
                callback:'decodeAndParseDevice',
                worker:streamworker
            };
            (options.roots[key] as any).__parent = (options.roots[key] as any).__parent ? Object.assign((options.roots[key] as any).__parent, __parent) : __parent;
        }
        options.service.load(options.roots);
    }

    if(deviceType.includes('CUSTOM')) {

        return new Promise (async (res,rej) => {

            settings.ondata = (data:any) => {
                //console.log(data);
                if(options.ondata) options.ondata(data);
                if(typeof options.ondecoded === 'function') streamworker.run('decodeAndParseDevice',[data,deviceType,deviceName]).then((result)=>{
                    (options as any).ondecoded(result);
                });
            };

            settings.ondisconnect = () => { //set the ondisconnect command for the CUSTOM device spec
                options.service.terminate(streamworker._id as string);
                if(options.roots) {
                    for(const key in options.roots) {
                        options.service.remove(key);
                    }
                }
            }

            //console.log(settings);

            let init = await settings.connect(settings);
            
            //console.log(init);
            
            let info = {
                workers: {
                    streamworker
                },
                disconnect:() => { 
                    if(options.beforedisconnect) options.beforedisconnect(info);
                    settings.disconnect(init); 
                    if(options.ondisconnect) options.ondisconnect(info); 
                    if(options.roots) {
                        for(const key in options.roots) {
                            options.service.remove(key);
                        }
                    }
                },
                device:init,
                options,
                read:(command?:any) => {
                    if(settings.read) return new Promise((res,rej) => {res(settings.read(settings,command))});    
                },
                write:(command?:any) => {
                    if(settings.write) return  new Promise((res,rej) => {res(settings.write(settings,command))});
                },
                setFilters:(filterSettings:{[key:string]:FilterSettings}, clearFilters?:boolean) => {
                    return streamworker.run('setFilters', [filterSettings, clearFilters]);
                },
                roots:options.roots
            }   
            if(options.onconnect) options.onconnect(info);
            res(info);
        }).catch((er)=>{
            console.error(er);
            options.service.terminate(streamworker._id);
            if(options.roots) {
                for(const key in options.roots) {
                    options.service.remove(key);
                }
            }
        }) as Promise<CustomDeviceStream>;

    } else if(deviceType === 'BLE') {
        //ble
        //if single ondecoded function provided, apply to the first characteristic with notify:true else specified
        for(let primaryUUID in (settings as BLEDeviceOptions).services) {
            if((settings as BLEDeviceOptions).services[primaryUUID].UUID) primaryUUID = (settings as BLEDeviceOptions).services[primaryUUID].UUID as any;
            //console.log(primaryUUID)
            for(let characteristic in (settings as any).services[primaryUUID]) {
                let tag = characteristic;
                if((settings as any).services[primaryUUID][characteristic].characteristic) characteristic = (settings as any).services[primaryUUID][characteristic].characteristic;
                if(typeof options.ondecoded === 'function') {
                    if((settings as BLEDeviceOptions).services?.[primaryUUID]?.[tag]?.notify) {
                        if(!(settings as any).services[primaryUUID][tag].notifyCallback) (settings as any).services[primaryUUID][tag].notifyCallback = (data:DataView) => {
                            if(options.ondata) options.ondata(data);
                            (streamworker as WorkerInfo).run('decodeAndParseDevice',[data,deviceType,deviceName,primaryUUID,tag],undefined,[data.buffer]).then(options.ondecoded as any);
                        }
                        break; //only subscribe to first notification in our list if only one ondecoded function provided
                    }
                } else if(typeof options.ondecoded === 'object') {
                    let ref = options.ondecoded[characteristic] ? options.ondecoded[characteristic] : options.ondecoded[tag] ? options.ondecoded[tag] : null;
                    if(ref) {
                        if(options.ondecoded[characteristic]) {
                            if((settings as BLEDeviceOptions).services?.[primaryUUID]?.[tag]?.notify) {
                                if(!(settings as any).services[primaryUUID][tag].notifyCallback) (settings as any).services[primaryUUID][tag].notifyCallback = (data:DataView) => {
                                    if(options.ondata) options.ondata(data);
                                    streamworker.run('decodeAndParseDevice',[data,deviceType,deviceName,primaryUUID,tag],undefined,[data.buffer]).then(ref);
                                }
                            } 
                            if ((settings as BLEDeviceOptions).services?.[primaryUUID]?.[tag]?.read) {
                                if(!(settings as any).services[primaryUUID][tag].readCallback) (settings as any).services[tag].readCallback = (data:DataView) => {
                                    if(options.ondata) options.ondata(data);
                                    streamworker.run('decodeAndParseDevice',[data,deviceType,deviceName,primaryUUID,tag],undefined,[data.buffer]).then(ref);
                                }
                            }
                        }
                    }
                } 
                else if (options.ondata) {
                    if ((settings as BLEDeviceOptions).services?.[primaryUUID]?.[tag]?.notify) (settings as any).services[primaryUUID][tag].notifyCallback = options.ondata;
                    if ((settings as BLEDeviceOptions).services?.[primaryUUID]?.[tag]?.read) (settings as any).services[tag].readCallback = options.ondata;
                }
            }
        }

        return (new Promise((res,rej) => {
            BLE.setup(settings as BLEDeviceOptions).then((result) => {
                let info = {
                    workers:{
                        streamworker
                    },
                    options,
                    device:result,
                    subscribe:(service, notifyCharacteristic, ondata?, bypassWorker?) => {
                        return BLE.subscribe(result.device, service, notifyCharacteristic, 
                            (data:DataView) => {
                                if(bypassWorker) {
                                    if(ondata) ondata(data);
                                    else if (options.ondecoded?.[notifyCharacteristic]) options.ondecoded[notifyCharacteristic](data);
                                    else if(typeof options.ondecoded === 'function') options.ondecoded(data);
                                }
                                else {
                                    (streamworker as WorkerInfo).run('decodeAndParseDevice',[data,deviceType,deviceName,service,notifyCharacteristic],undefined,[data.buffer]).then(
                                        ondata ? ondata : options.ondecoded?.[notifyCharacteristic] ? options.ondecoded[notifyCharacteristic] : options.ondecoded
                                    );
                                }
                            }
                        );
                    },
                    unsubscribe:(service, notifyCharacteristic) => {
                        return BLE.unsubscribe(result.device, service, notifyCharacteristic);
                    },
                    disconnect:async () => { 
                        await BLE.disconnect(result.deviceId as string);  
                        if(options.ondisconnect) options.ondisconnect(info); 
                        streamworker.terminate();
                        if(options.roots) {
                            for(const key in options.roots) {
                                options.service.remove(key);
                            }
                        }
                    },
                    read:(command:{ service:string, characteristic:string, ondata?:(data:DataView)=>void, timeout?:TimeoutOptions }) => { return BLE.read(result.device, command.service, command.characteristic, command.ondata, command.timeout) },
                    write:(command:{ service:string, characteristic:string, data?:string|number|ArrayBufferLike|DataView|number[], callback?:()=>void, chunkSize?:number, chunkDelay?:number, timeout?:TimeoutOptions}) => { return BLE.write(result.device, command.service, command.characteristic, command.data, command.callback, command.chunkSize, command.chunkDelay, command.timeout) },
                    setFilters:(filterSettings:{[key:string]:FilterSettings}, clearFilters?:boolean) => {
                        return streamworker.run('setFilters', [filterSettings, clearFilters]);
                    },
                    roots:options.roots
                }
                if(options.onconnect) options.onconnect(info);
                res(info as any);
            }).catch((er)=>{
                console.error(er);
                streamworker.terminate();
                if(options.roots) {
                    //console.log(options.roots);
                    for(const key in options.roots) {
                        options.service.remove(key);
                        //console.log('removing', key);
                    }
                }
                rej(er);
            });
        }) as Promise<BLEDeviceStream>)
        
    } else if (deviceType === 'USB') {
        //serial
        let serialworker = options.service.addWorker({url:options.workerUrl});

        serialworker.worker.addEventListener('message',(ev:any) => {
            //console.log(ev.data);
            if(typeof ev.data === 'string') {
                if(ev.data.includes('disconnected')) {
                    options.service.terminate(serialworker._id as string);
                    options.service.terminate(streamworker._id);
                    if(options.roots) {
                        for(const key in options.roots) {
                            //console.log('removing route', options.roots[key])
                            options.service.remove(key);
                        }
                    }
                }
            } else if(typeof options.ondata === 'function') options.ondata(ev.data);
        });

        serialworker.post('setupSerial');

        let portId = options.service.establishMessageChannel(streamworker.worker,serialworker.worker);

        const WS = new WebSerial();

        return new Promise((res,rej) => {


            let onerror = (er) => {
                console.error(er);
                options.service.terminate(serialworker._id as string);
                options.service.terminate(streamworker._id);
                if(options.roots) {
                    for(const key in options.roots) {
                        options.service.remove(key);
                        //console.log('removing route', options.roots[key])
                    }
                }
                rej(er);
            }

            let withPort = (port?) => {
                let info;
                if(port) info = port.getInfo();
                else info = { usbVendorId:settings.usbVendorId, usbProductId:settings.usbProductId };

                (serialworker.run('openPort', {
                    baudRate:settings.baudRate,
                    usbVendorId:info.usbVendorId,
                    usbProductId:info.usbProductId,
                    bufferSize:settings.bufferSize,
                    buffering:settings.buffering ? settings.buffering : undefined,
                    frequency:settings.frequency ? settings.frequency : undefined,
                    pipeTo:{
                        route:'decodeAndParseDevice',
                        _id:portId, //direct message port access to skip the main thread
                        extraArgs:[deviceType,deviceName]
                    },
                    pipeMain:options.ondata !== undefined
                }) as Promise<{
                    _id:string,
                    settings:any,
                    info:Partial<SerialPortInfo>
                }>).then((result) => {
                    if(settings.write) serialworker.post('writeStream', [result._id,settings.write]);

                    if(typeof options.ondecoded === 'function') 
                        streamworker.subscribe('decodeAndParseDevice', (data:any) => { if(options.ondecoded) (options.ondecoded as Function)(data); });

                    
                    let info = {
                        workers:{
                            streamworker,
                            serialworker
                        },
                        device:result,
                        options,
                        subscribeStream:(ondata:(data:any) => void) => {
                            return streamworker.subscribe('decodeAndParseDevice', ondata);
                        },
                        unsubscribeStream:(sub:number|undefined) => {
                            return streamworker.unsubscribe('decodeAndParseDevice', sub);
                        },
                        disconnect:() => {
                            serialworker.post('closeStream',result._id); 
                            if(options.ondisconnect) options.ondisconnect(info); 
                        },
                        read:() => { return new Promise((res,rej) => { let sub; sub = streamworker.subscribe('decodeAndParseDevice',(result)=>{ serialworker.unsubscribe('decodeAndParseDevice',sub); res(result); });}); }, //we are already reading, just return the latest result from decodeAndParseDevice
                        write:(message:string | number | DataView | ArrayBufferLike | number[],chunkSize?:number) => {return serialworker.run('writeStream', [result._id,message,chunkSize])},
                        setFilters:(filterSettings:{[key:string]:FilterSettings}, clearFilters?:boolean) => {
                            return streamworker.run('setFilters', [filterSettings, clearFilters]);
                        },
                        roots:options.roots
                    };
                    if(options.onconnect) options.onconnect(info);
                    res(info);
                }).catch(onerror);
            }

            if(options.reconnect) { //requires settings.usbVendorId and settings.usbProductId and a previous permission check on connection
                withPort();
            } else {
                WS.requestPort(settings.usbVendorId, settings.usbProductId).then((port) => {
                    withPort(port);
                }).catch(onerror);
            }
            
        }) as Promise<SerialDeviceStream>
        
    }
    else return undefined;
}




export function createStreamPipeline(
    dedicatedSerialWorker=false,
    dedicatedRenderWorker=false, 
    renderer?:{
        canvas:HTMLCanvasElement,
        context:string,
        _id?:string,
        draw?:string|((
            self, canvas, context
        ) => {}),
        init?:string|((
            self, canvas, context
        ) => {}),
        clear?:string|((
            self, canvas, context
        ) => {}),
        animating?:boolean //can manually make draw calls if you post 'drawFrame' with the animation _id
    },
    workerUrl?:any
) {

    if(!workerUrl) workerUrl = gsworker;
    let streamworker = workers.addWorker({url:workerUrl}) as WorkerInfo;
    let renderworker,renderPort;
    let serialworker, decoderPort;
    
    
    if(dedicatedSerialWorker) {
        serialworker = workers.addWorker({url:workerUrl}) as WorkerInfo;
        
        decoderPort = workers.establishMessageChannel(serialworker.worker, streamworker.worker); //returns the id of the port so we can orchestrate port communication
    
        serialworker.post('setupSerial');
    }   

    //transferChartCommands(renderworker);

    if(dedicatedRenderWorker) {
        renderworker = workers.addWorker({url:workerUrl}) as WorkerInfo;
        renderPort = workers.establishMessageChannel(streamworker.worker, renderworker.worker); //returns the id of the port so we can orchestrate port communication
    
        if(renderer) {
            workers.run('transferCanvas',renderworker.worker,renderer);

            //workers.run('startAnim');
            workers.transferFunction(
                renderworker,
                function receiveParsedData(parsed) {
                    this.run('runUpdate',undefined,parsed);
                    //this.run('drawFrame');
                },
                'receiveParsedData'
            )

            renderworker.post('subscribeToWorker',['decodeAndParseDevice',renderPort,'receiveParsedData']);
        }
    }

    //for BLE we need to pass the output to the stream worker and run decode,
    //for serial we need to tell the serial port/decoder worker to do that instead of the main thread,
    // and proxy the serial port controls

    let result:any = {
        streamworker,
    };
    if(serialworker) {
        result.serialworker = serialworker;
        result.decoderPort = decoderPort; //serial --> stream worker message port
    }
    if(renderworker) {
        result.renderworker = renderworker;
        result.renderPort = renderPort;
    }

    return result;
}


/*

initDevice(
    'BLE',
    'hegduino',
    {
        ondecoded:(data:any)=>{console.log('hegduino', data);},
        subprocesses:{
            hr: {
                init:'createAlgorithmContext',
                initArgs:[
                    'heartrate', //preprogrammed algorithm
                    {
                        sps:Devices['BLE']['hegduino'].sps
                    }
                ],
                route:'runAlgorithm', //the init function will set the _id as an additional argument for runAlgorithm which selects existing contexts by _id 
                callback:(heartbeat)=>{
                    console.log('heartrate result', heartbeat); //this algorithm only returns when it detects a beat
                }
            },
            breath:{
                init:'createAlgorithmContext',
                initArgs:[
                    'breath',
                    {
                        sps:Devices['BLE']['hegduino'].sps
                    }
                ],
                route:'runAlgorithm',
                callback:(breath)=>{
                    console.log('breath detect result', breath); //this algorithm only returns when it detects a beat
                }
            }
        }
    }
)


*/