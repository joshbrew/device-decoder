
//OTHER devices follow a general format:
/*
    connect -> init device and scripts
    disconnect -> close device connection
    onconnect -> onconnect callback you can customize
    ondata -> ondata callback you can customize
    ondisconnect -> disconnect callback you can customize
    codec -> optionally used to transform streams e.g. on a separate thread, libraries like muse-js already do it for us so we can just customize ondata to handle output, or use the codec to do some kind of special math on a thread
*/

import { WebglLinePlotProps } from "webgl-plot-utils";
import { FilterSettings } from "../../util/BiquadFilters";
import {webgazer} from "./dependencies/webgazer.esm" //imports "webgazer"

export {webgazer}

const sps = 30; //?? variable

export const webgazerSettings = { //include muse-js and import {MuseClient} from 'muse-js' for this to work
    sps,
    deviceType:'CUSTOM',
    deviceName:'webgazer',
    debug:false, //set to true to see a video feed with face tracking data
    regression:'weightedRidge',
    regressionModule:undefined,
    tracker:undefined,
    trackerModule:undefined,
    connect:(settings:any={}) => {
        return new Promise(async (res,rej) => {
            let _id = `webgazer${Math.floor(Math.random()*1000000000000000)}`;

            // //@ts-ignore
            // if(typeof Ganglion === 'undefined') { document.head.insertAdjacentHTML('beforeend',`<script src="https://cdn.jsdelivr.net/npm/ganglion-browser-min@1.0.2/dist/index.js"></script>`) }

            let info = {
                _id,
                webgazer,
                //begun:false,
                settings:Object.assign(Object.assign({},webgazerSettings),settings) //e.g. customize ondisconnect
            }

            //if(!info.begun) {
            webgazer.setGazeListener((data:{
                eyeFeatures: any,
                x: number,
                y: number
            },_:number) => {
                if(data == null) return;
                info.settings.ondata(data);
                
            }).begin();
            //} else webgazer.resume();

            if(settings.tracker) 
                webgazer.setTracker(settings.tracker);
            if(settings.trackerModule)
                webgazer.addTrackerModule("newTracker", settings.trackerModule);
            if(settings.regression)
                webgazer.setRegression(settings.regression);
            if(settings.regressionModule)
                webgazer.addRegressionModule("newReg", settings.regressionModule);

            if(info.settings.debug) {
                webgazer.showVideo(true);
                webgazer.showFaceOverlay(true);
                webgazer.showFaceFeedbackBox(true);
                webgazer.showPredictionPoints(true);
                let interval = setInterval(() => {
                    if(webgazer.isReady()) {
                        clearInterval(interval);
                        let video = document.getElementById('webgazerVideoContainer')
                        if (video) {
                            video.style.position = 'absolute';
                            video.style.top = '0';
                            video.style.left = 'auto';
                            video.style.right = '0';
                            video.style.zIndex = '1000';
                            video.style.width = '200px';
                            video.style.height = '200px';
                        }
                    }
                    else {
                        console.log('webgazer not loaded ____')
                    }
                },1000);
            }

            if(info.settings.onconnect) info.settings.onconnect(info);

            res(info);
        })
        
    },
    codec:(reading:{eyeFeatures:any, x:number, y:number}) => { //remap outputs to more or less match the rest of our formatting
        return reading
    },
    disconnect:(info) => {
        info.webgazer.end();
        //info.webgazer.pause();
    },
    onconnect:(info)=>{
        console.log('webgazer connected!', info);
    }, 
    beforedisconnect:(info) => {

    },
    ondisconnect:(info)=>{
        console.log('webgazer disconnected!', info);
    },
    ondata:(data:any)=>{
        console.log(data); //direct from teh device output
    },
    read:(info:any,command?:any)=>{
        return info.webgazer.getCurrentPrediction();
    },
    distance:function (x1, y1, x2, y2) {
        let x = (x1-x2)*(x1-x2);
        let y = (y1-y2)*(y1-y2);
        return Math.sqrt(x+y);
    }
    //write:(info:any,command?:any)=>{}
}


const defaultChartSetting = {nSec:10, sps, units:'px'};
export const webgazerChartSettings:Partial<WebglLinePlotProps> = {
    lines:{
        'x':JSON.parse(JSON.stringify(defaultChartSetting)),
        'y':JSON.parse(JSON.stringify(defaultChartSetting)),
    },
    generateNewLines:false 
};
