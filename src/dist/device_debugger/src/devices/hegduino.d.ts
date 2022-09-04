import { WebglLinePlotProps } from "webgl-plot-utils";
import { BLEDeviceOptions } from "../ble/ble_client";
import { FilterSettings } from "../util/BiquadFilters";
export declare function hegduinocodec(value: any): string | {
    timestamp: number;
    red: number;
    infrared: number;
    heg: number;
    ambient: number;
    temperature: number;
};
export declare const hegduinoSerialSettings: {
    baudRate: number;
    write: string;
    codec: typeof hegduinocodec;
    sps: number;
};
export declare const hegduinoV1SerialSettings: {
    baudRate: number;
    write: string;
    codec: typeof hegduinocodec;
    sps: number;
};
export declare const hegduinoBLESettings: BLEDeviceOptions;
export declare const hegduinoV1BLESettings: {
    baudRate: number;
    write: string;
    codec: typeof hegduinocodec;
    sps: number;
};
export declare const hegduinoChartSettings: Partial<WebglLinePlotProps>;
export declare const hegduinoV1FilterSettings: {
    [key: string]: FilterSettings;
};
export declare const hegduinoV2FilterSettings: {
    [key: string]: FilterSettings;
};
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
