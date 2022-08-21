
import { WorkerInfo, WorkerService } from 'graphscript';

import gsworker from './stream.worker'

//import { ArrayManip } from './arraymanip';
import { BLEClient, BLEDeviceOptions, BLEDeviceInfo } from './ble/ble_client';
import { workerCanvasRoutes } from 'graphscript';
import { SerialPortOptions, SerialStreamProps, WebSerial } from './serial/serialstream';
import { Devices } from './devices';
import { TimeoutOptions } from '@capacitor-community/bluetooth-le';

export function isMobile() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||(window as any).opera);
    return check;
};

export const BLE = new BLEClient();
export const workers = new WorkerService({
    routes:workerCanvasRoutes
}); 
export { Devices, gsworker }


//create streaming threads
export function initDevice(
    deviceType:'BLE'|'USB'|'OTHER'|'BLE_OTHER'|'USB_OTHER', //other includes prewritten drivers that don't fit our format very well, e.g. cloud streaming drivers or the musejs driver as they are self contained
    deviceName:string, //one of the supported settings in Devices
    ondecoded:((data:any) => void)|{[key:string]:(data:any)=>void}, //a single ondata function or an object with keys corresponding to BLE characteristics
    renderSettings?:{
        canvas:HTMLCanvasElement,
        context:string,
        _id?:string,
        draw?:string|((
            self, canvas, context
        ) => void),
        update?:string|((self, canvas, context, input)=>void),
        init?:string|((
            self, canvas, context
        ) => void),
        clear?:string|((
            self, canvas, context
        ) => void),
        animating?:boolean //can manually make draw calls if you post 'drawFrame' with the animation _id
    }
){
    let settings = Devices[deviceType][deviceName];

    let streamworker, renderworker;
    if(settings) streamworker = workers.addWorker({url:gsworker});
    if(renderSettings) {
        renderworker = workers.addWorker({url:gsworker, _id:renderSettings._id});
        let portId = workers.establishMessageChannel(streamworker.worker,renderworker.worker);

        if(renderSettings) {
            workers.run('transferCanvas',renderworker.worker,renderSettings);
        }

        workers.transferFunction(
            renderworker,
            function receiveParsedData(self,origin,parsed) {
                self.run('runUpdate',undefined,parsed);
                self.run('drawFrame');
            },
            'receiveParsedData'
        )

        renderworker.post('subscribeToWorker',['decodeAndParseDevice',portId,'receiveParsedData']);
    }

    if(deviceType.includes('OTHER')) {

        if(typeof ondecoded === 'function') {
            settings.ondata = (data:any) => {
                streamworker.run('decodeAndParseDevice',[data,deviceType,deviceName]).then(ondecoded);
            };
        }

        return new Promise ((res,rej) => {
            let init = settings.connect(settings);
            let info = {
                workers: {
                    streamworker,
                    renderworker
                },
                disconnect:() => {settings.disconnect(settings);},
                device:init,
                read:(command?:any) => {
                    if(settings.read) return new Promise((res,rej) => {res(settings.read(settings,command))});    
                },
                write:(command?:any) => {
                    if(settings.write) return  new Promise((res,rej) => {res(settings.write(settings,command))});
                }
            }   
            res(info);
        }).catch((er)=>{
            console.error(er);
            workers.terminate(streamworker._id);
        }) as Promise<{
            workers:{
                streamworker:WorkerInfo,
                renderworker?:WorkerInfo
            },
            device:any,
            disconnect:()=>void,
            read:(command?:any)=>any,
            write:(command?:any)=>any
        }>;

    }
    

    if((settings as BLEDeviceOptions)?.services) {
        //ble
        //if single ondecoded function provided, apply to the first characteristic with notify:true else specified
        for(const primaryUUID in (settings as BLEDeviceOptions).services) {
            //console.log(primaryUUID)
            for(const characteristic in (settings as any).services[primaryUUID]) {
                if(typeof ondecoded === 'function') {
                    if((settings as BLEDeviceOptions).services?.[primaryUUID]?.[characteristic]?.notify) {
                        (settings as any).services[primaryUUID][characteristic].notifyCallback = (data:DataView) => {
                            (streamworker as WorkerInfo).run('decodeAndParseDevice',[data,deviceType,deviceName,primaryUUID,characteristic],[data.buffer]).then(ondecoded);
                        }
                        break; //only subscribe to first notification in our list if only one ondecoded function provided
                    }
                } else if(typeof ondecoded === 'object') {
                    if(ondecoded[characteristic]) {
                        if((settings as BLEDeviceOptions).services?.[primaryUUID]?.[characteristic]?.notify) {
                            (settings as any).services[primaryUUID][characteristic].notifyCallback = (data:DataView) => {
                                streamworker.run('decodeAndParseDevice',[data,deviceType,deviceName,primaryUUID,characteristic],[data.buffer]).then(ondecoded[characteristic]);
                            }
                        } 
                        if ((settings as BLEDeviceOptions).services?.[primaryUUID]?.[characteristic]?.read) {
                            (settings as any).services[characteristic].readCallback = (data:DataView) => {
                                streamworker.run('decodeAndParseDevice',[data,deviceType,deviceName,primaryUUID,characteristic],[data.buffer]).then(ondecoded[characteristic]);
                            }
                        }
                    }
                }
            }
        }

        settings.ondisconnect = () => {
            workers.terminate(streamworker._id as string);
            if(renderworker) workers.terminate(renderworker._id);
        }

        return (new Promise((res,rej) => {
            BLE.setup(settings as BLEDeviceOptions).then((result) => {
                res(Object.assign({
                    workers:{
                        streamworker,
                        renderworker
                    },
                    device:result,
                    disconnect:() => { BLE.disconnect(result.deviceId as string) },
                    read:(command:{ service:string, characteristic:string, ondata?:(data:DataView)=>void, timeout?:TimeoutOptions }) => { return BLE.read(result.device, command.service, command.characteristic, command.ondata, command.timeout) },
                    write:(command:{ service:string, characteristic:string, data?:string|number|ArrayBufferLike|DataView|number[], callback?:()=>void, timeout?:TimeoutOptions}) => { return BLE.write(result.device, command.service, command.characteristic, command.data, command.callback, command.timeout) }
                }));
            }).catch((er)=>{
                console.error(er);
                workers.terminate(streamworker._id);
                if(renderworker) workers.terminate(renderworker._id);
                rej(er);
            });
        }) as Promise<{
            workers:{
                streamworker:WorkerInfo,
                renderworker?:WorkerInfo
            },
            device:BLEDeviceInfo,
            disconnect:()=>void,
            read:(command:{ service:string, characteristic:string, ondata?:(data:DataView)=>void, timeout?:TimeoutOptions }) => Promise<DataView>,
            write:(command:{ service:string, characteristic:string, data?:string|number|ArrayBufferLike|DataView|number[], callback?:()=>void, timeout?:TimeoutOptions})=>Promise<void>
        }>)
        
    } else if ((settings as (SerialStreamProps & SerialPortOptions))?.baudRate) {
        //serial
        let serialworker = workers.addWorker({url:gsworker});

        serialworker.worker.addEventListener('message',(ev) => {
            if(typeof ev.data === 'string') {
                if(ev.data.includes('disconnected')) {
                    workers.terminate(serialworker._id as string);
                    workers.terminate(streamworker._id);
                    if(renderworker) workers.terminate(renderworker._id);
                }
            }
        });

        serialworker.post('setupSerial');

        let portId = workers.establishMessageChannel(streamworker.worker,serialworker.worker);

        let WS = new WebSerial();

        return new Promise((res,rej) => {
            WS.requestPort(settings.usbVendorId, settings.usbProductId).then((port)=>{
                let info = port.getInfo();
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
                    }
                }) as Promise<{
                    _id:string,
                    settings:any,
                    info:Partial<SerialPortInfo>
                }>).then((result) => {
                    if(settings.write) serialworker.post('writeStream', [result._id,settings.write]);

                    if(typeof ondecoded === 'function') streamworker.subscribe('decodeAndParseDevice',ondecoded);

                    res(Object.assign({
                        workers:{
                            streamworker,
                            renderworker,
                            serialworker
                        },
                        device:result,
                        disconnect:() => {serialworker.post('closeStream',result._id);},
                        read:() => { return new Promise((res,rej) => { let sub; sub = streamworker.subscribe('decodeAndParseDevice',(result)=>{ serialworker.unsubscribe('decodeAndParseDevice',sub); res(result); });}); }, //we are already reading, just return the latest result from decodeAndParseDevice
                        write:(command:any) => {return serialworker.run('writeStream', [result._id,command])}
                    }));
                });
            }).catch((er)=>{
                console.error(er);
                rej(er);
            });
        }) as Promise<{
            workers:{
                serialworker:WorkerInfo,
                streamworker:WorkerInfo,
                renderworker?:WorkerInfo
            },
            device:{
                _id:string,
                settings:any,
                info:Partial<SerialPortInfo>
            },
            disconnect:()=>void,
            read:()=>Promise<any>,
            write:(command:any)=>Promise<boolean>
        }>
        
    }
    else return undefined;
}




