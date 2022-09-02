import { ByteParser } from '../util/ByteParser';
//bundle with tinybuild
import { 
    BleClient, 
    BleClientInterface, 
    BleDevice, 
    InitializeOptions, 
    RequestBleDeviceOptions, 
    ScanResult, 
    TimeoutOptions
} from '@capacitor-community/bluetooth-le';


export type BLEDeviceOptions = {
    namePrefix?:string,
    name?:string,
    deviceId?:string,
    onconnect?:()=>void,
    ondisconnect?:(deviceId:string)=>void,
    connectOptions?:TimeoutOptions,
    services?:{ 
        [key:string]:{ // service uuid you want to set and all of the characteristic settings and responses, keys are UUIDs
            [key:string]:{ // services can have an arbitrary number of characteristics, keys are UUIDs
                read?:boolean, //should we read on connect
                readOptions?:TimeoutOptions,
                readCallback?:((result:DataView)=>void),
                write?:string|number|ArrayBufferLike|DataView, //should we write on connect and what should we write?
                writeOptions?:TimeoutOptions,
                writeCallback?:(()=>void),
                notify?:boolean, //can this characteristic notify?
                notifyCallback?:((result:DataView)=>void)
                [key:string]:any
            }
        }
    }
}

export type BLEDeviceInfo = { device:BleDevice } & BLEDeviceOptions

export class BLEClient extends ByteParser {

    client:BleClientInterface = BleClient;
    devices:{[key:string]:BLEDeviceInfo} = {};
    location?:boolean=false;
    initialized:boolean = false;

    constructor(
        options?:BLEDeviceOptions,
        location?:boolean //just tells android if it needs this permission enabled or not, usually false
    ) {
        super();
        if(location) this.location = location;

        if(options) {
            this.setup(options);
        }
    }

    //request and setup a device based on options you input
    setup(options?:BLEDeviceOptions,location=this.location):Promise<BLEDeviceInfo> {
        
        let services:any[] = [];

        if(options) {
            for(const serviceuuid in options.services) {
                services.push(serviceuuid);
            }
        }

        let opts:any = {}; if(!location) opts.androidNeverForLocation = false;

        return new Promise(async (res,rej) => {
            
            if(!this.initialized) {
                await this.client.initialize(opts)
                this.initialized = true;
            }

            if(options?.deviceId) {
                res(await this.reconnect(options.deviceId));
            } else {
                if(options) {
                    let deviceRequest:any = {
                        filters:[{services}]
                    };
                    if(!this.isMobile()) deviceRequest.optionalServices = services; //required on web
                    if(options?.namePrefix) deviceRequest.filters[0].namePrefix = options.namePrefix;// = options.namePrefix;
                    if(options?.name) deviceRequest.filters[0].name = options.name;// = options.namePrefix;
                
                    this.client.requestDevice(deviceRequest)
                        .then((device) => {
                            res(this.setupDevice(device, options));
                        }).catch(rej);
                }
                else {
                    this.client.requestDevice()
                        .then((device) => {
                            res(this.setupDevice(device, options));
                        }).catch(rej);
                }
            }
            
        })
        
    }

    initialize(options?:InitializeOptions):Promise<true> {
        return new Promise((res,rej)=> {this.client.initialize(options).then(() => {
            res(true)
        }).catch(rej) })
    }
    
    //get a device you can then connect to
    requestDevice(request?:RequestBleDeviceOptions,options?:BLEDeviceOptions):Promise<BleDevice> {
        return new Promise((res,rej) => {
            this.client.requestDevice(request)
                .then((device) => {
                    this.devices[device.deviceId] = {device,deviceId:device.deviceId,...options};
                    res(device);
                })
                .catch(rej);})
    }

    getServices(deviceId:string) {
        return this.client.getServices(deviceId)
    }

