/// <reference types="dom-serial" />
import { bitflippin } from '../util/bitflippin';
export declare type SerialPortOptions = {
    baudRate?: number;
    stopBits?: 1 | 2 | number;
    parity?: 'none' | 'even' | 'odd' | ParityType;
    bufferSize?: number;
    flowControl?: 'none' | 'hardware' | FlowControlType;
    onconnect?: (port: SerialPort) => void;
    ondisconnect?: (ev: any) => void;
};
export declare type SerialStreamProps = {
    _id?: string;
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
    buffering?: {
        searchBytes?: Uint8Array;
        buffer?: any[];
        locked?: boolean;
        lockIdx?: number;
    } | boolean;
};
export declare type SerialStreamInfo = {
    _id: string;
    port: SerialPort;
    info: Partial<SerialPortInfo>;
    reader: ReadableStreamDefaultReader<any>;
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
    buffering?: {
        searchBytes?: Uint8Array;
        buffer?: any[];
        locked?: boolean;
        lockIdx?: number;
    };
    frequency: number;
    ondata: (value: any) => void;
    running: boolean;
    [key: string]: any;
};
export declare class WebSerial extends bitflippin {
    streams: {
        [key: string]: SerialStreamInfo;
    };
    getPorts(): Promise<SerialPort[]>;
    requestPort(usbVendorId?: number, usbProductId?: number): Promise<SerialPort>;
    openPort(port: SerialPort, options?: SerialPortOptions): Promise<void>;
    readWithTimeout(port: SerialPort, timeout: number): Promise<ReadableStreamDefaultReadResult<any>>;
    writePort(port: SerialPort, message: any): Promise<boolean>;
    getSignals(port: SerialPort): any;
    setSignals(port: SerialPort, signals: any): any;
    createStream: (options: SerialStreamProps) => SerialStreamInfo;
    readStream(stream: SerialStreamInfo): SerialStreamInfo;
    writeStream(stream: SerialStreamInfo | string, message: any): any;
    closeStream(stream: SerialStreamInfo | string, onclose?: (info: SerialStreamInfo) => void): Promise<boolean>;
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
}