export function createStreamPipeline(
    dedicatedSerialWorker=false,
    dedicatedRenderWorker=false, 
    renderSettings?:{
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
    }
) {
    let streamworker = workers.addWorker({url:gsworker}) as WorkerInfo;
    let renderworker,renderPort;
    let serialworker, decoderPort;
    
    
    if(dedicatedSerialWorker) {
        serialworker = workers.addWorker({url:gsworker}) as WorkerInfo;
        
        decoderPort = workers.establishMessageChannel(serialworker.worker, streamworker.worker); //returns the id of the port so we can orchestrate port communication
    
        serialworker.post('setupSerial');
    }   

    //transferChartCommands(renderworker);

    if(dedicatedRenderWorker) {
        renderworker = workers.addWorker({url:gsworker}) as WorkerInfo;
        renderPort = workers.establishMessageChannel(streamworker.worker, renderworker.worker); //returns the id of the port so we can orchestrate port communication
    
        if(renderSettings) {
            workers.run('transferCanvas',renderworker.worker,renderSettings);
        }

        workers.transferFunction(
            renderworker,
            function receiveParsedData(self,origin,parsed) {
                self.run('runUpdate',undefined,parsed);
                self.run('drawFrame');
            },
            'receiveParsedData'
        )

        renderworker.post('subscribeToWorker',['decodeAndParseDevice',renderPort,'receiveParsedData']);

    }

    // initWorkerChart(
    //     renderworker
    // 

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
