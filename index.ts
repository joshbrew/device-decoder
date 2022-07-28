import {StreamInfo, WebSerial} from './src/serial/serialstream'
import {BLEClient} from './src/ble/ble_client'
import {Router, DOMService, WorkerService, gsworker, ServiceMessage, proxyWorkerRoutes, workerCanvasRoutes, DOMElement} from '../GraphServiceRouter/index' //'graphscript'
import { ElementInfo, ElementProps } from 'graphscript/dist/services/dom/types/element';
import { DOMElementProps } from 'graphscript/dist/services/dom/types/component';

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
                console.log('setting up Serial', self.graph.Serial)

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
    'raw':(data:ArrayBuffer) => { return data; },
    'utf8':(data:ArrayBuffer) => { return textdecoder.decode(data); },
    'console-f12':(data:ArrayBuffer) => { console.log(data); return data; },
    'debug':(data:ArrayBuffer,debugmessage:string) => { console.log(debugmessage,data); return `${debugmessage} ${JSON.stringify(data)}`; }
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
        div {
            background-color: gray;
        }
        `,
        children:{
            'header':{
                tagName:'div',
                children:{
                    'bleconnect':{
                        tagName:'button',
                        innerText:'BLE Device',
                        oncreate:(self: HTMLElement, info?: ElementInfo)=>{
                            self.onclick = () => {

                                let services:any = {}; //comma separated
                                let reqlen = '0000CAFE-B0BA-8BAD-F00D-DEADBEEF0000'.length;
                                (document.getElementById('serviceuuid') as HTMLInputElement).value.split(',').forEach((uu) => { if(uu.length === reqlen) services[uu.toLowerCase()] = {}; else console.error('uuid format is wonk', uu, 'expected format (e.g.):', '0000CAFE-B0BA-8BAD-F00D-DEADBEEF0000'.toLowerCase()) }); //todo, set up characteristics on first go
                                if(Object.keys(services).length === 0) services = {['0000CAFE-B0BA-8BAD-F00D-DEADBEEF0000'.toLowerCase()]:{}};

                                BLE.setup({
                                    services
                                }).then((stream)=>{
                                    console.log(stream)

                                    class ConnectionTemplate extends DOMElement {
                                            
                                        stream=stream;
                                        output:any;

                                        anim:any;

                                        template = ()=>{ return `
                                            <div id='${this.stream.deviceId}' style='display:none;'>
                                                BLE Connection
                                                <div>
                                                    <span>BLE Device Name:</span><span>${this.stream.device.name}</span><span>BLE Device ID:</span><span>${this.stream.deviceId}</span>
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
                                                <div id='${this.stream.deviceId}connectioninfo'>RSSI: <span id='${this.stream.deviceId}rssi'></span></div>
                                                <div 
                                                    id='${this.stream.deviceId}console' 
                                                    style='color:white; background-color:black; font-size:10px; font-family:Consolas,monaco,monospace; overflow-y:scroll;'>
                                                </div>
                                            </div>`;
                                        }

                                        oncreate = (self:DOMElement,props:any) => {
                                            //spawn a graph based prototype hierarchy for the connection info?
                                            //e.g. to show the additional modularity off
    
                                            let c = document.getElementById(this.stream.deviceId+'console');
                                            let outputmode = document.getElementById(this.stream.deviceId+'outputmode') as HTMLInputElement;
    
                                            this.anim = () => { 
    
                                                if(outputmode.value === 'a') 
                                                    c.innerText = `${this.output}`; 
                                                else if (outputmode.value === 'b') {
                                                    let outp = `${this.output}`; if(!outp.endsWith('\n')) outp+='\n'; //need endline
                                                    c.innerText += outp;

                                                    if(c.innerText.length > 20000) { //e.g 20K char limit
                                                        c.innerText = c.innerText.substring(c.innerText.length - 20000, c.innerText.length); //trim output
                                                    }
                                                }
                                            }

                                            document.getElementById(this.stream.deviceId).style.display = '';

                                            const xconnectEvent = (ev) => {
                                                BLE.disconnect(this.stream.device).then(() => {
                                                    (self.querySelector(this.stream.deviceId+'xconnect') as HTMLButtonElement).innerHTML = 'Reconnect';
                                                    (self.querySelector(this.stream.deviceId+'xconnect') as HTMLButtonElement).onclick = (ev) => {  
                                                        BLE.reconnect(this.stream.deviceId).then((device) => {
                                                            this.output = 'Reconnected to ' + device.deviceId;
                                                            //self.render(); //re-render, will trigger oncreate again to reset this button and update the template 
                                                        })
                                                    }
                                                });
                                            }

                                            (self.querySelector(this.stream.deviceId+'xconnect') as HTMLButtonElement).onclick = xconnectEvent;

                                            (self.querySelector(this.stream.deviceId+'x') as HTMLButtonElement).onclick = () => {
                                                BLE.disconnect(this.stream.device);
                                                this.delete();
                                                document.getElementById(this.stream.deviceId+'console').remove(); //remove the adjacent output console
                                            }
                                        
                                            // (self.querySelector(this.stream.deviceId+'decoder') as HTMLInputElement).onchange = (ev) => {
                                            //     this.decoder = decoders[(self.querySelector(this.stream.deviceId+'decoder') as HTMLInputElement).value];
                                            // }

                                            let rssielm = document.getElementById(this.stream.device.deviceId + 'rssi');

                                            let rssiFinder = () => {
                                                if(BLE.devices[this.stream.device.deviceId]) {
                                                    BLE.readRssi(this.stream.device).then((rssi) => {
                                                        rssielm.innerText = `${rssi}`;
                                                        setTimeout(()=>{rssiFinder();},250);
                                                    }).catch(console.error);
                                                }
                                            }

                                            rssiFinder();


                                            BLE.client.getServices(this.stream.device.deviceId).then((svcs) => {
                                                console.log('services', svcs)
                                                document.getElementById(this.stream.deviceId+'info').innerHTML = `<tr><th>UUID</th><th>Notify</th><th>Read</th><th>Write</th><th>Broadcast</th><th>Indicate</th></tr>`
                                                svcs.forEach((s) => {    
                                                    document.getElementById(this.stream.deviceId+'info').insertAdjacentHTML('beforeend', `<tr colSpan=6><th>${s.uuid}</th></tr>`)
                                                    s.characteristics.forEach((c) => { 
                                                        //build interactivity/subscriptions for each available service characteristic based on readable/writable/notify properties
                                                        document.getElementById(this.stream.deviceId+'info').insertAdjacentHTML(
                                                            'beforeend', 
                                                            `<tr>
                                                                <td id='${c.uuid}'>${c.uuid}</td>
                                                                <td id='${c.uuid}notify'>${c.properties.notify ? `<button id="${c.uuid}notifybutton">Subscribe</button> Decoder: <select id="${c.uuid}notifydecoder">${Object.keys(decoders).map((d,i) => `<option value='${d}' ${i === 0 ? 'selected' : ''}>${d.toUpperCase()}</option>`).join('')}</select>` : ''}</td>
                                                                <td id='${c.uuid}read'>${c.properties.read ? `<button id="${c.uuid}readbutton">Read</button> Decoder: <select id="${c.uuid}readdecoder">${Object.keys(decoders).map((d,i) => `<option value='${d}' ${i === 0 ? 'selected' : ''}>${d.toUpperCase()}</option>`).join('')}</select>` : ''}</td>
                                                                <td id='${c.uuid}write'>${c.properties.write ? `<input type='text' id="${c.uuid}writeinput"></input><button id="${c.uuid}writebutton">Write</button>` : ''}</td>
                                                                <td id='${c.uuid}broadcast'>${c.properties.broadcast}</td>
                                                                <td id='${c.uuid}indicate'>${c.properties.indicate}</td>
                                                            </tr>`
                                                        );

                                                        if(c.properties.notify) {
                                                            let decoderselect = document.getElementById(c.uuid+'notifydecoder') as HTMLInputElement;
                                                            let debugmessage = `${c.uuid} notify:`
                                                            document.getElementById(c.uuid+'notifybutton').onclick = () => {
                                                                BLE.subscribe(this.stream.device, s.uuid, c.uuid, (result:DataView) => {
                                                                    this.output = decoders[decoderselect.value](result.buffer,debugmessage);

                                                                    //requestAnimationFrame(this.anim);
                                                                    this.anim();
                                                                })
                                                            }
                                                        }
                                                        if(c.properties.read) {
                                                            let decoderselect = document.getElementById(c.uuid+'readdecoder') as HTMLInputElement;
                                                            let debugmessage = `${c.uuid} read:`
                                                            document.getElementById(c.uuid+'readbutton').onclick = () => { 
                                                                BLE.read(this.stream.device, s.uuid, c.uuid, (result:DataView) => {
                                                                    this.output = decoders[decoderselect.value](result.buffer,debugmessage);

                                                                    //requestAnimationFrame(this.anim);
                                                                    this.anim();
                                                                })
                                                            }
                                                        }
                                                        if(c.properties.write) {
                                                            let writeinput = document.getElementById(c.uuid+'writeinput') as HTMLInputElement;
                                                            document.getElementById(c.uuid+'writebutton').onclick = () => { 
                                                                let value:any = writeinput.value;
                                                                if(parseInt(value)) value = parseInt(value);
                                                                BLE.write(this.stream.device, s.uuid, c.uuid, BLEClient.toDataView(value), () => {
                                                                    this.output = 'Wrote ' + value + 'to '+ c.uuid;

                                                                    //requestAnimationFrame(this.anim);
                                                                    this.anim();
                                                                })
                                                            }
                                                        }
                                                    }); 
                                                });
                                            })

                                                
                                        }

                                    }

                                    let id = `port${Math.floor(Math.random()*1000000000000000)}`;

                                    ConnectionTemplate.addElement(`${id}-info`);
                                    let elm = document.createElement(`${id}-info`);
                                    document.getElementById('connections').appendChild(elm);
                                    
                                }); //set options in bleconfig
                            }
                        }
                    } as ElementProps,
                    'bleconfig':{
                        tagName:'div',
                        style:{
                            fontSize:'10px',
                            textAlign:'right'
                        },
                        children:{
                            'bleconfigdropdown':{
                                tagName:'button',
                                innerText:'--',
                                attributes:{
                                    onclick:(ev)=>{
                                        if(document.getElementById('bleconfigcontainer').style.display === 'none') {
                                            document.getElementById('bleconfigcontainer').style.display = '';
                                            document.getElementById('bleconfigdropdown').innerText = '--'
                                        }
                                        else {
                                            document.getElementById('bleconfigcontainer').style.display = 'none';
                                            document.getElementById('bleconfigdropdown').innerText = '++'
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
                                        innerText:'Primary Service UUID',
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
                                    'ln3':{template:'<br/>'},
                                    'servicesLabel':{
                                        tagName:'label',
                                        innerText:'Services Config ',
                                        children:{
                                            'services':{ //need to configure options for multiple services and multiple characteristics per service in like a table
                                                tagName:'table',
                                                style:{
                                                    border:'1px solid black',
                                                    display:'flex'
                                                },
                                                children:{
                                                }
                                            } as ElementProps
                                        }
                                    }
                                }
                            } as ElementProps,
                        } as ElementProps,
                    } as ElementProps,
                    'serialconnect':{
                        tagName:'button',
                        innerText:'USB Device',
                        oncreate:(self: HTMLElement, info?: ElementInfo)=>{
                            self.onclick = () => {

                                //TODO: do this on a thread instead...
                                Serial.requestPort(
                                    (document.getElementById('usbVendorId') as HTMLInputElement).value ? parseInt((document.getElementById('usbVendorId') as HTMLInputElement).value) : undefined,
                                    (document.getElementById('usbProductId') as HTMLInputElement).value ? parseInt((document.getElementById('usbProductId') as HTMLInputElement).value) : undefined
                                ).then((port)=>{

                                    class ConnectionTemplate extends DOMElement {
                                            
                                        stream:StreamInfo;
                                        output:any;
                                        settings:any;
                                        lastRead:number=0;
                                        readRate:number=0;

                                        getSettings = (port:SerialPort) => { //util function on this node
                                            let settings:any = {
                                                baudRate:(document.getElementById('baudRate') as HTMLInputElement).value ? parseInt((document.getElementById('baudRate') as HTMLInputElement).value) : 115200, //https://lucidar.me/en/serialib/most-used-baud-rates-table/
                                                bufferSize:(document.getElementById('bufferSize') as HTMLInputElement).value ? parseInt((document.getElementById('bufferSize') as HTMLInputElement).value) : 255,
                                                parity:(document.getElementById('parity') as HTMLInputElement).value ? (document.getElementById('parity') as HTMLInputElement).value as ParityType : 'none',
                                                dataBits:(document.getElementById('dataBits') as HTMLInputElement).value ? parseInt((document.getElementById('dataBits') as HTMLInputElement).value) : 8,
                                                stopBits:(document.getElementById('stopBits') as HTMLInputElement).value ? parseInt((document.getElementById('stopBits') as HTMLInputElement).value) : 1,
                                                flowControl:(document.getElementById('flowControl') as HTMLInputElement).value ? (document.getElementById('flowControl') as HTMLInputElement).value as FlowControlType : 'none',
                                                onconnect:(ev)=>{ console.log('connected! ', JSON.stringify(port.getInfo())); },
                                                ondisconnect:(ev)=>{ console.log('disconnected! ', JSON.stringify(port.getInfo())); },
                                                decoder:'raw' //default
                                            }

                                            return settings;
                                        }


                                        constructor() {
                                            super(); 

                                            this.settings = this.getSettings(port);

                                            let debugmessage = `serial port ${port.getInfo().usbVendorId}:${port.getInfo().usbProductId} read:`;

                                            this.stream = Serial.createStream({
                                                port,
                                                frequency:1,
                                                ondata:(data:ArrayBuffer)=>{
                                                    //pass to console
                                                    this.stream.output = decoders[this.settings.decoder](data,debugmessage);

                                                    let now = performance.now();
                                                    this.readRate = 1/(0.001*(now - this.lastRead)); //reads per second.
                                                    this.lastRead = now;

                                                    //requestAnimationFrame(this.settings.anim); //throttles animations to refresh rate
                                                    if(this.settings.anim) this.settings.anim();
                                                    //roughly...
                                                    //decoderworker.request({route:'decode',args:data},[data]).then((value) => {document.getElementById('console').innerText = `${value}`;} )
                                                }
                                            });
        
                                        };

                                        template = ()=>{ return `
                                            <div id='${this.stream._id}' style='display:none;'>
                                                Serial Connection
                                                <div>
                                                    <span>USB Vendor ID:</span><span>${this.stream.info.usbVendorId}</span><span>USB Product ID:</span><span>${this.stream.info.usbProductId}</span>
                                                </div>
                                                <table id='${this.stream._id}info'>
                                                    <tr><th>Baud Rate</th><th>Buffer Size</th><th>Parity</th><th>Data Bits</th><th>Stop Bits</th><th>Flow Control</th></tr>
                                                    <tr><td>${this.stream.settings.baudRate}</td><td>${this.stream.settings.bufferSize}</td><td>${this.stream.settings.parity}</td><td>${this.stream.settings.dataBits}</td><td>${this.stream.settings.stopBits}</td><td>${this.stream.settings.flowControl}</td></tr>
                                                </table>
                                                <div>
                                                    <input id='${this.stream._id}input' type='text' value='0x01'></input>
                                                    <button id='${this.stream._id}send'>Send</button>
                                                    <button id='${this.stream._id}xconnect'>Disconnect</button>
                                                    <button id='${this.stream._id}x'>Remove</button>
                                                </div>
                                                <div>
                                                    <label>
                                                        Decoder:
                                                        <select id='${this.stream._id}decoder'>
                                                            ${Object.keys(decoders).map((d,i) => `<option value='${d}' ${i === 0 ? 'selected' : ''}>${d.toUpperCase()}</option>`).join('')}
                                                        </select>
                                                    </label>
                                                    <label>
                                                        Output Mode: <br/>
                                                        <select id='${this.stream._id}outputmode'>
                                                            <option value='b' selected> All </option>
                                                            <option value='a'> Latest </option>
                                                        </select>
                                                    </label>
                                                </div>
                                                <div id='${this.stream._id}connectioninfo'>Read Rate: <span id='${this.stream._id}readrate'></span> updates/sec</div>
                                                <div id='${this.stream._id}console' style='color:white; background-color:black; font-size:10px; font-family:Consolas,monaco,monospace; overflow-y:scroll;'>
                                                </div>
                                            </div>`;
                                        }

                                        oncreate = (self:DOMElement,props:any) => {

                                            //spawn a graph based prototype hierarchy for the connection info?
                                            //e.g. to show the additional modularity off
    
                                            let c = document.getElementById(this.stream._id+'console');
                                            let outputmode = document.getElementById(this.stream._id+'outputmode') as HTMLInputElement;
                                            let readrate = document.getElementById(this.stream._id+'readrate');
    
                                            this.settings.anim = () => { 

                                                readrate.innerText = this.readRate.toFixed(6);
    
                                                if(outputmode.value === 'a') 
                                                    c.innerText = `${this.output}`; 
                                                else if (outputmode.value === 'b') {
                                                    let outp = `${this.output}`; if(!outp.endsWith('\n')) outp+='\n'; //need endline
                                                    c.innerText += outp;

                                                    if(c.innerText.length > 20000) { //e.g 20K char limit
                                                        c.innerText = c.innerText.substring(c.innerText.length - 20000, c.innerText.length); //trim output
                                                    }
                                                }
                                            }

                                            Serial.openPort(port, this.settings).then(()=>{

                                                (self.querySelector(this.stream._id+'send') as HTMLButtonElement).onclick = () => {
                                                    let value = (document.getElementById(this.stream._id+'input') as HTMLButtonElement).value;
                                                    if(parseInt(value)) {
                                                        Serial.writePort(port,WebSerial.toDataView(parseInt(value)));
                                                    } else Serial.writePort(port,WebSerial.toDataView((value)));
                                                }

                                                Serial.readStream(this.stream);
                                                document.getElementById(this.stream._id).style.display = '';

                                                const xconnectEvent = (ev) => {
                                                    Serial.closeStream(this.stream).then(() => {
                                                        (self.querySelector(this.stream._id+'xconnect') as HTMLButtonElement).innerHTML = 'Reconnect';
                                                        (self.querySelector(this.stream._id+'xconnect') as HTMLButtonElement).onclick = (ev) => {
                                                            Serial.getPorts().then((ports) => { //check previously permitted ports for auto reconnect
                                                                for(let i = 0; i<ports.length; i++) {
                                                                    if(ports[i].getInfo().usbVendorId === this.stream.info.usbVendorId && ports[i].getInfo().usbProductId === this.stream.info.usbProductId) {
                                                                        let settings = this.getSettings(ports[i]);
                                                                        Serial.openPort(ports[i], settings).then(()=>{
                                                                            let debugmessage = `serial port ${ports[i].getInfo().usbVendorId}:${ports[i].getInfo().usbProductId} read:`;
                                                                            this.stream = Serial.createStream({
                                                                                port:ports[i],
                                                                                frequency:1,
                                                                                ondata:(data:ArrayBuffer)=>{
                                                                                    //pass to console
                                                                                    this.output = decoders[this.settings.decoder](data, debugmessage);
                                                                                    
                                                                                    requestAnimationFrame(this.settings.anim); //throttles animations to refresh rate
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
                                                        }
                                                    });
                                                }

                                                (self.querySelector(this.stream._id+'xconnect') as HTMLButtonElement).onclick = xconnectEvent;

                                                (self.querySelector(this.stream._id+'x') as HTMLButtonElement).onclick = () => {
                                                    Serial.closeStream(this.stream,()=>{
                                                        
                                                    }).catch(er=>console.error(er));
                                                    this.delete();
                                                        document.getElementById(this.stream._id+'console').remove(); //remove the adjacent output console
                                                }
                                            
                                                (self.querySelector(this.stream._id+'decoder') as HTMLInputElement).onchange = (ev) => {
                                                    this.settings.decoder = decoders[(self.querySelector(this.stream._id+'decoder') as HTMLInputElement).value];
                                                }
                                                
                                            });
                                        }

                                    }

                                    let id = `port${Math.floor(Math.random()*1000000000000000)}`;

                                    ConnectionTemplate.addElement(`${id}-info`);
                                    let elm = document.createElement(`${id}-info`);
                                    document.getElementById('connections').appendChild(elm);
                                    
                                });

    
                            }
                        }
                    } as ElementProps,
                    'serialconfig':{ //need labels
                        tagName:'div',
                        style:{
                            fontSize:'10px',
                            textAlign:'right'
                        },
                        children:{
                            'serialconfigdropdown':{
                                tagName:'button',
                                innerText:'--',
                                attributes:{
                                    onclick:(ev)=>{
                                        if(document.getElementById('serialconfigcontainer').style.display === 'none') {
                                            document.getElementById('serialconfigcontainer').style.display = '';
                                            document.getElementById('serialconfigdropdown').innerText = '--'
                                        }
                                        else {
                                            document.getElementById('serialconfigcontainer').style.display = 'none';
                                            document.getElementById('serialconfigdropdown').innerText = '++'
                                        }

                                    }
                                }
                            },
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
                    } as ElementProps
                }
            } as ElementProps,
            'connections':{
                tagName:'div',
                style:{
                    height:'300px',
                    display:'flex'
                }
            },
            'customdecoder':{
                tagName:'div',
                innerHTML:'Custom Decoder',
                children:{
                    'testinput':{
                        tagName:'input',
                        attributes:{
                            type:'text',
                            value:'[24,52,230,125,243,112,0,0,10,2,30]',
                            onchange:(ev:Event)=>{
                                let value = (ev.target as HTMLInputElement).value;
                                if(value.includes(',') && !value.includes('[')) {
                                    value = `[${value}]`;
                                }
                                try {
                                    value = JSON.parse(value);   
                                    if(Array.isArray(value)) {
                                        let testfunction = (document.getElementById('testfunction') as HTMLInputElement).value;
                                        try {
                                            let fn = eval(testfunction);
                                            if(typeof fn === 'function') {
                                                document.getElementById('testoutput').innerText = fn(value);
        
                                            }
                                        } catch (er) {
                                            document.getElementById('testoutput').innerText = er;
                                        }
                                    }
                                } catch(er) {
                                    document.getElementById('testoutput').innerText = er;
                                }
                            }
                        }
                    },
                    'testfunction':{
                        tagName:'input',
                        attributes:{
                            type:'textarea',
                            value:`
                                //value is an ArrayBuffer
                                (value) => {
                                    return value;
                                }
                            `,
                            onchange:(ev:Event) => { //when you click away
                                let value = (ev.target as HTMLInputElement).value;
                                try {
                                    let fn = eval(value);
                                    if(typeof fn === 'function') {
                                        let testvalue = (document.getElementById('testvalue') as HTMLInputElement).value;
                                        if(testvalue.includes(',') && !testvalue.includes('[')) {
                                            testvalue = `[${testvalue}]`;
                                        }
                                        try {
                                            testvalue = JSON.parse(testvalue);  
                                            document.getElementById('testoutput').innerText = fn(testvalue);
                                        } catch(er) {
                                            document.getElementById('testoutput').innerText = er;
                                        } 
                                    }
                                } catch (er) {
                                    document.getElementById('testoutput').innerText = er;
                                }
                            }
                        }
                    },
                    'testoutput':{
                        tagName:'div'
                    },
                    'suggested':{
                        tagName:'div',
                        innerHTML:`Recognized chart/csv output format: return {[key:string]:number|number[]} where you are returning an object with key:value pairs for tagged channels and numbers/arrays to be appended`
                    },
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
                    },
                    'submitdecoder':{
                        tagName:'button',
                        innerText:'Test & Set',
                        attributes:{
                            onclick:(ev)=>{
                                let value = (ev.target as HTMLInputElement).value;
                                try {
                                    let fn = eval(value);
                                    if(typeof fn === 'function') {
                                        let testvalue = (document.getElementById('testvalue') as HTMLInputElement).value;
                                        if(testvalue.includes(',') && !testvalue.includes('[')) {
                                            testvalue = `[${testvalue}]`;
                                        }
                                        try {
                                            testvalue = JSON.parse(testvalue);  
                                            document.getElementById('testoutput').innerText = fn(testvalue);
                                            let name = (document.getElementById('decodername') as HTMLInputElement).value;
                                            if(!name) name = 'mydecoder';
                                            decoders[name] = fn; //set the decoder since it was successful

                                            let option = `<option value='${name}'>${name}</option>`;
                                            document.querySelectorAll('select').forEach((e) => {
                                                if(e.id.includes('decoder')) {
                                                    e.insertAdjacentHTML('beforeend',option);
                                                } //update existing selectors
                                            })

                                        } catch(er) {
                                            document.getElementById('testoutput').innerText = er;
                                        } 
                                    }
                                } catch (er) {
                                    document.getElementById('testoutput').innerText = er;
                                }
                            }
                        }
                    }
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