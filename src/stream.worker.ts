import { WorkerService, unsafeRoutes, proxyWorkerRoutes, workerCanvasRoutes, GPUService, parseFunctionFromText } from 'graphscript'/////"../../GraphServiceRouter/index";//from 'graphscript'
import { WebSerial } from './serial/serialstream'; //extended classes need to be imported for compilation
import { decoders, Devices } from './devices/index';
//import { WebglLinePlotUtil } from '../../BrainsAtPlay_Libraries/webgl-plot-utils/webgl-plot-utils'//'webgl-plot-utils';
import { bitflippin } from "./util/bitflippin";
import { BiquadChannelFilterer, FilterSettings } from './util/BiquadFilters';
//import * as bfs from './storage/BFSUtils'
import { ArrayManip } from './util/arraymanip';

declare var WorkerGlobalScope;

if(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {


    //'install' these on the worker in a way we can write functions to work with them flexibly. You can
    // set these variables as service graph props instead but this is a bit simpler.

    //globalThis sets equivalent of window variables on worker
    globalThis.WebSerial = WebSerial;
    globalThis.decoders = decoders;
    globalThis.decoder = 'raw';
    globalThis.bitflippin = bitflippin;
    globalThis.devices = Devices;
    //globalThis.WebglLinePlotUtil = WebglLinePlotUtil;
    //globalThis.runningAnim = true;
    globalThis.filtering = true;
    globalThis.filters = {};
    globalThis.BiquadChannelFilterer = BiquadChannelFilterer;
    globalThis.ArrayManip = ArrayManip; //static array manipulation methods
    //console.log(self.SERVICE)

    (self as any).SERVICE = new WorkerService({
        //props:{} //could set the props instead of globalThis but it really does not matter unless you want to bake in for more complex service modules
        routes:[
            GPUService as any,
            proxyWorkerRoutes,
            workerCanvasRoutes,
            unsafeRoutes, //allows dynamic route loading
            { //serial API routes
                'receiveDecoder':function receiveDecoder(decoder:any, decoderName:string) {
                    globalThis.decoders[decoderName] = (0, eval)('('+decoder+')');
                },
                'receiveCodec':function receiveDeviceCodec(
                    decoder:any, 
                    deviceType:'BLE'|'USB',
                    device:string, //serial devices get one codec, ble devices get a codec per read/notify characteristic property
                    service?:string,
                    characteristic?:string
                ) {
                    let codec = parseFunctionFromText(decoder);

                    if(codec) {
                        if(deviceType === 'USB' && Devices[deviceType][device]?.codec) {
                            if(Devices[deviceType][device])
                                Devices[deviceType][device].codec = codec;
                            else {
                                Devices[deviceType][device] = {codec};
                            }
                        }
                        else if (
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
                    }

                },
                'decode':function decode(data:any) {
                    return globalThis.decoder(data);
                    //return globalThis.decoders[globalThis.decoder](data);
                },
                'decodeAndParse':function decodeAndParse(self, origin, data:any) {
                    let decoded = self.graph.run('decode',data);
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
                    //console.log(decoded, self.graph)
                    return decoded;
                },
                'setActiveDecoder':function setActiveDecoder(deviceType:'BLE'|'USB',device:string,service?:string,characteristic?:string) {
                    //console.log('received decoder:',decoderName)
                    if(deviceType === 'USB' && Devices[deviceType][device]?.codec) 
                        globalThis.decoder = Devices[deviceType][device]?.codec;
                    else if (deviceType === 'BLE' && service && characteristic && Devices[deviceType][device]?.[service as string]?.[characteristic as string]?.codec)
                        globalThis.decoder = Devices[deviceType][device][service][characteristic].codec;

                    return true;
                },
                'decodeDevice':function decodeDevice( //run a decoder based on a supported device spec
                    data:any, 
                    deviceType:'BLE'|'USB',
                    device:string, //serial devices get one codec, ble devices get a codec per read/notify characteristic property
                    service?:string,
                    characteristic?:string
                ) {
                    if(deviceType === 'USB' && Devices[deviceType][device]?.codec) 
                        return Devices[deviceType][device].codec(data);
                    else if (deviceType === 'BLE' && service && characteristic && Devices[deviceType][device]?.[service as string]?.[characteristic as string]?.codec)
                        return Devices[deviceType][device][service][characteristic].codec(data);

                },
                'decodeAndParseDevice':function decodeAndParseDevice(
                    data:any, 
                    deviceType:'BLE'|'USB',
                    device:string, //serial devices get one codec, ble devices get a codec per read/notify characteristic property
                    service?:string,
                    characteristic?:string
                ) {

                    let decoded;

                    if(deviceType === 'USB' && Devices[deviceType][device]?.codec) 
                        decoded = Devices[deviceType][device].codec(data);
                    else if (deviceType === 'BLE' && service && characteristic && Devices[deviceType][device]?.services[service as string]?.[characteristic as string]?.codec)
                        decoded = Devices[deviceType][device].services[service][characteristic].codec(data);
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
                    //console.log(decoded, self.graph)
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
                    self, 
                    origin, 
                    settings:SerialOptions & { 
                        usbVendorId:number, 
                        usbProductId:number, 
                        pipeTo?:string|{route:string, _id:string, extraArgs:any[]}, 
                        frequency?:number, 
                        buffering?:{searchBytes:Uint8Array} 
                    }) {
            
                    const WorkerService = self.graph as WorkerService;
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
                'closeStream':function closeStream(self, origin, streamId) {
                    return new Promise((res,rej) => {
        
                        const Serial = globalThis.Serial as WebSerial;
        
                        Serial.closeStream(Serial.streams[streamId]).then((resolved) => {
                            res(resolved);
                        }).catch(rej);

                    });
                },
                'writeStream':function writeStream(self, origin, streamId, message:any) {

                    (globalThis.Serial as WebSerial).writeStream(globalThis.Serial.streams[streamId], message);
        
                    return true;
                },
                'updateStreamSettings':function updateStreamSettings(self,origin, streamId:string, settings:any) {
                    if(globalThis.Serial?.streams[streamId]) {
                        for(const key in settings) {
                            if(typeof settings[key] === 'object') {
                                Object.assign(globalThis.Serial.streams[streamId].settings[key], settings[key]);
                            }
                            else globalThis.Serial.streams[streamId][key] = settings[key];
                        }
                    }
                }
            }
        ],
        includeClassName:false
    });

}

export default self as any;


///Grraaaaadient.. DESCENT *explodes*