    //connect after requesting using the options
    setupDevice = (device:BleDevice,options?:BLEDeviceOptions):Promise<BLEDeviceInfo> => {
        return new Promise(async (res,rej) => {
            this.devices[device.deviceId] = {device, deviceId:device.deviceId,...options};
            this.client.connect(device.deviceId,(deviceId:string)=>{ if(this.devices[device.deviceId]?.ondisconnect) this.devices[device.deviceId].ondisconnect(deviceId); },options?.connectOptions).then(async () => {
                let services = await this.getServices(device.deviceId);
                //console.log(services);
                for(const service in options?.services) {
                    let svc = services.find((o) => {if(o.uuid === service) return true;});
                    if(svc)
                        for(const characteristic in options.services[service]) {
                            if(!svc.characteristics.find((o) => {if(o.uuid === characteristic) return true;})) continue;
                            let opt = options.services[service][characteristic];
                            if(opt.write) {
                                await this.write(device,service,characteristic,opt.write,opt.writeCallback,opt.writeOptions);
                            }
                            if(opt.read) {
                                await this.read(device,service,characteristic,opt.readCallback,opt.readOptions)
                            }
                            if(opt.notify && opt.notifyCallback) {
                                await this.subscribe(device, service, characteristic, opt.notifyCallback);
                                opt.notifying = true;
                            }
                        }
                }
            }).catch(rej);
            res(this.devices[device.deviceId]);
        });
    }

    connect(device:BleDevice,options?:BLEDeviceOptions):Promise<BleDevice> {
        return new Promise((res,rej) => {
            this.client.connect(device.deviceId,(deviceId:string)=>{ if(options?.ondisconnect) options.ondisconnect(deviceId); },options?.connectOptions)
            .then(connected => {
                res(device); //connected
            }).catch(rej);});
    }

    reconnect(deviceId:string, options?:BLEDeviceOptions):Promise<BLEDeviceInfo> {
        return new Promise((res,rej) => {
            let android = this.isAndroid();
            let mobile = this.isMobile();
            console.log(deviceId);
            let opts = options;
            if(this.devices[deviceId]) opts = Object.assign(Object.assign({},this.devices[deviceId]),opts);
            if(opts?.deviceId) delete opts.deviceId; 
            if(!mobile && !navigator.bluetooth?.getDevices) {
                this.setup(opts).then((device) => {
                    res(device);
                });
            }
            if(android) {
                this.client.getDevices([deviceId]).then(devices => {
                    this.setupDevice(devices[0],opts).then((device) => {
                        res(device);
                    });
                }).catch(rej)
            }
        });
    }

    disconnect(device:BleDevice|string) {
        if(typeof device === 'object') device = device.deviceId;
        delete this.devices[device];
        return this.client.disconnect(device);
    }

    write(
        device:BleDevice|string, 
        service: string, 
        characteristic: string, 
        value: string|number|ArrayBufferLike|DataView|number[], 
        callback?:()=>void,
        options?: TimeoutOptions
    ) {  
        if(typeof device === 'object') device = device.deviceId;
        if(callback) {
            return this.client.write(device,service,characteristic,BLEClient.toDataView(value)).then(callback);
        } else return this.client.writeWithoutResponse(device,service,characteristic,BLEClient.toDataView(value),options);
    }

    read(
        device:BleDevice|string,
        service:string,
        characteristic:string,
        ondata?:(result:DataView)=>void,
        options?:TimeoutOptions
    ) {
        if(typeof device === 'object') device = device.deviceId;
        if(ondata) return this.client.read(device, service, characteristic, options).then(ondata);
        else return this.client.read(device, service, characteristic, options);
    }

    subscribe(
        device:BleDevice|string, 
        service:string, 
        characteristic:string, 
        ondata:(result:DataView)=>void
    ) { 
        if(typeof device === 'object') device = device.deviceId;
        return this.client.startNotifications(
            device,
            service,
            characteristic,
            ondata
        );
    }

    unsubscribe(
        device:BleDevice|string, 
        service:string, 
        characteristic:string, 
    ) {
        if(typeof device === 'object') device = device.deviceId;
        return this.client.stopNotifications(
            device,
            service,
            characteristic
        );
    }   

