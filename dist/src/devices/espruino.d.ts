import { BLEDeviceSettings } from './types';
export declare const NORDIC_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
export declare const NORDIC_TX = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
export declare const NORDIC_RX = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
export declare const espruinocodec: (data: DataView) => {
    output: Uint8Array;
};
export declare function ab2str(buf: ArrayBufferLike): string;
export declare function str2ab(str: string): DataView;
export declare function writeEspruinoCommand(device: any, command: string, chunkSize?: number, addEndline?: boolean): Promise<void>;
export declare function uploadEspruinoCode(device: any, ESPRUINO_CODE: string, chunkSize?: number): Promise<void>;
export declare const espruinoNames: string[];
export declare const espruinoBLESettings: BLEDeviceSettings;
