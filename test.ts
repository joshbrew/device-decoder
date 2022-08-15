import { Devices } from "./src/devices";
import { BLE, initDevice } from "./src/device.frontend";
import { DOMService } from 'graphscript';
import { ElementProps } from "graphscript/dist/services/dom/types/element";

let selectBLE = document.createElement('select');
let selectUSB = document.createElement('select');

for(const key in Devices.BLE) {
    selectBLE.innerHTML += `<option value='${key}'>${key}</option>`
}

for(const key in Devices.Serial) {
    selectUSB.innerHTML += `<option value='${key}'>${key}</option>`
}


let DOM = new DOMService({
    routes:{
        'body':{
            tagName:'div',
            children:{
                'devices':{
                    tagName:'div',
                    children:{
                        'blediv':{
                            tagName:'div',
                            children:{
                                'selectBLE':{
                                    tagName:'select',
                                    onrender:(self)=>{                      
                                        for(const key in Devices.BLE) {
                                            self.innerHTML += `<option value='${key}'>${key}</option>`
                                        }
                                    }
                                } as ElementProps,
                                'connectBLE':{
                                    tagName:'button',
                                    attributes:{
                                        innerHTML:'Connect BLE',
                                        onclick:()=>{

                                            let outputelm = document.getElementById('output') as HTMLDivElement;

                                            let selected = (document.getElementById('selectBLE') as HTMLSelectElement).value;

                                            let info = initDevice(
                                                'BLE', 
                                                selected, 
                                                (data)=>{
                                                    outputelm.innerText = data;
                                                }
                                            );

                                            if(info) {
                                                info.then((result) => {
                                                    let disc = document.createElement('button');
                                                    disc.innerHTML = `Disconnect ${selected} (BLE)`;
                                                    disc.onclick = () => {
                                                        BLE.disconnect(result.device.deviceId);
                                                        disc.remove();
                                                    }
                                                })
                                            }

                                        }
                                    }
                                }
                            }
                        },
                        'serialdiv':{
                            tagName:'div',
                            children:{
                                'selectUSB':{
                                    tagName:'select',
                                    onrender:(self)=>{                      
                                        for(const key in Devices.Serial) {
                                            self.innerHTML += `<option value='${key}'>${key}</option>`
                                        }
                                    }
                                } as ElementProps,
                                'connectUSB':{
                                    tagName:'button',
                                    attributes:{
                                        innerHTML:'Connect USB',
                                        onclick:()=>{

                                            let outputelm = document.getElementById('output') as HTMLDivElement;

                                            let selected = (document.getElementById('selectUSB') as HTMLSelectElement).value;

                                            let info = initDevice(
                                                'Serial', 
                                                selected, 
                                                (data)=>{
                                                    outputelm.innerText = data;
                                                }
                                            );

                                            if(info) {
                                                info.then((result) => {
                                                    let disc = document.createElement('button');
                                                    disc.innerHTML = `Disconnect ${selected} (USB)`;
                                                    disc.onclick = () => {
                                                        result.workers.serialworker.post('closeStream',result.device._id)
                                                        disc.remove();
                                                    }
                                                })
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'output':{
                    tagName:'div',
                    innerHTML:'Connect to a supported BLE or USB Device to see output',
                }
            }
        } as ElementProps
    }
})