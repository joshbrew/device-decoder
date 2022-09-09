import { ByteParser } from '../util/ByteParser';
//Joshua Brewster. AGPL v3.0

//Wrapper for
//https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API

export type SerialPortOptions = {
    baudRate?:number,
    stopBits?:1|2|number,
    parity?:'none'|'even'|'odd'|ParityType,
    bufferSize?:number,
    flowControl?:'none'|'hardware'|FlowControlType,
    onconnect?:(port:SerialPort)=>void,
    ondisconnect?:(ev)=>void
}

export type SerialStreamProps = {
    _id?:string,
    port:SerialPort,
    settings:SerialPortOptions,
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
    },
    buffering?:{ //if defined the data will be buffered and a search applied to pass differentiable lines to ondata e.g. \r\n
        searchBytes?:Uint8Array, //
        buffer?:any[], //byte buffer
        locked?:boolean, //locked on to search byte intervals?
        lockIdx?:number //first found search buffer to lock onto stream
    }|boolean
}

export type SerialStreamInfo = {
    _id:string,
    port:SerialPort,
    settings:SerialPortOptions,
    info:Partial<SerialPortInfo>,
    reader:ReadableStreamDefaultReader<any>,
    //writer:WritableStreamDefaultWriter<any>,
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
    buffering?:{ //if defined the data will be buffered and a search applied to pass differentiable lines to ondata e.g. \r\n
        searchBytes?:Uint8Array, //
        buffer?:any[], //byte buffer
        locked?:boolean, //locked on to search byte intervals?
        lockIdx?:number //first found search buffer to lock onto stream
    }
    frequency:number, //read frequency, just a setTimeout after every read finishes to allow coroutines to do their thing as the .read call will await to receive and block the app if not on its own thread
    ondata:(value:any)=>void,
    running:boolean,
    [key:string]:any
}

export class WebSerial extends ByteParser {

