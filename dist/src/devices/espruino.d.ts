import { BLEDeviceSettings } from './types';
export declare const NORDIC_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
export declare const NORDIC_TX = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
export declare const NORDIC_RX = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
export declare const espruinocodec: (data: DataView) => {
    output: Uint8Array;
};
export declare function ab2str(buf: ArrayBufferLike): string;
export declare function str2ab(str: string): DataView;
export declare function writeEspruinoCommand(device: any, command: string, chunkSize?: number, chunkDelay?: number, addEndline?: boolean): Promise<void>;
export declare function resetBangleJSSettings(device: any): Promise<void>;
export declare function uploadEspruinoFile(device: any, ESPRUINO_CODE: any, chunkSize?: number, // Adjust chunk size as needed
chunkDelay?: number, onProgress?: any, fileName?: string, // Default filename
loadFile?: boolean, //load after saving for a program
progressPingback?: boolean): Promise<void>;
export declare function uploadEspruinoBootCode(device: any, ESPRUINO_CODE: any, chunkSize?: number, // Default MTU on browser and Android is 512, it's 20 on WebBLE for Android but we aren't using that.
chunkDelay?: number, isFlashPersistent?: boolean, onProgress?: any): Promise<void>;
export declare function uploadEspruinoCode(device: any, ESPRUINO_CODE: string, chunkSize?: number, //default MTU on browser and android is 512, it's 20 on WebBLE for android but we aren't using that. 
chunkDelay?: number, onProgress?: (progress: number) => void): Promise<void>;
export declare const espruinoNames: string[];
export declare const espruinoBLESettings: BLEDeviceSettings;
