import { Devices } from "./src/devices";
import { initDevice } from "./src/device.frontend";
import { DOMService } from 'graphscript';
import { ElementProps } from "graphscript/dist/services/dom/types/element";

// let selectBLE = document.createElement('select');
// let selectUSB = document.createElement('select');

// for(const key in Devices.BLE) {
//     selectBLE.innerHTML += `<option value='${key}'>${key}</option>`
// }

// for(const key in Devices.Serial) {
//     selectUSB.innerHTML += `<option value='${key}'>${key}</option>`
// }


let DOM = new DOMService({
    routes:{
        'app':{
            tagName:'div',
            children:{
                'devices':{
                    tagName:'div',
                    children:{
                        'devicediv':{
                            tagName:'div',
                            children:{
                                'connectmode':{
                                    tagName:'select',
                                    attributes:{
                                        innerHTML:`
                                            <option value='BLE' selected>BLE</option>
                                            <option value='USB'>USB</option>
                                        `,
                                        onchange:(ev)=>{
                                            if(ev.target.value === 'BLE') {
                                                ev.target.parentNode.querySelector('#selectUSB').style.display = 'none';
                                                ev.target.parentNode.querySelector('#selectBLE').style.display = '';
                                            }
                                            else if(ev.target.value === 'USB') {
                                                ev.target.parentNode.querySelector('#selectUSB').style.display = '';
                                                ev.target.parentNode.querySelector('#selectBLE').style.display = 'none';
                                            }
                                        }
                                    }
                                } as ElementProps,
                                'selectUSB':{
                                    tagName:'select',
                                    style:{display:'none'},
                                    onrender:(self)=>{                      
                                        for(const key in Devices.USB) {
                                            self.innerHTML += `<option value='${key}'>${key}</option>`
                                        }
                                    }
                                } as ElementProps,
                                'selectBLE':{
                                    tagName:'select',
                                    onrender:(self)=>{                      
                                        for(const key in Devices.BLE) {
                                            self.innerHTML += `<option value='${key}'>${key}</option>`
                                        }
                                    }
                                } as ElementProps,
                                'connectDevice':{
                                    tagName:'button',
                                    attributes:{
                                        innerHTML:'Connect Device',
                                        onclick:(ev)=>{

                                            let outputelm = document.getElementById('output') as HTMLDivElement;

                                            let mode = (document.getElementById('connectmode') as HTMLSelectElement).value;
                                            let selected;
                                            if(mode === 'BLE')
                                                selected = (document.getElementById('selectBLE') as HTMLSelectElement).value;
                                            else if (mode === 'USB') 
                                                selected = (document.getElementById('selectUSB') as HTMLSelectElement).value;

                                            let info = initDevice(
                                                mode as 'BLE'|'USB', 
                                                selected, 
                                                (data)=>{
                                                    outputelm.innerText = JSON.stringify(data);
                                                    console.log(data)
                                                }
                                            );

                                            if(info) {
                                                info.then((result) => {
                                                    console.log(result);
                                                    let disc = document.createElement('button');
                                                    disc.innerHTML = `Disconnect ${selected} (${mode})`;
                                                    disc.onclick = () => {
                                                        result.disconnect();
                                                        disc.remove();
                                                    }
                                                    ev.target.parentNode.appendChild(disc);
                                                })
                                            }
                                        }
                                    }
                                } as ElementProps
                            }
                        }
                    }
                },
                'output':{
                    tagName:'div',
                    innerHTML:'Connect to a supported BLE or USB Device to see output',
                } as ElementProps
            }
        } as ElementProps
    }
})