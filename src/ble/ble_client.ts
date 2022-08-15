import { bitflippin } from '../util/bitflippin';
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

export class BLEClient extends bitflippin {

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
                this.reconnect(options.deviceId)
                    .then((device)=>{
                        res(this.setupDevice(device,options));
                    });
            } else {
                if(options) {
                    let deviceRequest:any = {
                        filters:[{services}],
                        optionalServices:services
                    };
                    if(options?.namePrefix) deviceRequest.filters.push({namePrefix:options.namePrefix})// = options.namePrefix;
                
                    this.client.requestDevice(deviceRequest)
                        .then((device) => {
                            res(this.setupDevice(device, options));
                        });
                }
                else {
                    this.client.requestDevice()
                        .then((device) => {
                            res(this.setupDevice(device, options));
                        });
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
                for(const service in options?.services) {
                    for(const characteristic in options.services[service]) {
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

    reconnect(deviceId:string):Promise<BleDevice> {
        return new Promise((res,rej) => {this.client.getDevices([deviceId]).then(devices => {
            res(devices[0]);
        }).catch(rej)});
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