    streams:{[key:string]:SerialStreamInfo} = {}


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
        options?:SerialPortOptions
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
        options:SerialStreamProps
    ) => {

        let stream:any = {
            _id:options._id ? options._id : `stream${Math.floor(Math.random()*1000000000000000)}`,
            info:options.port.getInfo(),
            running:false,
            ...options
        } as SerialStreamInfo;

        if(options.port?.readable) {
            if(options.transforms) {
                stream.reader = WebSerial.setStreamTransforms(options.port.readable, options.transforms).getReader();
            }
            else {
                stream.reader = options.port.readable.getReader();
            }
        }
        // if(options.port?.writable) {
        //     stream.writer = options.port.writable.getWriter();
        // }

        this.streams[stream._id] = stream;

        return stream as SerialStreamInfo;
    }

    readStream(
        stream:SerialStreamInfo
    ) {

        if(stream.reader && !stream.running) {
            let reader = stream.reader;
            if(stream.buffering) { 
                if(typeof stream.buffering !== 'object') stream.buffering = {};
                if(!stream.buffering.buffer) { stream.buffering.buffer = []; }
                if(!stream.buffering.searchBytes) stream.buffering.searchBytes = new Uint8Array([0x0D,0x0A]); // \r\n default newline
            }

            let readLoop = () => {
                if(stream.port.readable && stream.running) {
                    reader.read().then((result:ReadableStreamReadResult<any>) => {

                        if(result.done) reader.releaseLock() //enables port closing
                        else {

                            if(stream.buffering) { //perform a boyer moore search to lock onto newlines or stop codes or whatever pattern buffer provided
                                stream.buffering.buffer.push(...result.value); //could be faster to concat typed arrays? else they require fixed sizes so not great for dynamic buffering, but maybe better to limit memory use (need to bench) //https://www.voidcanvas.com/javascript-array-evolution-performance/

                                const needle = stream.buffering.searchBytes
                                const haystack = stream.buffering.buffer;
                                const search = WebSerial.boyerMoore(needle);
                                const skip = search.byteLength;
                                let nextIndex = -1;

                                for (var i = search(haystack); i !== -1; i = search(haystack, i + skip)) {
                                    if(!stream.buffering.locked && !('lockIdx' in stream.buffering)) stream.buffering.lockIdx = i;
                                    else {
                                        nextIndex = i;
                                        if(nextIndex >= 0) {
                                            if(!stream.buffering.locked) {
                                                stream.ondata(new Uint8Array(stream.buffering.buffer.splice(stream.buffering.lockIdx+stream.buffering.searchBytes.length,nextIndex+stream.buffering.searchBytes.length))); 
                                                stream.buffering.buffer.splice(0,stream.buffering.searchBytes.length); //splice off the front pattern buffer bytes and assume every next section defined by nextIndex is a target section
                                                stream.buffering.locked = true;
                                            }
                                            else if(nextIndex > 0) {
                                                stream.ondata(new Uint8Array(stream.buffering.buffer.splice(stream.buffering.searchBytes.length,nextIndex)));
                                            }
                                            
                                        }
                                    }
                                }
                            } else stream.ondata(result.value);

                            setTimeout(()=> {
                                readLoop();
                            },stream.frequency);
                        }
                    }).catch((er:Error) => {
                        console.error(stream._id, ' Read error:', er)
                        if(er.message.includes('overrun') || er.message.includes('framing')) {
                            delete stream.reader;
                            this.reconnect(stream);
                        }
                    })
                } else if (!stream.running && stream.port.readable) {
                    try{ 
                        reader.releaseLock();
                    } catch(er){ 
                        console.error(er); 
                    }
                }
            }


            stream.running = true;
            readLoop(); //start reading

            return stream;
        } return undefined;

    }

    //use this on an active stream instead of writePort
    writeStream(stream:SerialStreamInfo|string, message:any) {
        if(typeof stream === 'string') stream = this.streams[stream];
        if(stream.port.writable) {
            let writer = stream.port.writable.getWriter();
            writer.write(WebSerial.toDataView(message));
            writer.releaseLock();
            return true;
        } return undefined;
    }

    closeStream(
        stream:SerialStreamInfo|string,
        onclose?:(info:SerialStreamInfo)=>void
    ):Promise<boolean> {
        if(typeof stream === 'string') stream = this.streams[stream] as SerialStreamInfo;
        stream.running = false;
        
        return new Promise((res,rej) => {
            setTimeout(async ()=>{
                if((stream as SerialStreamInfo).port.readable && (stream as SerialStreamInfo).reader) {
                    try {
                        (stream as SerialStreamInfo).reader.releaseLock()
                    } catch(er) {console.error(er)}
                    if((stream as SerialStreamInfo).transforms) try {
                        await (stream as SerialStreamInfo).reader.cancel() 
                    } catch(err) {console.error(err)}
                }
                // if((stream as StreamInfo).port.writable && (stream as StreamInfo).writer) {
                //     try { 
                //         (stream as StreamInfo).writer.releaseLock();
                //         await (stream as StreamInfo).writer.close()
                //     } catch(er) {}
                // }
                try {
                    await (stream as SerialStreamInfo).port.close().then(()=>{
                        if(onclose) onclose(this.streams[(stream as SerialStreamInfo)._id])}
                    ); 
                    delete this.streams[(stream as SerialStreamInfo)._id];
                    res(true);
                } catch(er) { 
                    rej(er); 
                }
                },
                300
            );
    
        })
    }

    //reconnect to a stream using existing options
    reconnect(
        stream:SerialStreamInfo|string,
        options?:SerialStreamProps
    ):Promise<SerialStreamInfo> {

        if(typeof stream === 'string') stream = this.streams[stream];

        return new Promise((res,rej) => {
            if(typeof stream !== 'object') {
                rej(undefined);
                return;
            }

            let info = stream.port.getInfo();

            this.closeStream(stream._id).then((closed) => {
                setTimeout(() => {
                    this.getPorts().then((ports) => {
                        for(let i = 0; i < ports.length; i++) {
                            if(ports[i].getInfo().usbVendorId === info.usbVendorId && ports[i].getInfo().usbProductId === info.usbProductId) {
                                if(!options) options = stream as any;
                                else options._id = (stream as SerialStreamInfo)._id;
                                delete options.port;
                                this.openPort(ports[i], options.settings).then(() => {
                                    const stream = this.createStream(
                                        {
                                            ...options,
                                            port:ports[i]
                                        }
                                    );
    
                                    this.readStream(stream);
    
                                    res(stream);
                                }).catch(rej)
                            }   
                        }
                    }).catch(rej);
                },100);
            })
        });
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


}