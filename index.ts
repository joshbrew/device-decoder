import {WebSerial} from './src/serial/serialstream'
import {BLEClient} from './src/ble/ble_client'
import {Router, DOMService, WorkerService, gsworker, ServiceMessage, proxyWorkerRoutes, workerCanvasRoutes} from '../GraphServiceRouter/index' //'graphscript'
import { ElementInfo, ElementProps } from 'graphscript/dist/services/dom/types/element';

/**
    <Debugger window component>
        <------------------------------------------>
            <BLE Button>
            <BLE Config>
                <device filters> - i.e. the namePrefix 

                When paired:
                <Toggle services> - each one toggled on should get its own console output 
                                and visual container like nrf connect, but in the console

            Browser only:
            <Serial Button>
            <Serial Config>
                <device filters>
                <baudRate>
                <bufferSize>

            Console mode (toggle one):
            <Latest> (only the most recent samples in raw text)
            <Scrolling> (up to 1000 samples in raw text)
            <Charting> (if debugger output matches a given format - use arduino output format?)
            <Blocks> (for ble services)
        <------------------------------------------>
            <Console window> - takes up most of the screen
        <------------------------------------------>
            <Connection Info> - expands
            <Decoder options> - expands (default text and raw byte outputs, plus write-your-own with a simple callback to return modified results, incl a set format that can be charted arbitrarily)
            <Line break format> - dropdown and custom input (e.g. look for \r\n end stop bytes)

*/

const Serial = new WebSerial();
const BLE = new BLEClient();


const workers = new WorkerService(); 
const decoderworker = workers.addWorker({url:gsworker}); //this will handle decoder logic
const chartworker = workers.addWorker({url:gsworker}); //this will visualize data for us if formats fit

decoderworker.request( 
    {
        route:'setRoute', 
        args:[
            function (value:any) { //to be overwritten when we want to swap decoders
                return value; //ping pong
            }.toString(),
            'decode'
        ]
    } as ServiceMessage //use service messages to communicate with disconnected service graphs
).then(console.log);

//let's load the serial library in a worker and try to run it there >_>
decoderworker.request(
    {
        route:'receiveClass',
        args:[WebSerial.toString(),'WebSerial'] 
    } as ServiceMessage
).then(console.log);

//create a callback to setup our transferred class
decoderworker.request(
    {
        route:'setRoute',
        args:[
            function setupSerial(self) {
                self.graph.Serial = new self.graph.WebSerial() as WebSerial; 
                console.log('setting up Serial', self.graph.Serial)

                self.graph.Serial.getPorts().then(console.log)
                return true;
            }.toString(),
            'setupSerial'
        ]
    } as ServiceMessage
).then(console.log);

decoderworker.request({route:'setupSerial'}).then(console.log); //now make sure it is ready


