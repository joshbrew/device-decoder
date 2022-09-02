import { 
    WorkerService, 
    unsafeRoutes, 
    workerCanvasRoutes, 
    //GPUService, 
    parseFunctionFromText } from 'graphscript'/////"../../GraphServiceRouter/index";//from 'graphscript'
import { WebSerial } from './serial/serialstream'; //extended classes need to be imported for compilation
import { decoders, Devices } from './devices/index';
//import { WebglLinePlotUtil } from '../../BrainsAtPlay_Libraries/webgl-plot-utils/webgl-plot-utils'//'webgl-plot-utils';
import { ByteParser } from "./util/ByteParser";
import { BiquadChannelFilterer, FilterSettings } from './util/BiquadFilters';
//import * as bfs from './storage/BFSUtils'
import { ArrayManip } from './util/ArrayManip';
import { AlgorithmContextProps, algorithms, createAlgorithmContext } from './algorithms/index';

declare var WorkerGlobalScope;

if(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {


    //'install' these on the worker in a way we can write functions to work with them flexibly. You can
    // set these variables as service graph props instead but this is a bit simpler.

    //globalThis sets equivalent of window variables on worker
    globalThis.WebSerial = WebSerial;
    globalThis.decoders = decoders;
    globalThis.decoder = 'raw';
    globalThis.ByteParser = ByteParser;
    globalThis.devices = Devices;
    globalThis.filtering = true;
    globalThis.filters = {};
    globalThis.BiquadChannelFilterer = BiquadChannelFilterer;
    globalThis.ArrayManip = ArrayManip; //static array manipulation methods
    //globalThis.WebglLinePlotUtil = WebglLinePlotUtil;
    //globalThis.runningAnim = true;
    //console.log(this.SERVICE)

    const worker = new WorkerService({
        //props:{} //could set the props instead of globalThis but it really does not matter unless you want to bake in for more complex service modules
        routes:[
            //GPUService as any,
            workerCanvasRoutes,
            unsafeRoutes, //allows dynamic route loading
            { //serial API routes
                'receiveDecoder':function receiveDecoder(decoder:any, decoderName:string) {
                    globalThis.decoders[decoderName] = (0, eval)('('+decoder+')');
                },
                'receiveCodec':function receiveDeviceCodec(
                    decoder:any, 
                    deviceType:'BLE'|'USB'|'BLE_OTHER'|'USB_OTHER'|'OTHER',
                    device:string, //serial devices get one codec, ble devices get a codec per read/notify characteristic property
                    service?:string,
                    characteristic?:string
                ) {
                    let codec = parseFunctionFromText(decoder);

                    if(codec) {
                        if (
                            deviceType === 'BLE' && 
                            service && 
                            characteristic
                        ) {
                            if(Devices[deviceType][device]) {
                                if(Devices[deviceType][device][service]) {
                                    if(Devices[deviceType][device][characteristic]) {
                                        Devices[deviceType][device][characteristic].codec = codec;
                                    } else {
                                        Devices[deviceType][device][characteristic] = {codec};
                                    }
                                } else {
                                    Devices[deviceType][device] = {[characteristic]: {codec}};
                                }
                            }
                        }
                        else if (Devices[deviceType][device]?.codec) {
                            if(Devices[deviceType][device])
                                Devices[deviceType][device].codec = codec;
                            else {
                                Devices[deviceType][device] = {codec};
                            }
                        }
                    }

                },
                'decode':function decode(data:any) {
                    return globalThis.decoder(data);
                    //return globalThis.decoders[globalThis.decoder](data);
                },
                'decodeAndParse':function decodeAndParse(data:any) {
                    let decoded = this.graph.run('decode',data);
                    if(decoded) {
                        let parsed = globalThis.ArrayManip.reformatData(decoded);
                    
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
        
                            return parsed;
                        }
                    }
                    //console.log(decoded, this.graph)
                    return decoded;
                },
                'setActiveDecoder':function setActiveDecoder(deviceType:'BLE'|'USB'|'BLE_OTHER'|'USB_OTHER'|'OTHER',device:string,service?:string,characteristic?:string) {
                    //console.log('received decoder:',decoderName)
                    if(Devices[deviceType][device]?.codec) 
                        globalThis.decoder = Devices[deviceType][device]?.codec;
                    else if (deviceType === 'BLE' && service && characteristic && Devices[deviceType][device]?.[service as string]?.[characteristic as string]?.codec)
                        globalThis.decoder = Devices[deviceType][device][service][characteristic].codec;

                    return true;
                },
                'decodeDevice':function decodeDevice( //run a decoder based on a supported device spec
                    data:any, 
                    deviceType:'BLE'|'USB'|'BLE_OTHER'|'USB_OTHER'|'OTHER',
                    device:string, //serial devices get one codec, ble devices get a codec per read/notify characteristic property
                    service?:string,
                    characteristic?:string
                ) {
                    if(Devices[deviceType][device]?.codec) 
                        return Devices[deviceType][device].codec(data);
                    else if (deviceType === 'BLE' && service && characteristic && Devices[deviceType][device]?.[service as string]?.[characteristic as string]?.codec)
                        return Devices[deviceType][device][service][characteristic].codec(data);

                },
                'decodeAndParseDevice':function decodeAndParseDevice(
                    data:any, 
                    deviceType:'BLE'|'USB'|'BLE_OTHER'|'USB_OTHER'|'OTHER',
                    deviceName:string, //serial devices get one codec, ble devices get a codec per read/notify characteristic property
                    service?:string,
                    characteristic?:string
                ) {

                    let decoded;

                    if (deviceType === 'BLE' && service && characteristic && Devices[deviceType][deviceName]?.services[service as string]?.[characteristic as string]?.codec)
                        decoded = Devices[deviceType][deviceName].services[service][characteristic].codec(data);
                    else if(Devices[deviceType][deviceName]?.codec) 
                        decoded = Devices[deviceType][deviceName].codec(data);
                    else decoded = data;

                    //console.log(decoded);

                    if(decoded) {
                        let parsed = globalThis.ArrayManip.reformatData(decoded);

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
        
                            return parsed;
                        }
                    }
                    //console.log(decoded, this.graph)
                    return decoded;
                },
                'toggleAnim':function toggleAnim() {
                    globalThis.runningAnim = !globalThis.runningAnim;
        
                    return globalThis.runningAnim; //pass along to the animation message port?
                },
                'setFilter':function setFilters(
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
                'getFilterSettings':function getFilterSettings() {
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
                'setupSerial':function setupSerial() {
                    globalThis.Serial = new globalThis.WebSerial() as WebSerial; 
                    globalThis.decoder = 'raw';
                    console.log('worker: Setting up Serial', globalThis.Serial)
        
                    //globalThis.Serial.getPorts().then(console.log)
                    return true;
                },
                'openPort':function openPort(
                    settings:SerialOptions & { 
                        usbVendorId:number, 
                        usbProductId:number, 
                        pipeTo?:string|{route:string, _id:string, extraArgs:any[]}, 
                        frequency?:number, 
                        buffering?:{searchBytes:Uint8Array} 
                    }) {
            
                    const WorkerService = this.graph as WorkerService;
                    if(!globalThis.Serial) WorkerService.run('setupSerial');
                    return new Promise((res,rej) => {
                        globalThis.Serial.getPorts().then((ports)=>{
                
                            const Serial = globalThis.Serial as WebSerial;
            
                            let port = ports.find((port)=>{
                                return port.getInfo().usbVendorId === settings.usbVendorId && port.getInfo().usbProductId === settings.usbProductId;
                            }) as SerialPort;
                            if(port) {
                                Serial.openPort(port, settings).then(() => {
                                    const stream = Serial.createStream({
                                        port, 
                                        settings,
                                        frequency:settings.frequency ? settings.frequency : 10,
                                        buffering:settings.buffering,
                                        ondata: (value:Uint8Array) => { 
                                            //if(globalThis.decoder) value = WorkerService.run(globalThis.decoder, value); //run the decoder if set on this thread, else return the array buffer result raw or pipe to another thread
                                            //console.log(value);
                                            if((stream.settings as any).pipeTo) {
                                                if(typeof (stream.settings as any).pipeTo === 'string')
                                                    WorkerService.transmit(value, (stream.settings as any).pipeTo, [value.buffer] as any);
                                                //we can subscribe on the other end to this worker output by id
                                                else if ((stream.settings as any).pipeTo?.route) {
                                                    let args:any = value;
                                                    if((stream.settings as any).pipeTo.extraArgs) args = [value, ...(stream.settings as any).pipeTo.extraArgs];
                                                    WorkerService.transmit({route:(stream.settings as any).pipeTo.route, args }, (stream.settings as any).pipeTo._id,  [value.buffer] as any);
                                                }
                                            } else {
                                                WorkerService.transmit(value, undefined, [value.buffer] as any);
                                                //we can subscribe on the other end to this worker output by id
                                            }
                                        }
                                    });
                
                                    Serial.readStream(stream);
                
                                    port.ondisconnect = () => {
                                        postMessage(`${stream._id} disconnected`);
                                    };
        
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
                'closeStream':function closeStream(streamId) {
                    return new Promise((res,rej) => {
        
                        const Serial = globalThis.Serial as WebSerial;
        
                        Serial.closeStream(Serial.streams[streamId]).then((resolved) => {
                            res(resolved);
                        }).catch(rej);

                    });
                },
                'writeStream':function writeStream(streamId, message:any) {

                    (globalThis.Serial as WebSerial).writeStream(globalThis.Serial.streams[streamId], message);
        
                    return true;
                },
                'updateStreamSettings':function updateStreamSettings(streamId:string, settings:any) {
                    if(globalThis.Serial?.streams[streamId]) {
                        for(const key in settings) {
                            if(typeof settings[key] === 'object') {
                                Object.assign(globalThis.Serial.streams[streamId].settings[key], settings[key]);
                            }
                            else globalThis.Serial.streams[streamId][key] = settings[key];
                        }
                    }
                },
                'createAlgorithmContext': function creatalg( //returns id of algorithm for calling it on server
                    options:AlgorithmContextProps|string,
                    inputs?:{[key:string]:any} //e.g. set the sample rate for this run
                ){
                    if(!this.graph.ALGORITHMS) this.graph.ALGORITHMS = {};
                    if(typeof options === 'string') {
                        options = algorithms[options];
                    }
                    if(typeof options.ondata === 'string') options.ondata = parseFunctionFromText(options.ondata);

                    let ctx;
                    if(typeof options?.ondata === 'function') ctx = createAlgorithmContext(options,inputs);
                    if(ctx) this.graph.ALGORITHMS[ctx._id] = ctx;

                    return ctx?._id;
                },
                'runAlgorithm':function runAlgorithm(data:{[key:string]:any}, _id?:string){
                    if(!this.graph.ALGORITHMS) this.graph.ALGORITHMS = {};

                    if(!_id) _id = Object.keys(this.graph.ALGORITHMS)[0]; //run the first key if none specified

                    let res = this.graph.ALGORITHMS[_id].run(data); 

                    if(res !== undefined) {
                        if(Array.isArray(res)) {
                            let pass = [];
                            res.forEach((r) => {
                                if(r !== undefined) {
                                    pass.push(r);
                                    this.graph.setState({[_id]:r});
                                }
                            });
                            if(pass.length > 0) {
                                return pass;
                            }
                        }
                        else {
                            this.graph.setState({[_id]:res}); 
                            return res;
                        }
                    }
                    //results subscribable by algorithm ID for easier organizing, 
                    //  algorithms returning undefined will not set state so you can have them only trigger 
                    //      behaviors conditionally e.g. on forward pass algorithms that run each sample but only 
                    //          report e.g. every 100 samples or when an anomaly is identified

                }
            }
        ],
        includeClassName:false
    });

}

export default self as any;


///Grraaaaadient.. DESCENT *explodes*