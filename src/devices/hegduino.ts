import { WebglLinePlotProps } from "webgl-plot-utils";
import { BLEDeviceOptions } from "../ble/ble_client";
import { FilterSettings } from "../util/BiquadFilters";

let textdecoder = new TextDecoder();

export function hegduinocodec(value:any) {
    //hegduino format is utf8
    //Per line: timestamp, red, infrared, heg ratio, temperature
    let output = { //https://github.com/joshbrew/HEG_ESP32_Delobotomizer/blob/main/Firmware/MAX86141_HEG/MAX86141_HEG.h
        timestamp: 0,
        red: 0,
        infrared: 0,
        heg: 0,
        ambient: 0,
        temperature: 0 //temp on v2, nonsense on v1
    }

    let txt = textdecoder.decode(value);
    let line = txt.split('|'); //serial will stream in as utf8 lines, we use | separators
    if(line.length === 3) { //android web ble mode (20 byte packet lim)
        output.timestamp = Date.now();
        output.red = parseInt(line[0]);
        output.infrared = parseInt(line[1]);
        output.heg = parseFloat(line[2]);

    } else if(line.length >= 5) {
        //output.timestamp = parseInt(line[0]);
        output.timestamp = Date.now();
        output.red = parseInt(line[1]);
        output.infrared = parseInt(line[2]);
        output.heg = parseFloat(line[3]);
        output.ambient = parseFloat(line[4]);
        output.temperature = parseFloat(line[5]);

        return output;

    } else return txt; //e.g. echoed commands or startup/crash messages
}

const sps = 40;

export const hegduinoSerialSettings = {
    baudRate:115200,
    write:'t\n', //old firmware needs this
    codec:hegduinocodec,
    sps
}

export const hegduinoV1SerialSettings = Object.assign({}, hegduinoSerialSettings);
hegduinoV1SerialSettings.sps = 19;

export const hegduinoBLESettings = {
    sps, //only one output, so we can put an easier to find reference here 
    services:{
        ["6E400001-B5A3-F393-E0A9-E50E24DCCA9E".toLowerCase()]:{ //SERVICE_UUID -- for data
            '6e400002-b5a3-f393-e0a9-e50e24dcca9e':{ //write //CHARACTERISTIC_UUID_RX
                write:'t' //inits on old firwmare 
            },
            '6e400003-b5a3-f393-e0a9-e50e24dcca9e':{ //CHARACTERISTIC_UUID_TX
                notify:true,
                notifyCallback:undefined, //define this before initializing
                codec:hegduinocodec,
                sps
            } //notify
        },
        ['6E400004-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase()]:{ //SERVICE_UUID_OTA -- for updating
            ['6E400005-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase()]:{ //CHARACTERISTIC_UUID_ID
                read:true
            },
            ['6E400006-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase()]:{ //CHARACTERISTIC_UUID_FW
                write:undefined,
                notify:true,
                notifyCallback:undefined
            },
            ['6E400007-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase()]:{ //CHARACTERISTIC_UUID_HW_VERSION
                read:true                
            }     
        },
    },
    androidWebBLE:'o' //shortens the byte stream for android web ble compatibility (ugh)
} as BLEDeviceOptions


export const hegduinoV1BLESettings = Object.assign({}, hegduinoSerialSettings);
hegduinoV1BLESettings.sps = 19;

export const hegduinoChartSettings:Partial<WebglLinePlotProps> = {
    lines:{
        red:{nSec:60, sps},
        ir:{nSec:60, sps},
        heg:{nSec:60, sps},
        ambient:{nSec:60, sps},
        temperature:{nSec:60, sps, units:'C'},
    }
}

let v1sps = 19;
export const hegduinoV1FilterSettings:{[key:string]:FilterSettings} = {
    red:{sps:v1sps, lowpassHz:2, useLowpass:true},
    ir:{sps:v1sps, lowpassHz:2, useLowpass:true},
    heg:{sps:v1sps, lowpassHz:2, useLowpass:true},
}

export const hegduinoV2FilterSettings:{[key:string]:FilterSettings} = {
    red:{sps, lowpassHz:4, useLowpass:true},
    ir:{sps, lowpassHz:4, useLowpass:true},
    heg:{sps, lowpassHz:4, useLowpass:true},
}


/** Old BLE OTA code: Can also upload compiled .bin via wifi server.
 * 
 * 
    //get the file to start the update process
    getFile() {
        var input = document.createElement('input');
        input.accept = '.bin';
        input.type = 'file';

        input.onchange = (e) => {
            var file = e.target.files[0];
            var reader = new FileReader();
            reader.onload = (event) => {
                this.updateData = event.target.result;
                this.SendFileOverBluetooth();
                input.value = '';
            }
            reader.readAsArrayBuffer(file);
        }
        input.click();
    }

    // SendFileOverBluetooth(data)
    // Figures out how large our update binary is, attaches an eventListener to our dataCharacteristic so the Server can tell us when it has finished writing the data to memory
    // Calls SendBufferedData(), which begins a loop of write, wait for ready flag, write, wait for ready flag...
    //
    SendFileOverBluetooth() {
        if(!this.esp32otaService)
        {
            console.log("No ota Service");
            return;
        }
        
        this.totalSize = this.updateData.byteLength;
        this.remaining = this.totalSize;
        this.amountToWrite = 0;
        this.currentPosition = 0;

        this.esp32otaService.getCharacteristic(this.fileCharacteristicUuid)
        .then(characteristic => {
            this.readyFlagCharacteristic = characteristic;
            return characteristic.startNotifications()
            .then(_ => {
                this.readyFlagCharacteristic.addEventListener('characteristicvaluechanged', this.SendBufferedData)
            });
        })
        .catch(error => { 
            console.log(error); 
        });
        this.SendBufferedData();
    }

    // SendBufferedData()
    // An ISR attached to the same characteristic that it writes to, this function slices data into characteristic sized chunks and sends them to the Server
    //
    SendBufferedData() {
        if (this.remaining > 0) {
            if (this.remaining >= this.characteristicSize) {
                this.amountToWrite = this.characteristicSize
            }
            else {
                this.amountToWrite = this.remaining;
            }

            this.dataToSend = this.updateData.slice(this.currentPosition, this.currentPosition + this.amountToWrite);
            this.currentPosition += this.amountToWrite;
            this.remaining -= this.amountToWrite;
            console.log("remaining: " + this.remaining);

            this.esp32otaService.getCharacteristic(this.fileCharacteristicUuid)
            .then(characteristic => this.RecursiveSend(characteristic, this.dataToSend))
            .then(_ => {
                let progress = (100 * (this.currentPosition/this.totalSize)).toPrecision(3) + '%';
                this.onProgress(progress);
                return;
            })
            .catch(error => { 
                console.log(error); 
            });
        }
    }

    onProgress(progress) {
        console.log("ESP32 Update Progress: ", progress);
    }

    RecursiveSend(characteristic, data) {
        return characteristic.writeValue(data)
        .catch(error => {
            return this.RecursiveSend(characteristic, data);
        });
    }
 * 
 */