//alternatively, implement this all in a single web component
const domtree = {
    'debugger': {
        tagName:'div',
        children:{
            'header':{
                tagName:'div',
                children:{
                    'bleconnect':{
                        tagName:'button',
                        innerText:'BLE Device',
                        oncreate:(self: HTMLElement, info?: ElementInfo)=>{
                            self.onclick = () => {
                                BLE.setup({

                                }).then((info)=>{

                                }); //set options in bleconfig
                            }
                        }
                    } as ElementProps,
                    'bleconfig':{
                        tagName:'div',
                        innerHTML:'dropdown<br/>',
                        style:{
                            fontSize:'10px',
                            textAlign:'right'
                        },
                        children:{
                            'namePrefixLabel':{
                                tagName:'label',
                                innerText:'BLE Device Name',
                                children:{
                                    'namePrefix':{
                                        tagName:'input',
                                        attributes:{
                                            type:'text',
                                            placeholder:'e.g. ESP32',
                                        }
                                    } as ElementProps,
                                }
                            } as ElementProps,
                            'ln':{template:'<br/>'},
                            'deviceIdLabel':{
                                tagName:'label',
                                innerText:'BLE Device ID (direct connect)',
                                children:{
                                    'deviceId':{
                                        tagName:'input',
                                        attributes:{
                                            type:'text'
                                        }
                                    } as ElementProps,
                                }
                            } as ElementProps,
                            'ln2':{template:'<br/>'},
                            'servicesLabel':{
                                tagName:'label',
                                innerText:'Services Config ',
                                children:{
                                    'services':{ //need to configure options for multiple services and multiple characteristics per service in like a table
                                        tagName:'div',
                                        style:{
                                            border:'1px solid black'
                                        },
                                        children:{
                                            'ln':{template:'<br/>'}
                                        }
                                    } as ElementProps
                                }
                            }
                        } as ElementProps,
                    } as ElementProps,
                    'serialconnect':{
                        tagName:'button',
                        innerText:'USB Device',
                        oncreate:(self: HTMLElement, info?: ElementInfo)=>{
                            self.onclick = () => {
                                Serial.requestPort(
                                    (document.getElementById('usbVendorId') as HTMLInputElement).value ? parseInt((document.getElementById('usbVendorId') as HTMLInputElement).value) : undefined,
                                    (document.getElementById('usbProductId') as HTMLInputElement).value ? parseInt((document.getElementById('usbProductId') as HTMLInputElement).value) : undefined
                                ).then((port)=>{
                                    Serial.openPort(port,{
                                        baudRate:(document.getElementById('baudRate') as HTMLInputElement).value ? parseInt((document.getElementById('baudRate') as HTMLInputElement).value) : 115200, //https://lucidar.me/en/serialib/most-used-baud-rates-table/
                                        bufferSize:(document.getElementById('bufferSize') as HTMLInputElement).value ? parseInt((document.getElementById('bufferSize') as HTMLInputElement).value) : 255,
                                        parity:(document.getElementById('parity') as HTMLInputElement).value ? (document.getElementById('parity') as HTMLInputElement).value as ParityType : 'none',
                                        dataBits:(document.getElementById('dataBits') as HTMLInputElement).value ? parseInt((document.getElementById('dataBits') as HTMLInputElement).value) : 8,
                                        stopBits:(document.getElementById('stopBits') as HTMLInputElement).value ? parseInt((document.getElementById('stopBits') as HTMLInputElement).value) : 1,
                                        flowControl:(document.getElementById('flowControl') as HTMLInputElement).value ? (document.getElementById('flowControl') as HTMLInputElement).value as FlowControlType : 'none',
                                        onconnect:(ev)=>{ let portInfo = port.getInfo(); console.log('connected port:', portInfo);  },
                                        ondisconnect:(ev)=>{ let portInfo = port.getInfo(); console.log('disconnected port:', portInfo);  }
                                    } as any).then(()=>{

                                        document.getElementById('console').innerText = JSON.stringify(port.getInfo());
                                        
                                        let decoder = new TextDecoder();

                                        let output;

                                        let anim = () => {
                                            document.getElementById('console').innerText = `Raw: ${output}\r UTF-8: ${decoder.decode(output)}`;
                                        }

                                        let stream = Serial.createStream({
                                            port,
                                            frequency:1,
                                            ondata:(data:ArrayBuffer)=>{
                                                //pass to console
                                                output = data;
                                                
                                                requestAnimationFrame(anim);
                                                //roughly...
                                                //decoderworker.request({route:'decode',args:data},[data]).then((value) => {document.getElementById('console').innerText = `${value}`;} )
                                            }
                                        })
                                        Serial.readStream(stream);
                                    })
                                })
                            }
                        }
                    } as ElementProps,
                    'serialconfig':{ //need labels
                        tagName:'div',
                        innerHTML:'dropdown<br/>',
                        style:{
                            fontSize:'10px',
                            textAlign:'right'
                        },
                        children:{
                            'baudRateLabel':{
                                tagName:'label',
                                innerText:'Baud Rate (bps)',
                                children:{
                                    'baudRate':{
                                        tagName:'input',
                                        attributes:{
                                            type:'number',
                                            placeholder:115200,
                                            value:115200,
                                            min:1, //anything below 9600 is unlikely
                                            max:10000000 //10M baud I think is highest web serial supports... might only be 921600
                                        }
                                    } as ElementProps
                                }
                            } as ElementProps,
                            'ln':{template:'<br/>'},
                            'bufferSizeLabel':{
                                tagName:'label',
                                innerText:'Read/Write buffer size (bytes)',
                                children:{
                                    'bufferSize':{
                                        tagName:'input',
                                        attributes:{
                                            type:'number',
                                            placeholder:255,
                                            value:255,
                                            min:1,
                                            max:10000000 
                                        }
                                    } as ElementProps,
                                }
                            } as ElementProps,
                            'ln2':{template:'<br/>'},
                            'parityLabel':{
                                tagName:'label',
                                innerText:'Parity',
                                children:{
                                    'parity':{
                                        tagName:'select',
                                        children:{
                                            'none':{
                                                tagName:'option',
                                                attributes:{
                                                    value:'none',
                                                    selected:true,
                                                    innerText:'none'
                                                }
                                            },
                                            'even':{
                                                tagName:'option',
                                                attributes:{
                                                    value:'even',
                                                    innerText:'even'
                                                }
                                            },
                                            'odd':{
                                                tagName:'option',
                                                attributes:{
                                                    value:'odd',
                                                    innerText:'odd'
                                                }
                                            }
                                        }
                                    } as ElementProps,
                                }
                            } as ElementProps,
                            'ln3':{template:'<br/>'},
                            'dataBitsLabel':{
                                tagName:'label',
                                innerText:'Data bits (7 or 8)',
                                children:{
                                    'dataBits':{
                                        tagName:'input',
                                        attributes:{
                                            type:'number',
                                            placeholder:8,
                                            value:8,
                                            min:7, 
                                            max:8 
                                        }
                                    } as ElementProps,
                                }
                            } as ElementProps,
                            'ln4':{template:'<br/>'},
                            'stopBitsLabel':{
                                tagName:'label',
                                innerText:'Stop bits (1 or 2)',
                                children:{
                                    'stopBits':{
                                        tagName:'input',
                                        attributes:{
                                            type:'number',
                                            placeholder:1,
                                            value:1,
                                            min:1, 
                                            max:2 
                                        }
                                    } as ElementProps,
                                }
                            } as ElementProps,
                            'ln5':{template:'<br/>'},
                            'flowControlLabel':{
                                tagName:'label',
                                innerText:'Flow control (hardware?)',
                                children:{
                                    'flowControl':{
                                        tagName:'select',
                                        children:{
                                            'none':{
                                                tagName:'option',
                                                attributes:{
                                                    value:'none',
                                                    selected:true,
                                                    innerText:'none'
                                                }
                                            },
                                            'hardware':{
                                                tagName:'option',
                                                attributes:{
                                                    value:'hardware',
                                                    innerText:'hardware'
                                                }
                                            },
                                        }
                                    } as ElementProps,
                                }
                            } as ElementProps,
                            'ln6':{template:'<br/>'},
                            'usbVendorIdLabel':{
                                tagName:'label',
                                innerText:'Vendor ID Filter? (hexadecimal)',
                                children:{
                                    'usbVendorId':{
                                        tagName:'input',
                                        attributes:{
                                            type:'text',
                                            placeholder:'0xabcd',
                                        }
                                    } as ElementProps,
                                }
                            } as ElementProps,
                            'ln7':{template:'<br/>'},
                            'usbProductIdLabel':{
                                tagName:'label',
                                innerText:'Product ID Filter? (hexadecimal)',
                                children:{
                                    'usbProductId':{
                                        tagName:'input',
                                        attributes:{
                                            type:'text',
                                            placeholder:'0xefgh',
                                        }
                                    } as ElementProps,
                                }
                            } as ElementProps,
                            'ln8':{template:'<br/>'},
                            'frequencyLabel':{
                                tagName:'label',
                                innerText:'Read frequency? (ms)',
                                children:{
                                    'frequency':{
                                        tagName:'input',
                                        attributes:{
                                            type:'number',
                                            placeholder:10,
                                            value:10,
                                            min:0.001,
                                            max:10000000,
                                            step:0.001
                                        }
                                    } as ElementProps
                                }
                            } as ElementProps
                        }
                    } as ElementProps
                }
            } as ElementProps,
            'console':{
                tagName:'div',
                style:{
                    width:'100%',
                    height:'300px',
                    color:'white',
                    backgroundColor:'black',
                    fontSize:'10px',
                    fontFamily:'Consolas, monaco, monospace'
                }
            } as ElementProps,
            'footer':{
                tagName:'div',
                children:{
                    'decoder':{
                        tagName:'div'
                    } as ElementProps,
                    'linebreak':{
                        tagName:'div',
                        children:{}
                    } as ElementProps
                }
            } as ElementProps
        }
    } as ElementProps
};



const router = new Router([
    workers,
    proxyWorkerRoutes, 
    workerCanvasRoutes,
    new DOMService({routes:domtree})
]);


console.log(router)