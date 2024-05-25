import {BLEDeviceSettings} from './types'

export const NORDIC_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
export const NORDIC_TX = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
export const NORDIC_RX = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

let defaultChunkSize = 512;

export const espruinocodec = (data:DataView) => { //utf8 buffer
    let decoded = new Uint8Array(data.buffer);    
    defaultChunkSize = decoded.length;
    return {
        output:decoded //use str2ab on output for string outputs
    };
}

const decoder = new TextDecoder();
//read strings
export function ab2str(buf:ArrayBufferLike) {
    return decoder.decode(buf);
}

//write
export function str2ab(str:string) {
    var buf = new ArrayBuffer(str.length);
    var bufView = new Uint8Array(buf);
    for (var i=0, strLen=str.length; i<strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

//e.g. https://www.espruino.com/Bangle.js+Data+Streaming
export async function uploadCode(
    device, 
    ESPRUINO_CODE:string,
    chunkSize:number=defaultChunkSize //default MTU on browser and android is 512, it's 20 on WebBLE for android but we aren't using that. 
) {

    device.write({
        service:NORDIC_SERVICE, 
        characteristic:NORDIC_TX, 
        data:str2ab("reset();\n"), 
        chunkSize
    }); 
    
    const data = str2ab(`\x03\x10if(1){"${ESPRUINO_CODE}"}\n`);
    device.write({
        service:NORDIC_SERVICE, 
        characteristic:NORDIC_TX, 
        data, 
        chunkSize
    });
}

export const espruinoBLESettings = {
    deviceType:'BLE',
    deviceName:'espruino',
    filters:[
        { namePrefix: 'Puck.js' },
        { namePrefix: 'Pixl.js' },
        { namePrefix: 'Jolt.js' },
        { namePrefix: 'MDBT42Q' },
        { namePrefix: 'Bangle.js' },
        { namePrefix: 'Espruino' },
        { services: [ NORDIC_SERVICE ] }
    ],
    services:{
        [NORDIC_SERVICE]:{
            [NORDIC_TX]:{
                write:undefined
            },
            [NORDIC_RX]:{
                codec:espruinocodec
            }
        }
    }
} as BLEDeviceSettings;