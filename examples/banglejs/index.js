/* 
    esbuild + nodejs development server. 
    Begin your javascript application here. This file serves as a simplified entry point to your app, 
    all other scripts you want to build can stem from here if you don't want to define more entryPoints 
    and an outdir in the bundler settings.

    Just ctrl-A + delete all this to get started on your app.

*/

import './index.css' //compiles with esbuild, just link the stylesheet in your index.html (the boilerplate shows this example)

import {
    initDevice,
    Devices,
    ab2str,
    uploadCode
} from 'device-decoder'

const btn = document.createElement('button');
btn.innerHTML = "Connect";
document.body.appendChild(btn);

btn.onclick = () => {

    initDevice(
        Devices.BLE.espruino,
        {
            onconnect:(device)=>{
                document.body.insertAdjacentHTML('beforeend',`
                    <div>Connected!</div>
                `);

                uploadCode(device,`
                    
                `);

            },
            ondecoded:()=>{}
        }
    )

}
