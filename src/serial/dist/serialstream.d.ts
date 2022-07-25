/// <reference types="dom-serial" />
export declare type StreamInfo = {
    _id: string;
    port: SerialPort;
    info: Partial<SerialPortInfo>;
    reader: ReadableStreamDefaultReader<any>;
    writer: WritableStreamDefaultWriter<any>;
    transforms?: {
        [key: string]: {
            transform: TransformerTransformCallback<DataView, any>;
            start?: TransformerStartCallback<any>;
            flush?: TransformerFlushCallback<any>;
            writableStrategy?: QueuingStrategy<DataView>;
            readableStrategy?: QueuingStrategy<DataView>;
            streamPipeOptions?: StreamPipeOptions;
        } | TransformStream;
    };
    frequency: number;
    ondata: (value: any) => void;
    running: boolean;
};
export declare class WebSerial {
    streams: {
        [key: string]: StreamInfo;
    };
    constructor();
    getPorts(): Promise<SerialPort[]>;
    requestPort(usbVendorId: number, usbProductId: number): Promise<SerialPort>;
    openPort(port: SerialPort, options?: {
        baudRate?: number;
        stopBits?: 1 | 2;
        parity?: 'none';
        'even': any;
        'odd': any;
        bufferSize?: number;
        flowControl?: 'none' | 'hardware';
        onconnect?: (ev: any) => void;
        ondisconnect?: (ev: any) => void;
    }): Promise<void>;
    readWithTimeout(port: SerialPort, timeout: number): Promise<ReadableStreamDefaultReadResult<any>>;
    writePort(port: SerialPort, message: any): Promise<boolean>;
    getSignals(port: SerialPort): any;
    setSignals(port: SerialPort, signals: any): any;
    createStream(options: {
        port: SerialPort;
        frequency: number;
        ondata: (value: any) => void;
        transforms?: {
            [key: string]: {
                transform: TransformerTransformCallback<DataView, any>;
                start?: TransformerStartCallback<any>;
                flush?: TransformerFlushCallback<any>;
                writableStrategy?: QueuingStrategy<DataView>;
                readableStrategy?: QueuingStrategy<DataView>;
                streamPipeOptions?: StreamPipeOptions;
            } | TransformStream;
        };
    }): any;
    readStream(stream: StreamInfo): StreamInfo;
    writeStream(stream: StreamInfo, message: any): Promise<void>;
    endStream(stream: StreamInfo, onclose: (info: StreamInfo) => void): void;
    static setStreamTransforms(stream: ReadableStream, transforms: {
        [key: string]: {
            transform: TransformerTransformCallback<DataView, any>;
            start?: TransformerStartCallback<any>;
            flush?: TransformerFlushCallback<any>;
            writableStrategy?: QueuingStrategy<DataView>;
            readableStrategy?: QueuingStrategy<DataView>;
            streamPipeOptions?: StreamPipeOptions;
        } | TransformStream;
    }): ReadableStream<any>;
    static toDataView(value: string | number | ArrayBufferLike | DataView | number[]): DataView;
    static searchBuffer(buffer: number[] | ArrayBuffer, searchString: Uint8Array, limit?: number): any[];
    static bytesToInt16(x0: number, x1: number): number;
    static bytesToUInt16(x0: number, x1: number): number;
    static Uint16ToBytes(y: number): number[];
    static bytesToInt24(x0: number, x1: number, x2: number): number;
    static bytesToUInt24(x0: number, x1: number, x2: number): number;
    static Uint24ToBytes(y: number): number[];
    static bytesToInt32(x0: number, x1: number, x2: number, x3: number): number;
    static bytesToUInt32(x0: number, x1: number, x2: number, x3: number): number;
    static Uint32ToBytes(y: number): number[];
    static get2sCompliment(val: number, nbits: number): number;
    static getSignedInt(...args: number[]): number;
    static asUint8Array(input: any): Uint8Array;
    static boyerMoore(patternBuffer: any): any;
}
