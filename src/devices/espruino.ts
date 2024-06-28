import {BLEDeviceSettings} from './types'

export const NORDIC_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
export const NORDIC_TX = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
export const NORDIC_RX = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

let defaultChunkSize = 128; //3 less than max chunk size. nrf52 buffer size is 250

export const espruinocodec = (data:DataView) => { //utf8 buffer
    let decoded = new Uint8Array(data.buffer);    
    if(decoded.length > defaultChunkSize) defaultChunkSize = decoded.length;
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
    return new DataView(buf);
}

export async function writeEspruinoCommand(device, command:string, chunkSize=defaultChunkSize, chunkDelay=10, addEndline=true) {
    
    await device.write({
        service:NORDIC_SERVICE, 
        characteristic:NORDIC_TX, 
        data:str2ab(`${command}${addEndline ? '\n' : ''}`), 
        chunkSize,
        chunkDelay
    }); 
}

//e.g. https://www.espruino.com/Bangle.js+Data+Streaming
export async function uploadEspruinoCode(
    device, 
    ESPRUINO_CODE:string,
    chunkSize:number=defaultChunkSize //default MTU on browser and android is 512, it's 20 on WebBLE for android but we aren't using that. 
) {

    console.log("Writing reset operation");

    await device.write({
        service:NORDIC_SERVICE, 
        characteristic:NORDIC_TX, 
        data:str2ab("reset();\n"), 
        chunkSize
    }); 
    
    console.log("Writing program to device.");

    await device.write({
        service:NORDIC_SERVICE, 
        characteristic:NORDIC_TX, 
        data:str2ab(`\x03\x10if(1){"${ESPRUINO_CODE}"}\n`), 
        chunkSize
    });

    return;
}

//make a selector with this and modify namePrefix to scan for the specific device
export const espruinoNames = [
    'Bangle.js',
    'Puck.js',
    'Pixi.js',
    'Jolt.js',
    'MDBT42Q',
    'Espruino'
];


//you'll have to set the namePrefix since the filters don't do squat on capacitor
export const espruinoBLESettings = {
    deviceType:'BLE',
    deviceName:'espruino',
    namePrefix:'Bangle.js', //replace namePrefix with the device you wnat to isolate
    // filters:[
    //     { namePrefix: 'Puck.js' },
    //     { namePrefix: 'Pixl.js' },
    //     { namePrefix: 'Jolt.js' },
    //     { namePrefix: 'MDBT42Q' },
    //     { namePrefix: 'Bangle.js' },
    //     { namePrefix: 'Espruino' },
    //     { services: [ NORDIC_SERVICE ] }
    // ],
    services:{
        [NORDIC_SERVICE]:{
            [NORDIC_TX]:{
                write:undefined
            },
            [NORDIC_RX]:{
                notify:true,
                codec:espruinocodec
            }
        }
    }
} as BLEDeviceSettings;