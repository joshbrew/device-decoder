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
    uploadCode
} from '../../src/device.frontend' //device-decoder

const btn = document.createElement('button');
btn.innerHTML = "Connect";
document.body.appendChild(btn);

const logger = document.createElement('log-table');

logger.maxMessages = 20;
logger.scrollable = true;
logger.style.width = '100%';


document.body.appendChild(logger);


logger.log(
    "Connect your device to upload a test program"
);

btn.onclick = () => {

    initDevice(
        Devices.BLE.espruino,
        {
            onconnect:(device)=>{
                
                logger.log(
                    "Connected!"
                );

uploadCode(device,`
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
