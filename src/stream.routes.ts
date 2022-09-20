import { 
    WorkerService
} from 'graphscript'
import { WebSerial } from './serial/serialstream'; //extended classes need to be imported for compilation
import { decoders, Devices } from './devices/index';
//import { WebglLinePlotUtil } from '../../BrainsAtPlay_Libraries/webgl-plot-utils/webgl-plot-utils'//'webgl-plot-utils';
import { ByteParser } from "./util/ByteParser";
import { BiquadChannelFilterer, FilterSettings } from './util/BiquadFilters';
//import * as bfs from './storage/BFSUtils'
import { ArrayManip } from './util/ArrayManip';
import { parseFunctionFromText } from 'graphscript';


//to load in a worker 

//'install' these on the worker in a way we can write functions to work with them flexibly. You can
// set these variables as service graph props instead but this is a bit simpler.
export function loadStreamWorkerGlobals() {
    //globalThis sets equivalent of window variables on worker
    globalThis.WebSerial = WebSerial;
    globalThis.decoders = decoders;
    globalThis.decoder = 'raw';
    globalThis.ByteParser = ByteParser;
    globalThis.Devices = Devices;
    globalThis.filtering = true;
    globalThis.filters = {};
    globalThis.BiquadChannelFilterer = BiquadChannelFilterer;
    globalThis.ArrayManip = ArrayManip; //static array manipulation methods
    //globalThis.WebglLinePlotUtil = WebglLinePlotUtil;
    //globalThis.runningAnim = true;
}

declare var WorkerGlobalScope;
if(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
   loadStreamWorkerGlobals();
}

export const streamWorkerRoutes = { //serial API routes
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
                if(globalThis.Devices[deviceType][device]) {
                    if(globalThis.Devices[deviceType][device][service]) {
                        if(globalThis.Devices[deviceType][device][characteristic]) {
                            globalThis.Devices[deviceType][device][characteristic].codec = codec;
                        } else {
                            globalThis.Devices[deviceType][device][characteristic] = {codec};
                        }
                    } else {
                        globalThis.Devices[deviceType][device] = {[characteristic]: {codec}};
                    }
                }
            }
            else if (globalThis.Devices[deviceType][device]?.codec) {
                if(globalThis.Devices[deviceType][device])
                    globalThis.Devices[deviceType][device].codec = codec;
                else {
                    globalThis.Devices[deviceType][device] = {codec};
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
        if(globalThis.Devices[deviceType][device]?.codec) 
            globalThis.decoder = globalThis.Devices[deviceType][device]?.codec;
        else if (deviceType === 'BLE' && service && characteristic && globalThis.Devices[deviceType][device]?.[service as string]?.[characteristic as string]?.codec)
            globalThis.decoder = globalThis.Devices[deviceType][device][service][characteristic].codec;

        return true;
    },
    'decodeDevice':function decodeDevice( //run a decoder based on a supported device spec
        data:any, 
        deviceType:'BLE'|'USB'|'BLE_OTHER'|'USB_OTHER'|'OTHER',
        device:string, //serial devices get one codec, ble devices get a codec per read/notify characteristic property
        service?:string,
        characteristic?:string
    ) {
        if(globalThis.Devices[deviceType][device]?.codec) 
            return globalThis.Devices[deviceType][device].codec(data);
        else if (deviceType === 'BLE' && service && characteristic && globalThis.Devices[deviceType][device]?.[service as string]?.[characteristic as string]?.codec)
            return globalThis.Devices[deviceType][device][service][characteristic].codec(data);

    },
    'decodeAndParseDevice':function decodeAndParseDevice(
        data:any, 
        deviceType:'BLE'|'USB'|'BLE_OTHER'|'USB_OTHER'|'OTHER',
        deviceName:string, //serial devices get one codec, ble devices get a codec per read/notify characteristic property
        service?:string,
        characteristic?:string
    ) {

        let decoded;

        if (deviceType === 'BLE' && service && characteristic && globalThis.Devices[deviceType][deviceName]?.services[service as string]?.[characteristic as string]?.codec)
            decoded = globalThis.Devices[deviceType][deviceName].services[service][characteristic].codec(data);
        else if(globalThis.Devices[deviceType][deviceName]?.codec) 
            decoded = globalThis.Devices[deviceType][deviceName].codec(data);
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
                            } else if (typeof parsed[prop] === 'number') {
                                parsed[prop] = filter.apply(parsed[prop]);
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
    'setFilters':function setFilters(
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
                        })
    
                        Serial.readStream(stream);
    
                        port.ondisconnect = () => {
                            postMessage(`${stream._id} disconnected`);
                        };

                        res({
                            _id:stream._id,
                            settings,
                            info:stream.info
                        })
                    }).catch( ()=>{postMessage(`disconnected`);} );;
                } else {
                    rej(false);
                }
            })
        })
        
    },
    'closeStream':function closeStream(streamId) {
        return new Promise((res,rej) => {

            const Serial = globalThis.Serial as WebSerial;

            let ondisconnect;
            if(Serial.streams[streamId].port?.ondisconnect as any) ondisconnect = Serial.streams[streamId].port.ondisconnect
            Serial.closeStream(Serial.streams[streamId]).then((resolved) => {
                if(ondisconnect) ondisconnect(undefined); //for whatever reason we need to call this manually on this callback
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
}