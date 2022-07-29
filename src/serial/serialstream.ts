import { bitflippin } from '../bitflippin';
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

export class WebSerial extends bitflippin {

    streams:{[key:string]:StreamInfo} = {}


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
            stopBits?:1|2|number,
            parity?:'none'|'even'|'odd'|ParityType,
            bufferSize?:number,
            flowControl?:'none'|'hardware'|FlowControlType,
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
            },
            buffering?:{ //if defined the data will be buffered and a search applied to pass differentiable lines to ondata e.g. \r\n
                searchBytes?:Uint8Array, //
                buffer?:any[], //byte buffer
                locked?:boolean, //locked on to search byte intervals?
                lockIdx?:number //first found search buffer to lock onto stream
            }|boolean
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
            if(stream.buffering) { 
                if(typeof stream.buffering !== 'object') stream.buffering = {};
                if(stream.buffering.buffer) {
                    stream.buffering.buffer = [];
                    if(!stream.buffering.searchBytes) stream.buffering.searchBytes = new Uint8Array([0x0D,0x0A]); // \r\n default newline
                }
            }

            let readLoop = () => {
                if(stream.port.readable && stream.running) {
                    reader.read().then((result:ReadableStreamReadResult<any>) => {

                        if(result.done) reader.releaseLock() //enables port closing
                        else {

                            if(stream.buffering) { //perform a boyer moore search to lock onto newlines or stop codes or whatever pattern buffer provided
                                stream.buffering.buffer.push(...result.value);

                                var needle = stream.buffering.searchBytes
                                var haystack = stream.bufferering.buffer;
                                var search = WebSerial.boyerMoore(needle);
                                var skip = search.byteLength;
                                var nextIndex = 0;

                                for (var i = search(haystack); i !== -1; i = search(haystack, i + skip)) {
                                    if(!stream.buffering.locked && !('lockIdx' in stream.buffering)) stream.buffering.lockIdx = i;
                                    else {
                                        nextIndex = i;
                                        break;
                                    }
                                }
                                if(nextIndex > 0) {
                                    if(!stream.buffering.locked) {
                                        stream.ondata(stream.buffering.buffer.splice(stream.buffering.lockIdx+stream.buffering.searchBytes.length,nextIndex+stream.buffering.searchBytes.length)); 
                                        stream.buffering.buffer.splice(0,stream.buffering.searchBytes.length);
                                        stream.buffering.locked = true;
                                    }
                                    else {
                                        stream.ondata(stream.buffering.buffer.splice(0,nextIndex));
                                    }
                                    
                                }
                            } else stream.ondata(result.value);

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

    closeStream(
        stream:StreamInfo,
        onclose?:(info:StreamInfo)=>void
    ) {

        stream.running = false;
        return new Promise((res,rej) => {
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
                    await stream.port.close().then(()=>{if(onclose) onclose(this.streams[stream._id])});
                } catch(er) { rej(er); }
                delete this.streams[stream._id];
                res(true);
                },
                stream.frequency
            );
    
        })
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