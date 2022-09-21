
//OTHER devices follow a general format:
/*
    connect -> init device and scripts
    disconnect -> close device connection
    onconnect -> onconnect callback you can customize
    ondata -> ondata callback you can customize
    ondisconnect -> disconnect callback you can customize
    codec -> optionally used to transform streams e.g. on a separate thread, libraries like muse-js already do it for us so we can just customize ondata to handle output, or use the codec to do some kind of special math on a thread
*/


export const simulatorSettings = { 
    sps:250, 
    simulate: { //todo: make this more functional rather than only allowing a single amplitude sine wave, otherwise you can simply adjust these settings to generate new data 
        '0':{sps:250, freq:1, amplitude:1, offset:0},
        '1':{sps:250, freq:10, amplitude:1, offset:0},
        '2':{sps:250, freq:100, amplitude:0.5, offset:0.5},
        '3':{sps:250, freq:25, amplitude:1, offset:0}
    },
    connect:(settings:any={}) => {
        return new Promise(async (res,rej) => {
            let _id = `simulated${Math.floor(Math.random()*1000000000000000)}`;

            //if
            let info = {
                _id,
                settings:Object.assign(Object.assign({}, simulatorSettings),settings) //e.g. customize ondisconnect
            }
            info.settings.looping = true;

            let loopTime = 50;
            let lastTime = Date.now();

            let loop = () => {
                if(info.settings.looping) {

                    let newData = {} as any;

                    let now = Date.now();
                    let frame = now - lastTime;

                    for(const key in info.settings.simulate) {
                        let newPoints = Math.floor(info.settings.simulate[key].sps * frame/1000);
                        newData[key] = new Array(newPoints).fill(0);
                        newData[key] = newData[key].map((v,i) => {
                            return Math.sin(
                                2*Math.PI * info.settings.simulate[key].freq * 
                                0.001*(lastTime + (frame*(i+1)/newPoints))
                            ) * info.settings.simulate[key].amplitude + info.settings.simulate[key].offset;
                        });
                    }
                    lastTime = now;
                    newData.timestamp = lastTime;

                    info.settings.ondata(newData);

                    setTimeout(()=>{
                        loop();
                    },loopTime);
                }
            }

            loop();

            if(info.settings.onconnect) info.settings.onconnect(info);

            res(info);
        })
        
    },
    codec:(reading:any) => { //remap outputs to more or less match the rest of our formatting
        return reading; //Nothing to see here
    },
    disconnect:(info) => {
        console.log(info);
        info.settings.looping = false;
        info.settings.ondisconnect(info);
    },
    onconnect:(info)=>{
        console.log('muse connected!', info);
    }, 
    ondisconnect:(info)=>{
        console.log('muse disconnected!', info);
    },
    ondata:(data:any)=>{
        console.log(data); //direct from device
    }
    //read:(info:any,command?:any)=>{},
    //write:(info:any,command?:any)=>{}
}

