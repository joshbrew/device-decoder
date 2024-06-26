/* 
    esbuild + nodejs development server. 
    Begin your javascript application here. This file serves as a simplified entry point to your app, 
    all other scripts you want to build can stem from here if you don't want to define more entryPoints 
    and an outdir in the bundler settings.

    Just ctrl-A + delete all this to get started on your app.

*/

import './index.css' //compiles with esbuild, just link the stylesheet in your index.html (the boilerplate shows this example)

import './components/logger/logger'

import {
    initDevice,
    Devices,
    ab2str,
    uploadEspruinoCode,
    writeEspruinoCommand,
    espruinoNames,
} from 'device-decoder'//'../../src/device.frontend' //device-decoder

const btn = document.createElement('button');
btn.innerHTML = "Connect";
document.body.appendChild(btn);

const logger = document.createElement('log-table');

logger.maxMessages = 20;
logger.scrollable = true;


const select = document.createElement('select');

espruinoNames.forEach((name) => {
    select.innerHTML += `<option value="${name}" ${name === 'Bangle.js' ? 'selected' : ''}>${name}</option>`;
});

select.onchange = () => {
    Devices.BLE.espruino.namePrefix = select.value;
}

document.body.appendChild(select);
document.body.appendChild(logger);

logger.style.width = '100%';
logger.style.height = '500px';

logger.log(
    "Connect your device to upload a test accelerometer program"
);

const input = document.createElement('textarea');
const send = document.createElement('button');
const rset = document.createElement('button');
const opts = document.createElement('select');
opts.innerHTML = `
    <option value="a" selected>Command</option>
    <option value="b">Program</option>
`;

send.innerHTML = `Send`;
rset.innerHTML = `Reset`;

input.placeholder = 'reset(); etc...'

document.body.appendChild(opts);
document.body.appendChild(send);
document.body.appendChild(rset);
document.body.insertAdjacentHTML('beforeend','</br>');
document.body.appendChild(input);



btn.onclick = () => {

    initDevice(
        Devices.BLE.espruino,
        {
            onconnect:(device)=>{

                send.onclick = () => {
                    if(input.value.length < 1) return;
                    if(opts.value === 'a') {
                        writeEspruinoCommand(device, input.value);
                    }
                    if(opts.value === 'b') {
                        uploadEspruinoCode(device, input.value);
                    }
                }

                rset.onclick = () => {
                    writeEspruinoCommand(device,'reset();')
                }
                
                logger.log(
                    "Connected!"
                );

uploadEspruinoCode(device,`
Bangle.on('accel',function(a) {
    var d = [
        "A",
        Math.round(a.x*100),
        Math.round(a.y*100),
        Math.round(a.z*100)
        ];
    Bluetooth.println(d.join(","));
});
`);

            },
            ondecoded:(data)=>{
                const str = ab2str(data.output);

                logger.log(str);
            }
        }
    )

}
