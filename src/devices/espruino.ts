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
        data:str2ab(`\x10${command}${addEndline ? '\n' : ''}`), 
        chunkSize:chunkSize,
        chunkDelay:chunkDelay
    }); 
}

//require('Storage').erase('setting.json');load()\n" //reset device settings


export async function resetBangleJSSettings(device) {
    return writeEspruinoCommand(device, `require('Storage').erase('setting.json');load()`);
}



//from espruino code
function toJSONishString(txt) {
    let js = "\"";
    for (let i=0;i<txt.length;i++) {
      let ch = txt.charCodeAt(i);
      let nextCh = (i+1<txt.length ? txt.charCodeAt(i+1) : 0); // 0..255
      if (ch<8) {
          // if the next character is a digit, it'd be interpreted
          // as a 2 digit octal character, so we can't use `\0` to escape it
          if (nextCh>='0'.charCodeAt(0) && nextCh<='7'.charCodeAt(0)) js += "\\x0"+ch;
          else js += "\\"+ch;
      } else if (ch==8) js += "\\b";
      else if (ch==9) js += "\\t";
      else if (ch==10) js += "\\n";
      else if (ch==11) js += "\\v";
      else if (ch==12) js += "\\f";
      else if (ch==34) js += "\\\""; // quote
      else if (ch==92) js += "\\\\"; // slash
      else if (ch<32 || ch==127 || ch==173 ||
               ((ch>=0xC2) && (ch<=0xF4))) // unicode start char range
          js += "\\x"+ ((ch & 255) | 256).toString(16).substring(1);
      else if (ch>255)
          js += "\\u"+ ((ch & 65535) | 65536).toString(16).substring(1);
      else js += txt[i];
    }
    js += "\"";
    //let b64 = "atob("+JSON.stringify(Espruino.Core.Utils.btoa(txt))+")";
    return js;
  }


  export async function uploadEspruinoFile(
    device,
    ESPRUINO_CODE,
    chunkSize = defaultChunkSize, // Adjust chunk size as needed
    chunkDelay = 50,
    onProgress?,
    fileName = 'app.js', // Default filename
    loadFile = false, //load after saving for a program
    progressPingback = false //have the ble device print an OK each time it gets a chunk
) {
    const NORDIC_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
    const NORDIC_TX = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";

    // Helper function to convert string to ArrayBuffer
    function str2ab(str) {
        const buf = new ArrayBuffer(str.length);
        const bufView = new Uint8Array(buf);
        for (let i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }

    try {
        console.log("Writing reset operation");

        const fName = toJSONishString(fileName);

        await device.write({
            service: NORDIC_SERVICE,
            characteristic: NORDIC_TX,
            data: str2ab("reset();\n"),
            chunkSize,
            chunkDelay
        });

        console.log("Waiting for device to reset");
        await new Promise(res => setTimeout(res, 1500)); // Matching puck.js delay

        
        console.log("Writing new program to device.");
        const len = ESPRUINO_CODE.length;
        let currentBytes = 0;
        let i = 0;
        
        while (i < len) {
            const chunk = ESPRUINO_CODE.substr(i, 1024);
            let command;
            if (i === 0) {
                // First chunk
                command = `require("Storage").erase(${fName});\n require("Storage").write(${fName}, ${toJSONishString(chunk)}, 0, ${len});`;
            } else {
                // Subsequent chunks
                command = `require("Storage").write(${fName}, ${toJSONishString(chunk)}, ${i});`;
            }

            i += chunk.length;

            if(progressPingback) command += `\nBluetooth.println("OK");\n`; //status message
            if(loadFile && i >= len) command += `\nload(${fName});\n`

            const cmdBuffer = str2ab(command);
            await device.write({
                service: NORDIC_SERVICE,
                characteristic: NORDIC_TX,
                data: cmdBuffer,
                chunkSize,
                chunkDelay
            });

            currentBytes += cmdBuffer.byteLength;
            const prog = currentBytes / len;
            if (onProgress) onProgress(prog >= 1 ? 1 : prog);

            if (chunkDelay) await new Promise(res => setTimeout(res, chunkDelay));
        }

        console.log("Program written successfully.");

    } catch (error) {
        console.error("Error uploading Espruino code:", error);
        throw error;
    }
}

//you will need to factory reset the bangle if you screw this one up
export async function uploadEspruinoBootCode(
    device, 
    ESPRUINO_CODE,
    chunkSize = 128, // Default MTU on browser and Android is 512, it's 20 on WebBLE for Android but we aren't using that.
    chunkDelay = 10,
    isFlashPersistent = false,
    onProgress?
) {

    const NORDIC_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
    const NORDIC_TX = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
    const NORDIC_RX = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

    // Helper function to convert string to ArrayBuffer
    function str2ab(str) {
        const buf = new ArrayBuffer(str.length);
        const bufView = new Uint8Array(buf);
        for (let i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }

    // Helper function to encode JS code for execution
    function asJS(code) {
        return JSON.stringify(code);
    }

    // Function to split commands and add progress tracking
    function splitCommands(cmd) {
        const cmds = [];
        for (let i = 0; i < cmd.length; i += chunkSize) {
            cmds.push(cmd.slice(i, i + chunkSize));
        }
        return cmds;
    }

    // Function to write commands with progress and error handling
    async function uploadCommandList(cmds, currentBytes, maxBytes) {
        for (let cmd of cmds) {
            const cmdBuffer = str2ab(cmd);
            await device.write({
                service: NORDIC_SERVICE,
                characteristic: NORDIC_TX,
                data: cmdBuffer,
                chunkSize: chunkSize,
                chunkDelay: chunkDelay
            });
            currentBytes += cmdBuffer.byteLength;
            if (onProgress) onProgress(currentBytes / maxBytes);
            await new Promise(res => setTimeout(res, chunkDelay));
        }
    }

    try {
        console.log("Writing reset operation");

        await device.write({
            service: NORDIC_SERVICE,
            characteristic: NORDIC_TX,
            data: str2ab("reset();\n"),
            chunkSize: chunkSize,
            chunkDelay: chunkDelay
        });

        console.log("Waiting for device to reset");
        await new Promise(res => setTimeout(res, 1500)); // Matching puck.js delay

        console.log("Writing program to device.");
        const bootCode = `E.setBootCode(${asJS(ESPRUINO_CODE)}${isFlashPersistent ? ",true" : ""});load()\n`;
        const programCommands = splitCommands(bootCode);
        const maxBytes = programCommands.reduce((b, cmd) => b + cmd.length, 0) || 1;
        let currentBytes = 0;

        await uploadCommandList(programCommands, currentBytes, maxBytes);

        console.log("Program written.");
        return;
    } catch (error) {
        console.error("Error uploading Espruino code:", error);
        throw error;
    }
    //isFlashPersistent ? ".bootrst" : ".bootcde"
}




//basic upload function e.g. https://www.espruino.com/Bangle.js+Data+Streaming
export async function uploadEspruinoCode(
    device, 
    ESPRUINO_CODE:string,
    chunkSize:number=defaultChunkSize, //default MTU on browser and android is 512, it's 20 on WebBLE for android but we aren't using that. 
    chunkDelay=10,
    onProgress?:(progress:number)=>void
) {

    console.log("Writing reset operation");

    await device.write({
        service:NORDIC_SERVICE, 
        characteristic:NORDIC_TX, 
        data:str2ab("reset();\n"), 
        chunkSize:chunkSize,
        chunkDelay:chunkDelay
    }); 
    
    console.log("Writing program to device.");

    await new Promise((res)=>{setTimeout(() => {res(true);},1500);}); //matching puck.js
    
    await device.write({
        service:NORDIC_SERVICE, 
        characteristic:NORDIC_TX, 
        data:str2ab(`\x03\x10if(1){"${ESPRUINO_CODE}"}\n`), 
        chunkSize:chunkSize,
        chunkDelay:chunkDelay,
        callback:onProgress
    });

    console.log("Program written.");

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