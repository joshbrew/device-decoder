/// <reference types="dom-serial" />
import { WorkerInfo } from 'graphscript';
import { FilterSettings } from './util/BiquadFilters';
export declare function loadStreamWorkerGlobals(): void;
export declare const streamWorkerRoutes: {
    transferDevice: (device: {
        [key: string]: any;
    }, worker: WorkerInfo) => void;
    receiveDevice: (device: {
        [key: string]: any;
    }) => void;
    receiveDecoder: (decoder: any, decoderName: string) => void;
    receiveCodec: (decoder: any, deviceType: 'BLE' | 'USB' | 'BLE_CUSTOM' | 'USB_CUSTOM' | 'CUSTOM', device: string, service?: string, characteristic?: string) => void;
    decode: (data: any) => any;
    decodeAndParse: (data: any) => any;
    setActiveDecoder: (deviceType: 'BLE' | 'USB' | 'BLE_CUSTOM' | 'USB_CUSTOM' | 'CUSTOM', device: string, service?: string, characteristic?: string) => boolean;
    decodeDevice: (data: any, deviceType: 'BLE' | 'USB' | 'CUSTOM_BLE' | 'CUSTOM_USB' | 'CUSTOM', device: string, service?: string, characteristic?: string) => any;
    decodeAndParseDevice: (data: any, deviceType: 'BLE' | 'USB' | 'CUSTOM_BLE' | 'CUSTOM_USB' | 'CUSTOM', deviceName: string, service?: string, characteristic?: string) => any;
    toggleAnim: () => any;
    setFilters: (filters: {
        [key: string]: FilterSettings;
    }, clearFilters?: boolean) => boolean;
    getFilterSettings: () => {};
    setupSerial: () => boolean;
    openPort: (settings: SerialOptions & {
        usbVendorId: number;
        usbProductId: number;
        pipeTo?: string | {
            route: string;
            _id: string;
            extraArgs: any[];
        };
        pipeMain?: boolean;
        frequency?: number;
        buffering?: {
            searchBytes: Uint8Array;
        };
    }) => Promise<unknown>;
    closeStream: (streamId: any) => Promise<unknown>;
    writeStream: (streamId: any, message: any) => boolean;
    updateStreamSettings: (streamId: string, settings: any) => void;
};