    scan(
        options:RequestBleDeviceOptions,
        callback:(result:ScanResult)=>void
    ) {
        return this.client.requestLEScan(options,callback);
    }

    stopScanning() {
        return this.client.stopLEScan();
    }

    readDescriptor(
        device:BleDevice,
        service:string,
        characteristic:string,
        descriptor:string,
        options?:TimeoutOptions
    ) {
        return this.client.readDescriptor(
            device.deviceId,
            service,
            characteristic,
            descriptor,
            options
        );
    }

    writeDescriptor(
        device:BleDevice,
        service:string,
        characteristic:string,
        descriptor:string,
        value:string | number | DataView | ArrayBufferLike | number[],
        options?:TimeoutOptions
    ) {
        return this.client.writeDescriptor(
            device.deviceId,
            service,
            characteristic,
            descriptor,
            BLEClient.toDataView(value),
            options
        );
    }

    //NATIVE ANDROID/IOS ONLY
    readRssi(device:BleDevice) {
        return this.client.readRssi(device.deviceId);
    }

    isMobile() {
        let check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||(window as any).opera);
        return check;
    };

    isAndroid() { //https://stackoverflow.com/questions/6031412/detect-android-phone-via-javascript-jquery
        const device = navigator.userAgent.toLowerCase();
        return device.indexOf("android") > -1; 
    }

    async distance(
        device:BleDevice,
        txPower,
        x:number,
        exp:number,
        c:number
    )  {
        let rssi = await this.readRssi(device);
        if(rssi == 0) return undefined;

        let ratio = rssi/txPower;

        if(ratio < 1) {
            return Math.pow(ratio,10);
        } else {
            return x * Math.pow(ratio,exp) + c;
        }
    }

    async distanceFromPhone( //https://github.com/kevindigi/android-iot-samples/blob/7fb4b91eb769a3dba06891286f4f2f3249dab2a6/app/src/main/java/com/digicorp/helper/DistanceManager.java#L48
        device:BleDevice,
        txPower:number, //signal strength at 1 meter, hardware-specific
        model?:'nexus5'|'motoX'|'iphone5'
    ) { 
        let x, exp, c;
        if(model) {
            if(model === 'nexus5') {
                x = 0.42093;
                exp = 6.9476;
                c = 0.54992;
            }
            else if (model === 'motoX') {
                x = 0.9401940951;
                exp = 6.170094565;
                c = 0;
            } 
            else if (model === 'iphone5') {
                x = 0.89976;
                exp = 7.7095;
                c = 0.111;
            }
        }

        return await this.distance(
            device,
            txPower,
            x,
            exp,
            c
        );
    }

    //TODO: Angle of Arrival or Angle of Departure methods, I think the latter is feasible using RSSI
    //using Accelerometer API and RSSI to triangulate a vector from an android or IOS device toward the BLE device
    triangulate = (device:BleDevice, duration=1500, sampleRate=60) => {
        return new Promise((res,rej) => {
            if('Accelerometer' in globalThis) {
                if(typeof globalThis.Accelerometer === 'function') {
                    let acl = new globalThis.Accelerometer({frequency:sampleRate});
                    let start = performance.now();
                    let now = start;

                    let result = {
                        samples:[] as any[],
                        vector:{}
                    };

                    let onread = () => {
                        if(now - start < duration) {
                            this.readRssi(device).then((rssi) => {
                                let x = acl.x;
                                let y = acl.y;
                                let z = acl.z;
                                now = performance.now();
                                result.samples.push({
                                    x,
                                    y,
                                    z,
                                    rssi,
                                    timestamp:now
                                })
                            });
                        } else {
                            let vector = {x:0,y:0,z:0,rssiAvg:0};
                            result.samples.forEach((s) => {
                                //triangulate using sample 1 as <x,y,z> = <0,0,0>
                            });
                            acl.removeEventListener('reading',onread);
                        }
                    }

                    acl.addEventListener('reading', onread);

                }
            } else rej(new Error('No Accelerometer API detected'));
        });
    }

}