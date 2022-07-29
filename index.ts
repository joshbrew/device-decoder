import {StreamInfo, WebSerial} from './src/serial/serialstream'
import {BLEClient} from './src/ble/ble_client'
import {Router, DOMService, WorkerService, gsworker, ServiceMessage, proxyWorkerRoutes, workerCanvasRoutes, DOMElement } from '../GraphServiceRouter/index'
import { ElementInfo, ElementProps } from 'graphscript/dist/services/dom/types/element';
import { DOMElementProps } from 'graphscript/dist/services/dom/types/component';


import CodeMirror from './src/codemirror/codemirror.min.cjs'

//import beautify_js from './src/beautify.min'

/**
    <Debugger window component>
        <------------------------------------------>
            <BLE Button>
            <BLE Config>
                <device filters> - i.e. the namePrefix 

            Browser only:
            <Serial Button>
            <Serial Config>
                <device filters>
                <baudRate>
                <bufferSize>


            Create a window for active serial connections with selective disconnecting and decoding etc.
        <------------------------------------------>
            Connections
            <Console window> - takes up most of the screen
                Creates a console for each active usb connection/ble characteristic (read/write/notify), just stuff them next to each other with flex boxes.
                Each console has controls for each connection with a full test suite and selective notification/read/write controls/decoder selection etc..

                Connection Info
                Decoder Options, Output Modes
                Console mode (toggle one):
                <Latest> (only the most recent samples in raw text)
                <Scrolling> (up to 1000 samples in raw text)
                <Charting> (if debugger output matches a given format - use arduino output format?)
                <Blocks> (for ble services)

                Console

                TODO: more stuff like latencies, callback info, etc.
        <------------------------------------------>
            Custom decoder writer:
            Test input (e.g. copied from above consoles, evaluating any comma separated numbers into an array),
            Eval a text inputted decoder function
            Test output, keep editing till it gives a templated response

            then at the bottom e.g. 'suggested output format: "1000,3000,400,5000"' or maybe an object with named keys. and we will take care of timestamping for the charts and csvs

*/

const Serial = new WebSerial();
const BLE = new BLEClient();


const workers = new WorkerService(); 

//TODO: Make a worker for each stream & visual, TO THE MAXXX, they will just run in order, too bad we can't force cores to mainline different tasks so device source streams and frontend logic don't compete
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
                console.log('worker: Setting up Serial', self.graph.Serial)

                self.graph.Serial.getPorts().then(console.log)
                return true;
            }.toString(),
            'setupSerial'
        ]
    } as ServiceMessage
).then(console.log);

decoderworker.request({route:'setupSerial'}).then(console.log); //now make sure it is ready


let textdecoder = new TextDecoder();

const decoders = {
    'raw':(data:ArrayBuffer) => { return new Uint8Array(data); },
    'utf8':(data:ArrayBuffer) => { return textdecoder.decode(data); },
    'console-f12':(data:ArrayBuffer) => { data = new Uint8Array(data); console.log(data); return data; },
    'debug':(data:ArrayBuffer,debugmessage:string) => { data = new Uint8Array(data); console.log(debugmessage,data); return `${debugmessage} ${data}`; }
    //ads131m08:(data:ArrayBuffer) => { return data; },
    //max3010x:(data:ArrayBuffer) => { return data; },
    //mpu6050:(data:ArrayBuffer) => { return data; },
    //freeeg32:(data:ArrayBuffer) => { return data; }, //https://github.com/joshbrew/freeeeg32.js
    //openbcicyton:(data:ArrayBuffer) => { return data; }, //https://github.com/joshbrew/cyton.js
    //cognixionBLE:(data:ArrayBuffer) => { return data; }, //see the super secret docs
    //hegduino:(data:ArrayBuffer) => { return data; }, //https://github.com/joshbrew/hegduino.js -- incl check for android (3 outputs only) output
    //peanut:(data:ArrayBuffer) => { return data; } //https://github.com/joshbrew/peanutjs/blob/main/peanut.js
    //...custom?
}

//also incl https://github.com/joshbrew/BiquadFilters.js/blob/main/BiquadFilters.js


