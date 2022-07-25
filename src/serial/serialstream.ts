//Joshua Brewster. AGPL v3.0

//Wrapper for
//https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API


export type StreamInfo = {
    _id:string,
    port:SerialPort,
    info:Partial<SerialPortInfo>,
    reader:ReadableStreamDefaultReader<any>,
    writer:WritableStreamDefaultWriter<any>,
    transforms?:{
        [key:string]:{
            transform:TransformerTransformCallback<DataView, any>,
            start?:TransformerStartCallback<any>,
            flush?:TransformerFlushCallback<any>,
            writableStrategy?:QueuingStrategy<DataView>,
            readableStrategy?:QueuingStrategy<DataView>,
            streamPipeOptions?:StreamPipeOptions 
        }|TransformStream
    },
    frequency:number, //read frequency, just a setTimeout after every read finishes to allow coroutines to do their thing as the .read call will await to receive and block the app if not on its own thread
    ondata:(value:any)=>void,
    running:boolean
}

export class WebSerial {

    streams:{[key:string]:StreamInfo} = {}

    constructor() { }

    getPorts() {
        return navigator.serial.getPorts();
    }

    requestPort(
        usbVendorId?:number, 
        usbProductId?:number,
    ) {
        let options:any = {}
        if(usbVendorId) {
            options.usbVendorId = usbVendorId;
        }
        if(usbProductId) {
            options.usbProductId = usbProductId;
        }

        
        if(options.usbVendorId)
            return navigator.serial.requestPort({filters:[options]})
        else
            return navigator.serial.requestPort()
    }

    openPort(
        port:SerialPort, 
        options?:{
            baudRate?:number,
            stopBits?:1|2,
            parity?:'none'|'even'|'odd',
            bufferSize?:number,
            flowControl?:'none'|'hardware',
            onconnect?:(port:SerialPort)=>void,
            ondisconnect?:(ev)=>void
        }
    ) {

        if(options) options = Object.assign({},options);

        if((options as any)?.ondisconnect) {
            port.ondisconnect = (options as any).ondisconnect;
            delete (options as any).ondisconnect;
        }

        return port.open(options as SerialOptions).then(()=>{
            if(options?.onconnect) options.onconnect(port);
        });
    }

    //https://wicg.github.io/serial/#readable-attribute
    async readWithTimeout(port:SerialPort, timeout:number) {
        const reader = port.readable.getReader();
        const timer = setTimeout(() => {
          reader.releaseLock();
        }, timeout);
        const result = await reader.read();
        clearTimeout(timer);
        reader.releaseLock();
        return result;
    }

    //write a port with a one-off writer.
    async writePort(port:SerialPort,message:any) {
        const writer = port.writable.getWriter();
        await writer.write(WebSerial.toDataView(message));
        writer.releaseLock();
        return true;
    }

    //new functionality
    getSignals(port:SerialPort) {
        return (port as any).getSignals()
    }

    setSignals(port:SerialPort, signals:any) {
        return (port as any).setSignals(signals);
    }

    //get the readable/writable streams from the ports and set up optional transforms
    createStream = (
        options:{
            port:SerialPort,
            frequency:number,
            ondata:(value:any)=>void, 
            transforms?:{
                [key:string]:{
                    transform:TransformerTransformCallback<DataView, any>,
                    start?:TransformerStartCallback<any>,
                    flush?:TransformerFlushCallback<any>,
                    writableStrategy?:QueuingStrategy<DataView>,
                    readableStrategy?:QueuingStrategy<DataView>,
                    streamPipeOptions?:StreamPipeOptions 
                }|TransformStream
            }
        }
    ) => {

        let stream:any = {
            _id:`stream${Math.floor(Math.random()*1000000000000000)}`,
            info:options.port.getInfo(),
            running:false,
            ...options
        } as StreamInfo;

        if(options.port?.readable) {
            if(options.transforms) {
                stream.reader = WebSerial.setStreamTransforms(options.port.readable, options.transforms).getReader();
            }
            else {
                stream.reader = options.port.readable.getReader();
            }
        }
        if(options.port?.writable) {
            stream.writer = options.port.writable.getWriter();
        }

        this.streams[stream._id] = stream;

        return stream as StreamInfo;
    }

    readStream(
        stream:StreamInfo
    ) {

        if(stream.reader && !stream.running) {
            let reader = stream.reader;

            let readLoop = () => {
                if(stream.port.readable && stream.running) {
                    reader.read().then((result:ReadableStreamReadResult<any>) => {

                        if(result.done) reader.releaseLock() //enables port closing
                        else {
                            
                            stream.ondata(result.value);

                            setTimeout(()=> {
                                readLoop();
                            },stream.frequency);
                        }
                    })
                } else if (!stream.running && stream.port.readable) {
                    try{ reader.releaseLock();
                    } catch(er){ console.error(er); }
                }
            }


            stream.running = true;
            readLoop(); //start reading

            return stream;
        } return undefined;

    }

    //use this on an active stream instead of writePort
    writeStream(stream:StreamInfo, message:any) {
        if(stream.writer) {
            return stream.writer.write(WebSerial.toDataView(message));
        } return undefined;
    }

    endStream(
        stream:StreamInfo,
        onclose:(info:StreamInfo)=>void
    ) {

        stream.running = false;
        setTimeout(async ()=>{
                if(stream.port.readable) {
                    try {
                        stream.reader.releaseLock()
                        await stream.reader.cancel()
                    } catch(er) {}
                }
                if(stream.port.writable) {
                    try {
                        stream.writer.releaseLock();
                        await stream.writer.close()
                    } catch(er) {}
                }
                try {
                    await stream.port.close().then(()=>{onclose(this.streams[stream._id])});
                } catch(er) {}
            },
            stream.frequency
        );

        delete this.streams[stream._id];
    }

    static setStreamTransforms(
        stream:ReadableStream,
        transforms:{
            [key:string]:{
                transform:TransformerTransformCallback<DataView, any>,
                start?:TransformerStartCallback<any>,
                flush?:TransformerFlushCallback<any>,
                writableStrategy?:QueuingStrategy<DataView>,
                readableStrategy?:QueuingStrategy<DataView>,
                streamPipeOptions?:StreamPipeOptions 
            }|TransformStream
        }
    ) {
        let transform:TransformStream[] = [];
        Object.keys(transforms).forEach((t:string) => {
            let opt = (transforms as any)[t];
            if(opt instanceof TransformStream) {
                transform.push(opt)
            } else {
                if(!opt.start) opt.start = function start() {};
                if(!opt.flush) opt.flush = function flush() {};

                let transformer = new TransformStream(
                    {
                        start:opt.start,
                        transform:opt.transform,
                        flush:opt.flush
                    }, 
                    opt.writableStrategy, 
                    opt.readableStrategy
                );

                transform.push(transformer);
            }
        });

        let str = stream;
        transform.forEach((transform) => {
            str = str.pipeThrough(transform);
        });

        return str;
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
		var search = WebSerial.boyerMoore(needle);
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
		var pattern = WebSerial.asUint8Array(patternBuffer);
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
			var txt = WebSerial.asUint8Array(txtBuffer);
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