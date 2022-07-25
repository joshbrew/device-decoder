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


export type DeviceOptions = {
    namePrefix?:string,
    deviceId?:string,
    onConnect?:()=>void,
    onDisconnect?:()=>void,
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

export type DeviceInfo = {device:BleDevice, options:DeviceOptions}

export class BLEClient {

    client:BleClientInterface = BleClient;
    devices:{[key:string]:DeviceInfo} = {};
    location?:boolean=false;
    initialized:boolean = false;

    constructor(
        options?:DeviceOptions,
        location?:boolean //just tells android if it needs this permission enabled or not, usually false
    ) {
        if(location) this.location = location;

        if(options) {
            this.setup(options);
        }
    }

    //request and setup a device based on options you input
    setup(options?:DeviceOptions,location=this.location):Promise<DeviceInfo> {
        
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
                        services,
                        optionalServices:services
                    };
                    if(options?.namePrefix) deviceRequest.namePrefix = options.namePrefix;
                
                    this.client.requestDevice(deviceRequest)
                        .then((device) => {
                            res(this.setupDevice(device, options));
                        });
                }
                
                this.client.requestDevice()
                    .then((device) => {
                        res(this.setupDevice(device, options));
                    });
            }
            
        })
        
    }

    initialize(options?:InitializeOptions):Promise<true> {
        return new Promise((res,rej)=> {this.client.initialize(options).then(() => {
            res(true)
        }).catch(rej) })
    }
    
    //get a device you can then connect to
    requestDevice(request?:RequestBleDeviceOptions,options?:DeviceOptions):Promise<BleDevice> {
        return new Promise((res,rej) => {
            this.client.requestDevice(request)
                .then((device) => {
                    this.devices[device.deviceId] = {device,options};
                    res(device);
                })
                .catch(rej);})
    }

    //connect after requesting using the options
    setupDevice = (device:BleDevice,options?:DeviceOptions):Promise<DeviceInfo> => {
        return new Promise(async (res,rej) => {
            this.devices[device.deviceId] = {device,options};
            this.client.connect(device.deviceId,options?.onDisconnect,options?.connectOptions).then(async () => {
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

    connect(device:BleDevice,options?:DeviceOptions):Promise<BleDevice> {
        return new Promise((res,rej) => {
            this.client.connect(device.deviceId,options?.onDisconnect,options?.connectOptions)
            .then(connected => {
                res(device); //connected
            }).catch(rej);});
    }

    reconnect(deviceId:string):Promise<BleDevice> {
        return new Promise((res,rej) => {this.client.getDevices([deviceId]).then(devices => {
            res(devices[0]);
        }).catch(rej)});
    }

    disconnect(device:BleDevice) {
        return this.client.disconnect(device.deviceId);
    }

    write(
        device:BleDevice, 
        service: string, 
        characteristic: string, 
        value: string|number|ArrayBufferLike|DataView|number[], 
        callback?:()=>void,
        options?: TimeoutOptions
    ) {  
        if(callback) {
            return this.client.write(device.deviceId,service,characteristic,BLEClient.toDataView(value)).then(callback);
        } else return this.client.writeWithoutResponse(device.deviceId,service,characteristic,BLEClient.toDataView(value),options);
    }

    read(
        device:BleDevice,
        service:string,
        characteristic:string,
        ondata?:(result:DataView)=>void,
        options?:TimeoutOptions
    ) {
        if(ondata) return this.client.read(device.deviceId, service, characteristic, options).then(ondata);
        else return this.client.read(device.deviceId, service, characteristic, options);
    }

    subscribe(
        device:BleDevice, 
        service:string, 
        characteristic:string, 
        ondata:(result:DataView)=>void
    ) { 
        return this.client.startNotifications(
            device.deviceId,
            service,
            characteristic,
            ondata
        );
    }

    unsubscribe(
        device:BleDevice, 
        service:string, 
        characteristic:string, 
    ) {
        return this.client.stopNotifications(
            device.deviceId,
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
        model?:string
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

    // convert values to data views if not, with some basic encoding formats
    static toDataView(value:string|number|ArrayBufferLike|DataView|number[]) {
        if(!(value instanceof DataView)) { //dataviews just wrap arraybuffers for sending packets  
            if(typeof value === 'string') {
                let enc = new TextEncoder();
                value = new DataView(enc.encode(value));
            } else if (typeof value === 'number') {
                let tmp = value;
                if(value < 256) { //it's a single byte being written most likely, this is just a 'dumb' attempt
                    value = new DataView(new ArrayBuffer(1));
                    value.setUint8(0,tmp);

                } else if(value < 65536) { //it's a single byte being written most likely, this is just a 'dumb' attempt
                    value = new DataView(new ArrayBuffer(2));
                    value.setInt16(0,tmp);
                } else {
                    value = new DataView(new ArrayBuffer(4));
                    value.setUint32(0,tmp);
                }
            } else if (value instanceof ArrayBuffer || value instanceof SharedArrayBuffer) {
                value = new DataView(value); 
            } else if(Array.isArray(value)) { //assume it's an array-defined uint8 byte buffer that we need to convert
                value = new DataView(Uint8Array.from(value));
            }
        }
        return value;
    }

    //search a buffer for matching indices. Can limit the number of indices to find if the buffer is giant but this allows asynchronous number crunching between buffers and outputs to build buffers and then parse through them from the stream
    static searchBuffer(buffer:number[]|ArrayBuffer, searchString:Uint8Array, limit?:number) {
        
		var needle = searchString
		var haystack = buffer;
		var search = BLEClient.boyerMoore(needle);
		var skip = search.byteLength;

        var indices:any[] = [];

		for (var i = search(haystack); i !== -1; i = search(haystack, i + skip)) {
			indices.push(i);
            if(limit) if(indices.length >= limit) break;
		}

        return indices;
    }

    //signed int conversions
    static bytesToInt16(x0:number,x1:number){
		let int16 = ((0xFF & x0) << 8) | (0xFF & x1);
		if((int16 & 0x8000) > 0) {
			int16 |= 0xFFFF0000; //js ints are 32 bit
		} else {
			int16 &= 0x0000FFFF;
		}
		return int16;
    }

    //turn 2 byte sequence (little endian input order) into a uint16 value
    static bytesToUInt16(x0:number,x1:number){
		return x0 * 256 + x1;
    }

    static Uint16ToBytes(y:number){ //Turns a 16 bit unsigned int into a 3 byte sequence
        return [y & 0xFF , (y >> 8) & 0xFF];
    }

	//signed int conversions
    static bytesToInt24(x0:number,x1:number,x2:number){ //Turns a 3 byte sequence into a 24 bit signed int value
        let int24 = ((0xFF & x0) << 16) | ((0xFF & x1) << 8) | (0xFF & x2);
		if((int24 & 0x800000) > 0) {
			int24 |= 0xFF000000; //js ints are 32 bit
		} else {
			int24 &= 0x00FFFFFF;
		}
		return int24;
    }

    static bytesToUInt24(x0:number,x1:number,x2:number){ //Turns a 3 byte sequence into a 24 bit uint
        return x0 * 65536 + x1 * 256 + x2;
    }

    static Uint24ToBytes(y:number){ //Turns a 24 bit unsigned int into a 3 byte sequence
        return [y & 0xFF , (y >> 8) & 0xFF , (y >> 16) & 0xFF];
    }
    
	//signed int conversion
    static bytesToInt32(x0:number,x1:number,x2:number,x3:number){ //Turns a 4 byte sequence into a 32 bit signed int value
        let int32 = ((0xFF & x0) << 24) | ((0xFF & x1) << 16) | ((0xFF & x2) << 8) | (0xFF & x3);
		if((int32 & 0x80000000) > 0) {
			int32 |= 0x00000000; //js ints are 32 bit
		} else {
			int32 &= 0xFFFFFFFF;
		}
		return int32;
    }

    static bytesToUInt32(x0:number,x1:number,x2:number,x3:number){ //Turns a 4 byte sequence into a 32 bit uint
        return x0 * 16777216 + x1 * 65536 + x2 * 256 + x3;
    }

    static Uint32ToBytes(y:number){ //Turns a 32 bit unsigned int into a 4 byte sequence
        return [y & 0xFF , (y >> 8) & 0xFF , (y >> 16) & 0xFF , (y >> 24) & 0xFF];
    }

    //converts a signed int into its two's compliment value for up to 32 bit numbers
    static get2sCompliment(
        val:number,
        nbits:number //e.g. 24 bit, 32 bit.
    ) {
        if(val > 4294967296) return null; //only up to 32 bit ints using js's built in int32 format
        return val << (32 - nbits) >> (32 - nbits); //bit-wise shift to get the two's compliment format of a value
    }

    //get any-sized signed int from an arbitrary byte array (little endian)
    static getSignedInt(...args:number[]) {

        let pos = 0;
        function getInt(size) {
            var value = 0;
            var first = true;
            while (size--) {
                if (first) {
                    let byte = args[pos++];
                    value += byte & 0x7f;
                    if (byte & 0x80) {
                        value -= 0x80;
                        // Treat most-significant bit as -2^i instead of 2^i
                    }
                    first = false;
                }
                else {
                    value *= 256;
                    value += args[pos++];
                }
            }
            return value;
        }

        return getInt(args.length)
    }

	//Boyer Moore fast byte search method copied from https://codereview.stackexchange.com/questions/20136/uint8array-indexof-method-that-allows-to-search-for-byte-sequences
	static asUint8Array(input) {
		if (input instanceof Uint8Array) {
			return input;
		} else if (typeof(input) === 'string') {
			// This naive transform only supports ASCII patterns. UTF-8 support
			// not necessary for the intended use case here.
			var arr = new Uint8Array(input.length);
			for (var i = 0; i < input.length; i++) {
			var c = input.charCodeAt(i);
			if (c > 127) {
				throw new TypeError("Only ASCII patterns are supported");
			}
			arr[i] = c;
			}
			return arr;
		} else {
			// Assume that it's already something that can be coerced.
			return new Uint8Array(input);
		}
	}

	static boyerMoore(patternBuffer):any {
		// Implementation of Boyer-Moore substring search ported from page 772 of
		// Algorithms Fourth Edition (Sedgewick, Wayne)
		// http://algs4.cs.princeton.edu/53substring/BoyerMoore.java.html
		/*
		USAGE:
			// needle should be ASCII string, ArrayBuffer, or Uint8Array
			// haystack should be an ArrayBuffer or Uint8Array
			var search = boyerMoore(needle);
			var skip = search.byteLength;
			var indices = [];
			for (var i = search(haystack); i !== -1; i = search(haystack, i + skip)) {
				indices.push(i);
			}
		*/
		var pattern = BLEClient.asUint8Array(patternBuffer);
		var M = pattern.length;
		if (M === 0) {
			throw new TypeError("patternBuffer must be at least 1 byte long");
		}
		// radix
		var R = 256;
		var rightmost_positions = new Int32Array(R);
		// position of the rightmost occurrence of the byte c in the pattern
		for (var c = 0; c < R; c++) {
			// -1 for bytes not in pattern
			rightmost_positions[c] = -1;
		}
		for (var j = 0; j < M; j++) {
			// rightmost position for bytes in pattern
			rightmost_positions[pattern[j]] = j;
		}
		var boyerMooreSearch = (txtBuffer, start?, end?) => {
			// Return offset of first match, -1 if no match.
			var txt = BLEClient.asUint8Array(txtBuffer);
			if (start === undefined) start = 0;
			if (end === undefined) end = txt.length;
			var pat = pattern;
			var right = rightmost_positions;
			var lastIndex = end - pat.length;
			var lastPatIndex = pat.length - 1;
			var skip;
			for (var i = start; i <= lastIndex; i += skip) {
				skip = 0;
				for (var j = lastPatIndex; j >= 0; j--) {
				var c = txt[i + j];
				if (pat[j] !== c) {
					skip = Math.max(1, j - right[c]);
					break;
				}
				}
				if (skip === 0) {
				    return i;
				}
			}
			return -1;
		};

        (boyerMooreSearch as any).byteLength = pattern.byteLength
		return boyerMooreSearch;
	}
	//---------------------end copy/pasted solution------------------------

}