//alternatively, implement this all in a single web component
const domtree = {
    'debugger': {
        template:()=>{return '';},//`<div>Test</div>`;}, //`<div>Test</div>`
        tagName:'device-debugger',
        styles:`

        label {
            display:inline-block;
            width:100%;
            border-bottom:1px solid black;
        }

        label > input {
            width:35%;
            float:right;
        }

        input {
            font-family: Consolas,monaco,monospace;
            font-size:10px;
        }
        
        select {
            font-family: Consolas,monaco,monospace; 
            font-size: 10px;
        }

        textarea {
            font-family: Consolas,monaco,monospace; 
            font-size: 10px;
        }

        label > select {
            float:right;
        }

        td {
            border-bottom: 1px solid white;
        }

        .debugger {
            font-family: Consolas,monaco,monospace; 
            position:absolute;
            left:0px;
            top:0px;
            border:2px solid black;
            font-size:10px; 
            width:99.7%;
        }

        .config {
            width:50%;
            display:inline-block;
            vertical-align:top;
        }

        .connectiontemplate {
           color:white; 
        }
        
        .console {
            color:white; 
            background-color:black; 
            font-size:10px; 
            font-family:Consolas,monaco,monospace; 
            overflow-y:scroll;
            max-width:100vw;
            height:300px;
            display:flex;
            flex-direction: column-reverse;
        }
        `,
        children:{
            'debuggerbody':{
                tagName:'div',
                attributes:{
                    className:'debugger'
                },
                children:{
                    'header':{
                        tagName:'div',
                        children:{
                            'connectionopts':{
                                tagName:'div',
                                children:{
                                    'bleopts':{
                                        tagName:'div',
                                        attributes:{
                                            className:'config'
                                        },
                                        children:{                
                                            'bleconnect':{
                                                tagName:'button',
                                                innerText:'Connect BLE Device',
                                                onrender:(self: HTMLElement, info?: ElementInfo)=>{
                                                    self.onclick = () => {

                                                        let parent = document.querySelector('device-debugger');
                                                        let services:any = {}; //comma separated
                                                        let reqlen = '0000CAFE-B0BA-8BAD-F00D-DEADBEEF0000'.length;
                                                        (parent.querySelector('#serviceuuid') as HTMLInputElement).value.split(',').forEach((uu) => { if(uu.length === reqlen) services[uu.toLowerCase()] = {}; else console.error('uuid format is wonk', uu, 'expected format (e.g.):', '0000CAFE-B0BA-8BAD-F00D-DEADBEEF0000'.toLowerCase()) }); //todo, set up characteristics on first go
                                                        if(Object.keys(services).length === 0) services = {['0000CAFE-B0BA-8BAD-F00D-DEADBEEF0000'.toLowerCase()]:{}};

                                                        BLE.setup({
                                                            services
                                                        }).then((stream)=>{
                                                            console.log(stream)

                                                            class ConnectionTemplate extends DOMElement {
                                                                    
                                                                stream=stream;
                                                                output:any;
                                                                outputText:string;

                                                                anim:any;

                                                                template = ()=>{ return `
                                                                    <div id='${this.stream.deviceId}' style='display:none;' class='connectiontemplate'>
                                                                        BLE Connection 
                                                                        <div>
                                                                            <span> BLE Device Name: </span><span>${this.stream.device.name}</span><span> BLE Device ID: </span><span>${this.stream.deviceId}</span>
                                                                        </div>
                                                                        <table id='${this.stream.deviceId}info'>
                                                                        </table>
                                                                        <div>
                                                                            <button id='${this.stream.deviceId}xconnect'>Disconnect</button>
                                                                            <button id='${this.stream.deviceId}x'>Remove</button>
                                                                        </div>
                                                                        <div>
                                                                            <label>
                                                                                Output Mode: <br/>
                                                                                <select id='${this.stream.deviceId}outputmode'>
                                                                                    <option value='b' selected> All </option>
                                                                                    <option value='a'> Latest </option>
                                                                                </select>
                                                                            </label>
                                                                        </div>
                                                                        <div id='${this.stream.deviceId}connectioninfo'> RSSI: <span id='${this.stream.deviceId}rssi'></span></div>
                                                                        <div 
                                                                            id='${this.stream.deviceId}console' 
                                                                            class='console'>
                                                                        </div>
                                                                    </div>`;
                                                                }

                                                                oncreate = (self:DOMElement,props:any) => {
                                                                    //spawn a graph based prototype hierarchy for the connection info?
                                                                    //e.g. to show the additional modularity off
                            
                                                                    let c = self.querySelector('[id="'+this.stream.deviceId+'console"]') as HTMLElement;
                                                                    let outputmode = self.querySelector('[id="'+this.stream.deviceId+'outputmode"]') as HTMLInputElement;
                            
                                                                    this.anim = () => { 
                            
                                                                        if(outputmode.value === 'a') 
                                                                            c.innerText = `${this.output}`; 
                                                                        else if (outputmode.value === 'b') {
                                                                            if(this.outputText.length > 20000) { //e.g 20K char limit
                                                                                this.outputText = this.outputText.substring(this.outputText.length - 20000, this.outputText.length); //trim output
                                                                            }
                                                                            c.innerText = this.outputText;
                                                                        }
                                                                    }

                                                                    (self.querySelector('[id="'+this.stream.deviceId+'"]') as HTMLElement).style.display = '';

                                                                    const xconnectEvent = (ev) => {
                                                                        BLE.disconnect(this.stream.device).then(() => {
                                                                            (self.querySelector('[id="'+this.stream.deviceId+'xconnect"]') as HTMLButtonElement).innerHTML = 'Reconnect';
                                                                            (self.querySelector('[id="'+this.stream.deviceId+'xconnect"]') as HTMLButtonElement).onclick = (ev) => {  
                                                                                BLE.reconnect(this.stream.deviceId).then((device) => {
                                                                                    this.output = 'Reconnected to ' + device.deviceId;
                                                                                    //self.render(); //re-render, will trigger oncreate again to reset this button and update the template 
                                                                                })
                                                                            }
                                                                        });
                                                                    }

                                                                    (self.querySelector('[id="'+this.stream.deviceId+'xconnect"]') as HTMLButtonElement).onclick = xconnectEvent;

                                                                    (self.querySelector('[id="'+this.stream.deviceId+'x"]') as HTMLButtonElement).onclick = () => {
                                                                        BLE.disconnect(this.stream.device);
                                                                        this.delete();
                                                                        self.querySelector('[id="'+this.stream.deviceId+'console"]').remove(); //remove the adjacent output console
                                                                    }
                                                                
                                                                    // (self.querySelector('[id="'+this.stream.deviceId+'decoder"]') as HTMLInputElement).onchange = (ev) => {
                                                                    //     this.decoder = decoders[(self.querySelector('[id="'+this.stream.deviceId+'decoder"]') as HTMLInputElement).value];
                                                                    // }

                                                                    let rssielm = self.querySelector('[id="'+this.stream.device.deviceId + 'rssi"]') as HTMLElement;

                                                                    let rssiFinder = () => {
                                                                        if(BLE.devices[this.stream.device.deviceId]) {
                                                                            BLE.readRssi(this.stream.device).then((rssi) => {
                                                                                rssielm.innerText = `${rssi}`;
                                                                                setTimeout(()=>{rssiFinder();},250);
                                                                            }).catch((er)=> {rssielm.innerText = er; console.error(er); });
                                                                        }
                                                                    }

                                                                    rssiFinder(); //mobile only


                                                                    BLE.getServices(this.stream.device.deviceId).then((svcs) => {
                                                                        console.log('services', svcs)
                                                                        self.querySelector('[id="'+this.stream.deviceId+'info"]').innerHTML = `<tr><th>UUID</th><th>Notify</th><th>Read</th><th>Write</th><th>Broadcast</th><th>Indicate</th></tr>`
                                                                        svcs.forEach((s) => {    
                                                                            self.querySelector('[id="'+this.stream.deviceId+'info"]').insertAdjacentHTML('beforeend', `<tr colSpan=6><th>${s.uuid}</th></tr>`)
                                                                            s.characteristics.forEach((c) => { 
                                                                                //build interactivity/subscriptions for each available service characteristic based on readable/writable/notify properties
                                                                                self.querySelector('[id="'+this.stream.deviceId+'info"]').insertAdjacentHTML(
                                                                                    'beforeend', 
                                                                                    `<tr>
                                                                                        <td id='${c.uuid}'>${c.uuid}</td>
                                                                                        <td id='${c.uuid}notify'>${c.properties.notify ? `<button id="${c.uuid}notifybutton">Subscribe</button> Decoder: <select id="${c.uuid}notifydecoder">${Object.keys(decoders).map((d,i) => `<option value='${d}' ${i === 0 ? 'selected' : ''}>${d.toUpperCase()}</option>`).join('')}</select>` : 'false'}</td>
                                                                                        <td id='${c.uuid}read'>${c.properties.read ? `<button id="${c.uuid}readbutton">Read</button> Decoder: <select id="${c.uuid}readdecoder">${Object.keys(decoders).map((d,i) => `<option value='${d}' ${i === 0 ? 'selected' : ''}>${d.toUpperCase()}</option>`).join('')}</select>` : 'false'}</td>
                                                                                        <td id='${c.uuid}write'>${c.properties.write ? `<input type='text' id="${c.uuid}writeinput"></input><button id="${c.uuid}writebutton">Write</button>` : 'false'}</td>
                                                                                        <td id='${c.uuid}broadcast'>${c.properties.broadcast}</td>
                                                                                        <td id='${c.uuid}indicate'>${c.properties.indicate}</td>
                                                                                    </tr>`
                                                                                );

                                                                                if(c.properties.notify) {
                                                                                    let decoderselect = self.querySelector('[id="'+c.uuid+'notifydecoder"]') as HTMLInputElement;
                                                                                    let debugmessage = `${c.uuid} notify:`;

                                                                                    const notifyOnClick = () => {
                                                                                        BLE.subscribe(this.stream.device, s.uuid, c.uuid, (result:DataView) => {
                                                                                            this.output = decoders[decoderselect.value](result.buffer,debugmessage);
                                                                                        
                                                                                            if(outputmode.value === 'b') {
                                                                                                this.outputText += `${this.output}\n`
                                                                                            }
                                                                                            requestAnimationFrame(this.anim);
                                                                                            //this.anim();
                                                                                        });

                                                                                        (self.querySelector('[id="'+c.uuid+'notifybutton"]') as HTMLButtonElement).innerText = 'Unsubscribe';
                                                                                        (self.querySelector('[id="'+c.uuid+'notifybutton"]') as HTMLButtonElement).onclick = ()=> {
                                                                                            BLE.unsubscribe(this.stream.device, s.uuid, c.uuid);
                                                                                            
                                                                                            (self.querySelector('[id="'+c.uuid+'notifybutton"]') as HTMLButtonElement).innerText = 'Subscribe';
                                                                                            (self.querySelector('[id="'+c.uuid+'notifybutton"]') as HTMLButtonElement).onclick = notifyOnClick;
                                                                                        }
                                                                                    }

                                                                                    (self.querySelector('[id="'+c.uuid+'notifybutton"]') as HTMLButtonElement).onclick = notifyOnClick;
                                                                                }
                                                                                if(c.properties.read) {
                                                                                    let decoderselect = self.querySelector('[id="'+c.uuid+'readdecoder"]') as HTMLInputElement;
                                                                                    let debugmessage = `${c.uuid} read:`;
                                                                                    (self.querySelector('[id="'+c.uuid+'readbutton"]') as HTMLButtonElement).onclick = () => { 
                                                                                        BLE.read(this.stream.device, s.uuid, c.uuid, (result:DataView) => {
                                                                                            this.output = decoders[decoderselect.value](result.buffer,debugmessage);

                                                                                            if(outputmode.value === 'b') {
                                                                                                this.outputText += `${this.output}\n`
                                                                                            }
                                                                                            requestAnimationFrame(this.anim);
                                                                                            //this.anim();
                                                                                        })
                                                                                    }
                                                                                }
                                                                                if(c.properties.write) {
                                                                                    let writeinput = self.querySelector('[id="'+c.uuid+'writeinput"]') as HTMLInputElement;
                                                                                    (self.querySelector('[id="'+c.uuid+'writebutton"]') as HTMLButtonElement).onclick = () => { 
                                                                                        let value:any = writeinput.value;
                                                                                        if(parseInt(value)) value = parseInt(value);
                                                                                        BLE.write(this.stream.device, s.uuid, c.uuid, BLEClient.toDataView(value), () => {
                                                                                            this.output = 'Wrote ' + value + 'to '+ c.uuid;

                                                                                            if(outputmode.value === 'b') {
                                                                                                this.outputText += `${this.output}\n`
                                                                                            }
                                                                                            requestAnimationFrame(this.anim);
                                                                                            //this.anim();
                                                                                        })
                                                                                    }
                                                                                }
                                                                            }); 
                                                                        });
                                                                    })

                                                                        
                                                                }

                                                            }

                                                            let id = `ble${Math.floor(Math.random()*1000000000000000)}`;

                                                            ConnectionTemplate.addElement(`${id}-info`);
                                                            let elm = document.createElement(`${id}-info`);
                                                            //document.getElementById('connections').appendChild(elm);

                                                            document.querySelector('device-debugger').querySelector('#connections').appendChild(elm);
                                                            
                                                        }); //set options in bleconfig
                                                    }
                                                }
                                            } as ElementProps,
                                            'bleconfigdropdown':{
                                                tagName:'button',
                                                innerText:'--',
                                                style:{
                                                    float:'right'
                                                },
                                                attributes:{
                                                    onclick:(ev)=>{
                                                        //to make this more modular to select the adjacent node, ev.target.parentNode.querySelector('#bleconfigcontainer')
                                                        if( ev.target.parentNode.querySelector('#bleconfigcontainer').style.display === 'none') {
                                                            ev.target.parentNode.querySelector('#bleconfigcontainer').style.display = '';
                                                            ev.target.innerText = '--'
                                                        }
                                                        else {
                                                            ev.target.parentNode.querySelector('#bleconfigcontainer').style.display = 'none';
                                                            ev.target.innerText = '++'
                                                        }
                                                        // console.log(ev)
                                                        // let node = ev.target.node;
                                                        // for(const key in node.children) {
                                                        //     if(node.children[key].element) {
                                                        //         if(!node.children[key].element.style.display) node.children[key].element.style.display = 'none';
                                                        //         else node.children[key].element.style.display = '';
                                                        //     }
                                                        // }
                                                    }
                                                }
                                            },
                                            'bleconfig':{
                                                tagName:'div',
                                                children:{
                                                    'bleconfigcontainer':{
                                                        tagName:'div',
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
                                                            'serviceuuidLabel':{
                                                                tagName:'label',
                                                                innerText:'Primary Service UUID(s), comma separated',
                                                                children:{
                                                                    'serviceuuid':{
                                                                        tagName:'input',
                                                                        attributes:{
                                                                            type:'text',
                                                                            value:'0000CAFE-B0BA-8BAD-F00D-DEADBEEF0000'.toLowerCase(),
                                                                            placeholder:'0000CAFE-B0BA-8BAD-F00D-DEADBEEF0000'.toLowerCase()
                                                                        }
                                                                    } as ElementProps,
                                                                }
                                                            } as ElementProps,
                                                            // 'ln3':{template:'<br/>'},
                                                            // 'servicesLabel':{
                                                            //     tagName:'label',
                                                            //     innerText:'Services Config ',
                                                            //     children:{
                                                            //         'services':{ //need to configure options for multiple services and multiple characteristics per service in like a table
                                                            //             tagName:'table',
                                                            //             style:{
                                                            //                 border:'1px solid black',
                                                            //                 display:'flex'
                                                            //             },
                                                            //             children:{
                                                            //             }
                                                            //         } as ElementProps
                                                            //     }
                                                            // }
                                                        }
                                                    } as ElementProps,
                                                } as ElementProps,
                                            } as ElementProps,
                                        }
                                    } as ElementProps,
                                    'serialopts':{
                                        tagName:'div',
                                        attributes:{
                                            className:'config'
                                        },
                                        children:{
                                            'serialconnect':{
                                                tagName:'button',
                                                innerText:'Connect USB Device',
                                                onrender:(self: HTMLElement, info?: ElementInfo)=>{
                
                                                    let parent = document.querySelector('device-debugger');
                
                                                    const getSettings = (port:SerialPort) => { 
                
                                                        let settings:any = {
                                                            baudRate:(parent.querySelector('#baudRate') as HTMLInputElement).value ? parseInt((parent.querySelector('#baudRate') as HTMLInputElement).value) : 115200, //https://lucidar.me/en/serialib/most-used-baud-rates-table/
                                                            bufferSize:(parent.querySelector('#bufferSize') as HTMLInputElement).value ? parseInt((parent.querySelector('#bufferSize') as HTMLInputElement).value) : 255,
                                                            parity:(parent.querySelector('#parity') as HTMLInputElement).value ? (parent.querySelector('#parity') as HTMLInputElement).value as ParityType : 'none',
                                                            dataBits:(parent.querySelector('#dataBits') as HTMLInputElement).value ? parseInt((parent.querySelector('#dataBits') as HTMLInputElement).value) : 8,
                                                            stopBits:(parent.querySelector('#stopBits') as HTMLInputElement).value ? parseInt((parent.querySelector('#stopBits') as HTMLInputElement).value) : 1,
                                                            flowControl:(parent.querySelector('#flowControl') as HTMLInputElement).value ? (parent.querySelector('#flowControl') as HTMLInputElement).value as FlowControlType : 'none',
                                                            onconnect:(ev)=>{ console.log('connected! ', JSON.stringify(port.getInfo())); },
                                                            ondisconnect:(ev)=>{ console.log('disconnected! ', JSON.stringify(port.getInfo())); },
                                                            decoder:'raw' //default
                                                        }
                
                                                        return settings;
                                                    }
                
                                                    self.onclick = () => {
                                                        //TODO: do this on a thread instead...
                                                        Serial.requestPort(
                                                            (parent.querySelector('#usbVendorId') as HTMLInputElement).value ? parseInt((parent.querySelector('#usbVendorId') as HTMLInputElement).value) : undefined,
                                                            (parent.querySelector('#usbProductId') as HTMLInputElement).value ? parseInt((parent.querySelector('#usbProductId') as HTMLInputElement).value) : undefined
                                                        ).then((port)=>{
                
                                                            let id = `port${Math.floor(Math.random()*1000000000000000)}`;

                                                            class ConnectionTemplate extends DOMElement {
                                                                    
                                                                stream:StreamInfo;
                                                                output:any;
                                                                outputText:string='';
                                                                settings:any;
                                                                lastRead:number=0;
                                                                readRate:number=0;
                                                                anim:any;
                                                                decoder='raw'
                
                                                                constructor() {
                                                                    super(); 
                
                                                                    this.settings = getSettings(port);

                                                                };
                
                                                                template = ()=>{ 
                                                                    
                                                                    return `
                                                                    <div id='${id}' style='display:none;' class='connectiontemplate'>
                                                                        Serial Connection
                                                                        <div>
                                                                            <span>USB Vendor ID: </span><span>${port.getInfo().usbVendorId}</span><span> USB Product ID: </span><span>${port.getInfo().usbProductId}</span>
                                                                        </div>
                                                                        <table id='${id}info'>
                                                                            <tr>
                                                                                <th>Baud Rate</th>
                                                                                <th>Buffer Size</th>
                                                                                <th>Parity</th>
                                                                                <th>Data Bits</th>
                                                                                <th>Stop Bits</th>
                                                                                <th>Flow Control</th>
                                                                            </tr>
                                                                            <tr>
                                                                                <td>${this.settings.baudRate}</td>
                                                                                <td>${this.settings.bufferSize}</td>
                                                                                <td>${this.settings.parity}</td>
                                                                                <td>${this.settings.dataBits}</td>
                                                                                <td>${this.settings.stopBits}</td>
                                                                                <td>${this.settings.flowControl}</td>
                                                                            </tr>
                                                                        </table>
                                                                        <div>
                                                                            <input id='${id}input' type='text' value='0x01'></input>
                                                                            <button id='${id}send'>Send</button>
                                                                            <button id='${id}xconnect'>Disconnect</button>
                                                                            <button id='${id}x'>Remove</button>
                                                                        </div>
                                                                        <div>
                                                                            <label>
                                                                                Decoder:
                                                                                <select id='${id}decoder'>
                                                                                    ${Object.keys(decoders).map((d,i) => `<option value='${d}' ${i === 0 ? 'selected' : ''}>${d.toUpperCase()}</option>`).join('')}
                                                                                </select>
                                                                            </label>
                                                                            <label>
                                                                                Output Mode: <br/>
                                                                                <select id='${id}outputmode'>
                                                                                    <option value='b' selected> All </option>
                                                                                    <option value='a'> Latest </option>
                                                                                </select>
                                                                            </label>
                                                                        </div>
                                                                        <div id='${id}connectioninfo'>Read Rate: <span id='${id}readrate'></span> updates/sec</div>
                                                                        <div id='${id}console' class='console'>
                                                                        </div>
                                                                    </div>`;
                                                                }
                
                                                                oncreate = (self:DOMElement,props:any) => {
                
                                                                    //spawn a graph based prototype hierarchy for the connection info?
                                                                    //e.g. to show the additional modularity off
                            
                                                                    let c = self.querySelector('[id="'+id+'console"]') as HTMLElement;
                                                                    let outputmode = self.querySelector('[id="'+id+'outputmode"]') as HTMLInputElement;
                                                                    let readrate = self.querySelector('[id="'+id+'readrate"]') as HTMLElement;

                                                                    this.anim = () => { 
                
                                                                        readrate.innerText = this.readRate.toFixed(6);
                            
                                                                        if(outputmode.value === 'a') 
                                                                            c.innerText = `${this.output}`; 
                                                                        else if (outputmode.value === 'b') {
                                                                            if(this.outputText.length > 20000) { //e.g 20K char limit
                                                                                this.outputText = this.outputText.substring(this.outputText.length - 20000, this.outputText.length); //trim output
                                                                            }
                                                                            c.innerText = this.outputText;
                                                                        }
                                                                    }

                                                                    Serial.openPort(port, this.settings).then(()=>{

                                                                        this.stream = Serial.createStream({
                                                                            port,
                                                                            frequency:1,
                                                                            ondata: (value:ArrayBuffer) => { console.log(value) }
                                                                         
                                                                        });
                                                                        
                                                                        let debugmessage = `serial port ${port.getInfo().usbVendorId}:${port.getInfo().usbProductId} read:`;

                                                                        this.stream.ondata=(data:ArrayBuffer)=>{
                                                                            //pass to console
                                                                            this.output = decoders[this.decoder](data,debugmessage);
                
                                                                            let now = performance.now();
                                                                            this.readRate = 1/(0.001*(now - this.lastRead)); //reads per second.
                                                                            this.lastRead = now;

                                                                            if(outputmode.value === 'b') {
                                                                                this.outputText += `${this.output}\n`
                                                                            }

                                                                            if(this.anim) requestAnimationFrame(this.anim); //throttles animations to refresh rate
                                                                            //if(this.anim) this.anim();
                                                                            //roughly...
                                                                            //decoderworker.request({route:'decode',args:data},[data]).then((value) => {document.getElementById('console').innerText = `${value}`;} )
                                                                        }

                                                                        (self.querySelector('[id="'+id+'send"]') as HTMLButtonElement).onclick = () => {
                                                                            let value = (self.querySelector('[id="'+id+'input"]') as HTMLButtonElement).value;
                                                                            if(parseInt(value)) {
                                                                                Serial.writePort(port,WebSerial.toDataView(parseInt(value)));
                                                                            } else Serial.writePort(port,WebSerial.toDataView((value)));
                                                                        }
                
                                                                        Serial.readStream(this.stream);
                                                                        console.log('reading stream', this.stream);

                                                                        (self.querySelector('[id="'+id+'"]') as HTMLElement).style.display = '';
                
                                                                        const xconnectEvent = (ev) => {
                                                                            Serial.closeStream(this.stream).then(() => {
                                                                                (self.querySelector('[id="'+id+'xconnect"]') as HTMLButtonElement).innerHTML = 'Reconnect';
                                                                                (self.querySelector('[id="'+id+'xconnect"]') as HTMLButtonElement).onclick = (ev) => {
                                                                                    Serial.closeStream(this.stream,()=>{
                                                                                        Serial.getPorts().then((ports) => { //check previously permitted ports for auto reconnect
                                                                                            for(let i = 0; i<ports.length; i++) {
                                                                                                if(ports[i].getInfo().usbVendorId === this.stream.info.usbVendorId && ports[i].getInfo().usbProductId === this.stream.info.usbProductId) {
                                                                                                    let settings = getSettings(ports[i]);
                                                                                                    Serial.openPort(ports[i], settings).then(()=>{
                                                                                                        let debugmessage = `serial port ${ports[i].getInfo().usbVendorId}:${ports[i].getInfo().usbProductId} read:`;
                                                                                                        this.stream = Serial.createStream({
                                                                                                            port:ports[i],
                                                                                                            frequency:1,
                                                                                                            ondata:(data:ArrayBuffer)=>{
                                                                                                                //pass to console
                                                                                                                this.output = decoders[this.decoder](data, debugmessage);
                                                                                                                
                                                                                                                if(outputmode.value === 'b') {
                                                                                                                    this.outputText += `${this.output}\n`
                                                                                                                }
                                                                                                                
                                                                                                                requestAnimationFrame(this.anim); //throttles animations to refresh rate
                                                                                                                //roughly...
                                                                                                                //decoderworker.request({route:'decode',args:data},[data]).then((value) => {document.getElementById('console').innerText = `${value}`;} )
                                                                                                            }
                                                                                                        });
                                                                                                        this.settings = settings;
                                                                                                        self.render(); //re-render, will trigger oncreate again to reset this button and update the template 
                                                                                                    });
                                                                                                    break;
                                                                                                }
                                                                                            }
                                                                                        });
                                                                                    });
                                                                                }
                                                                            });
                                                                        }
                
                                                                        (self.querySelector('[id="'+id+'xconnect"]') as HTMLButtonElement).onclick = xconnectEvent;
                
                                                                        (self.querySelector('[id="'+id+'x"]') as HTMLButtonElement).onclick = () => {
                                                                            Serial.closeStream(this.stream,()=>{
                                                                                
                                                                            }).catch(er=>console.error(er));
                                                                            this.delete();
                                                                            self.querySelector('[id="'+id+'console"]').remove(); //remove the adjacent output console
                                                                        }
                                                                    
                                                                        (self.querySelector('[id="'+id+'decoder"]') as HTMLInputElement).onchange = (ev) => {
                                                                            this.decoder = (self.querySelector('[id="'+id+'decoder"]') as HTMLInputElement).value;
                                                                        }
                                                                        
                                                                    });
                                                                }
                
                                                            }
                
                
                                                            ConnectionTemplate.addElement(`${id}-info`);
                                                            let elm = document.createElement(`${id}-info`);
                                                            //document.getElementById('connections').appendChild(elm);
                                                            
                                                            document.querySelector('device-debugger').querySelector('#connections').appendChild(elm);
                                                        });
                
                                    
                                                            
                                                            }
                                                        },
                                                    
                                                
                                            } as ElementProps,
                                            'serialconfigdropdown':{
                                                tagName:'button',
                                                innerText:'--',
                                                style:{
                                                    float:'right'
                                                },
                                                attributes:{
                                                    onclick:(ev)=>{
                                                        if(ev.target.parentNode.querySelector('#serialconfigcontainer').style.display === 'none') {
                                                            ev.target.parentNode.querySelector('#serialconfigcontainer').style.display = '';
                                                            ev.target.innerText = '--'
                                                        }
                                                        else {
                                                            ev.target.parentNode.querySelector('#serialconfigcontainer').style.display = 'none';
                                                            ev.target.innerText = '++'
                                                        }
                
                                                    }
                                                }
                                            } as ElementProps,
                                            'serialconfig':{ //need labels
                                                tagName:'div',
                                                children:{
                                                    'serialconfigcontainer':{
                                                        tagName:'div',
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
                                                                innerText:'Maximum read frequency? (ms)',
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
                                            } as ElementProps
                                        }
                                    } as ElementProps
                                }
                            } as ElementProps
                        }
                    } as ElementProps,
                    'connections':{
                        tagName:'div',
                        style:{
                            minHeight:'300px',
                            backgroundColor:'black'
                        }
                    } as ElementProps,
                    'customdecoder':{
                        tagName:'div',
                        innerHTML:'Custom Decoder',
                        style:{
                            display:'flex'
                        },
                        children:{
                            'testinput':{
                                tagName:'textarea',
                                attributes:{
                                    value:'[24,52,230,125,243,112,0,0,10,2,30]',
                                    onchange:(ev:Event)=>{
                                        let elm = (ev.target as HTMLInputElement);
                                        let value = (ev.target as HTMLInputElement).value;
                                        if(value.includes(',') && !value.includes('[')) {
                                            value = `[${value}]`;
                                        }
                                        try {
                                            value = JSON.parse(value);   
                                            if(Array.isArray(value)) {
                                                let testfunction = (elm.parentNode.querySelector('#testfunction') as HTMLInputElement).value;
                                                try {
                                                    let fn = (0, eval)(testfunction);
                                                    if(typeof fn === 'function') {
                                                        (elm.parentNode.querySelector('#testoutput') as HTMLElement).innerText = fn(value);
                
                                                    }
                                                } catch (er) {
                                                    (elm.parentNode.querySelector('#testoutput') as HTMLElement).innerText = er;
                                                }
                                            }
                                        } catch(er) {
                                            (elm.parentNode.querySelector('#testoutput') as HTMLElement).innerText = er;
                                        }
                                    }
                                }
                            } as ElementProps,
                            'codemirrorcss':{
                                tagName:'link',
                                attributes:{
                                    href:'./src/codemirror/codemirror.min.css',
                                    rel:'stylesheet'
                                }
                            },
                            'testfunction':{
                                tagName:'textarea',
                                onrender:(self) => {
                                    CodeMirror.fromTextArea(self, {
                                        styleActiveLine: true,
                                        lineNumbers: true,
                                        matchBrackets: true
                                    });
                                },
                                style:{
                                    display:'flex'
                                },
                                attributes:{
                                    value:`
                                        //value is an ArrayBuffer
                                        (value) => {
                                            return value;
                                        }
                                    `,
                                    onchange:(ev:Event) => { //when you click away
                                        let elm = (ev.target as HTMLInputElement);
                                        let value = (ev.target as HTMLInputElement).value;
                                        
                                        try {
                                            let fn = (0, eval)(value);
                                            if(typeof fn === 'function') {
                                                let testvalue = (elm.parentNode.querySelector('#testinput') as HTMLInputElement).value;
                                                if(testvalue.includes(',') && !testvalue.includes('[')) {
                                                    testvalue = `[${testvalue}]`;
                                                }
                                                try {
                                                    testvalue = JSON.parse(testvalue);  
                                                    (elm.parentNode.querySelector('#testoutput') as HTMLElement).innerText = fn(testvalue);
                                                } catch(er) {
                                                    (elm.parentNode.querySelector('#testoutput') as HTMLElement).innerText = er;
                                                } 
                                            }
                                        } catch (er) {
                                            (elm.parentNode.querySelector('#testoutput') as HTMLElement).innerText = er;
                                        }
                                    }
                                }
                            } as ElementProps,
                            'testoutput':{
                                tagName:'div',
                                style:{
                                    minHeight:'50px',
                                    minWidth:'50px',
                                    color:'white',
                                    backgroundColor:'black',
                                    overflowX:'scroll'
                                }
                            } as ElementProps,
                            'suggested':{
                                tagName:'div',
                                innerHTML:`Recognized chart/csv output format: return {[key:string]:number|number[]} where you are returning an object with key:value pairs for tagged channels and numbers/arrays to be appended`
                            } as ElementProps,
                            'decodernameLabel':{
                                tagName:'label',
                                innerText:'Name Decoder:',
                                children:{
                                    'decodername':{
                                        tagName:'input',
                                        attributes:{
                                            type:'text',
                                            value:'testdecoder',
                                            placeholder:'mydecoder'
                                        }
                                    }
                                }
                            } as ElementProps,
                            'submitdecoder':{
                                tagName:'button',
                                innerText:'Test & Set',
                                attributes:{
                                    onclick:(ev)=>{
                                        let elm = (ev.target as HTMLInputElement);
                                        let value = (ev.target as HTMLInputElement).value;
                                        try {
                                            let fn = (0, eval)(value);
                                            if(typeof fn === 'function') {
                                                let testvalue = (elm.parentNode.querySelector('#testinput') as HTMLInputElement).value;
                                                if(testvalue.includes(',') && !testvalue.includes('[')) {
                                                    testvalue = `[${testvalue}]`;
                                                }
                                                try {
                                                    testvalue = JSON.parse(testvalue);  
                                                    (elm.parentNode.querySelector('#testoutput') as HTMLElement).innerText = fn(testvalue);
                                                    let name = (elm.parentNode.querySelector('#decodername') as HTMLInputElement).value;
                                                    if(!name) name = 'mydecoder';
                                                    decoders[name] = fn; //set the decoder since it was successful

                                                    let option = `<option value='${name}'>${name}</option>`;
                                                    document.querySelectorAll('select').forEach((e) => {
                                                        if(e.id.includes('decoder')) {
                                                            e.insertAdjacentHTML('beforeend',option);
                                                        } //update existing selectors
                                                    })

                                                } catch(er) {
                                                    (elm.parentNode.querySelector('#testoutput') as HTMLElement).innerText = er;
                                                } 
                                            }
                                        } catch (er) {
                                            (elm.parentNode.querySelector('#testoutput') as HTMLElement).innerText = er;
                                        }
                                    }
                                }
                            } as ElementProps
                        }
                    } as ElementProps
                }
            } as ElementProps
        } 
    } as DOMElementProps
};



const router = new Router([
    workers,
    proxyWorkerRoutes, 
    workerCanvasRoutes,
    new DOMService({routes:domtree})
]);


console.log(router)