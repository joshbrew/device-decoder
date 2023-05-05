import {Devices, initDevice, workers} from 'device-decoder'//'../device_debugger/src/device.frontend'
import gsworker from './device.worker'
import { BFSRoutes, csvRoutes } from 'graphscript-services.storage';

import { WGLPlotter } from './webglplot/plotter';
import plotworker from './webglplot/canvas.worker'
import { WebglLineProps } from 'webgl-plot-utils';
import { ads131m08ChartSettings } from 'device-decoder/src/devices/ads131m08';

let csvworker = workers.addWorker({url:gsworker});

let sbutton = document.createElement('button');

let selectedChannel = 0;
let ledGPIO = [25,22,255] //255 is ambient

let head = ['timestamp'] as any[];

ledGPIO.forEach((l) => {
    head.push(l+'_'+selectedChannel);
})

sbutton.onclick = () => {
    let created = false;
    initDevice(Devices.BLE.nrf5x, {
        workerUrl:gsworker,
        ondecoded:{
            '0002cafe-b0ba-8bad-f00d-deadbeef0000': (data: { //ads131m08 (main)
                [key: string]: number[]
            }) => {
                //console.log(data);
                if(data.leds) {
                    let result = {timestamp:data.timestamp};
                    data.leds.forEach((v,j) => {
                        for(let i = 0; i < 8; i++) {
                            if(i !== selectedChannel) continue;
                            if(!result[v+'_'+i]) result[v+'_'+i] = [] as any[];
                            result[v+'_'+i].push(data[i][j]);
                        }
                    });

                    if(!created) {
                        let title = 'data/'+new Date().toISOString()+'_FNIRS.csv'; 
                        csvworker.run('createCSV', [title, head, 5, 250 ]).then(async () => {
                            list();
                        });
                        created = true;
                    }

                    plotter.__operator(result);

                    csvworker.run('appendCSV', result);
                }
            }
        }
    });
}

sbutton.innerHTML = "Connect Device";

document.body.appendChild(sbutton);

let files = document.createElement('div');
document.body.appendChild(files);
list();


let chart = document.createElement('canvas');
let overlay = document.createElement('canvas');
chart.style.width = '1200px';
chart.style.height = '800px';
chart.height = 800;
chart.width = 1200;
overlay.style.width = '1200px';
overlay.style.height = '800px';
overlay.height = 800;
overlay.width = 1200;
overlay.style.transform = 'translate(0,-800px)';

document.body.appendChild(chart);
document.body.appendChild(overlay);

let plotter = new WGLPlotter({
    canvas:chart,
    overlay:overlay,
    lines:{} as any, //will render all lines unless specified
    generateNewLines:true,
    cleanGeneration:false,
    worker:plotworker
});

async function list() {
    let filelist = await BFSRoutes.listFiles('data');
    files.innerHTML = "";
    filelist.forEach((file) => {

        let download = async () => {
            csvRoutes.writeToCSVFromDB('data/'+file, 10); //download files in chunks (in MB). !0MB limit recommended, it will number each chunk for huge files
        }

        let deleteFile = () => {
            BFSRoutes.deleteFile('data/'+file).then(() => {
                list();
            });
        }

        files.insertAdjacentHTML('afterbegin',`
            <div id="${file}">
                <span>${file}
                <button id="dl">Download</button>
                <button id="del">Delete</button>
                </span>
            </div>
        `);

        let elm = document.getElementById(file);
        console.log(elm);

        (elm?.querySelector('#dl') as any).onclick = download;
        (elm?.querySelector('#del') as any).onclick = deleteFile;

    });
}
