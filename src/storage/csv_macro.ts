import { ArrayManip } from '../util/arraymanip';
import { appendFile, exists, fs, writeFile } from './BFSUtils';
import { toISOLocal } from './csv';
//We have object formats coming in like {x,y,z}, tied to devices with USB data or BLE data with specifiers 

//so we should ned up with a CSV that has one header for device info, one header for the actual column tops,
//  then it should dynamically append whatever data/devices we feed it and handle general timestamping for us
//temp
const csvs:{
    [filename:string]:{ //key is filename
        header:string[],
        latest:any[][], //latest 1000 lines, unjoined
        
    }
} = {}

//in our case we are receiving data in a uniform format 
export const appendCSV = (
    newData:{[key:string]:number|number[]}, //assume uniformly sized data is passed in, so pass separate timestamp intervals separately
    filename:string
) => {
    let csv = csvs[filename];
    if(!csv) {
        csvs[filename] = {
            header:[] as string[],
            latest:[] as any
        };
        csv = csvs[filename];
    }

    
    let toAppend = [] as any;
    let x = newData[csv.header[0]]; //
    let keys = Object.keys(newData);
    if(!x) {
        x = newData[keys[0]];
        let lastTime;
        if(
            csv.header[0]?.toLowerCase().includes('time') || 
            csv.header[0]?.toLowerCase().includes('unix')
        ) {
            if(Array.isArray(x)) {
                toAppend = x.map((v) => toAppend.push([]));
                lastTime = csv.latest;
                if(!lastTime) {
                    lastTime = Date.now();            
                    toAppend[toAppend.length-1][0] = lastTime;
                    toAppend[toAppend.length-1][1] = toISOLocal(lastTime);
                } else {
                    let nextTime = Date.now();
                    let interp = ArrayManip.upsample([lastTime,nextTime],x.length);
                    let iso = interp.map((v) => toISOLocal(v));
                    toAppend.map((a,i) => { a[0] = interp[i]; a[1] = iso[i];  });
                }
            } else {
                let now = Date.now();
                toAppend.push([now,toISOLocal(now)])
            }
        }
        else {
            if(Array.isArray(x)) {
                toAppend = x.map((v) => toAppend.push([v]));
            } else {
                toAppend.push([x]);
            }
        }
    } else {
        if(Array.isArray(x)) {
            if(
                csv.header[0]?.toLowerCase().includes('time') || 
                csv.header[0]?.toLowerCase().includes('unix')
            ) {
                if(Array.isArray(x)) {
                    toAppend = x.map((v) => toAppend.push([]));
                    toAppend.map((a,i) => { a[0] = x[i]; a[1] = toISOLocal(x[i]);  });
                } else {
                    toAppend.push([x,toISOLocal(x)])
                }
            }
        } else {
            if(
                csv.header[0]?.toLowerCase().includes('time') || 
                csv.header[0]?.toLowerCase().includes('unix')
            ) {
                toAppend.push([x,toISOLocal(x)]);
            } else {
                toAppend.push([x]);
            }
        }
    }

    //we've assembled the new arrays to append and included the first index
    for(let i = 1; i < csv.header.length; i++) {
        if(csv.header[i] === 'localized') continue;
        if(newData[csv.header[i]]) {
            if(Array.isArray(newData[csv.header[i]])) {
                toAppend.map((arr,j) => arr[i] = newData[csv.header[i]][j]);
            }
        } else {
            toAppend[0][i] = newData[csv.header[i]];
        }
    } 

    let csvProcessed = '';
    toAppend.forEach((arr) => {
        csvProcessed += arr.join(',') + '\n';    
    })

    csv.latest = toAppend[toAppend.length-1]; //reference the last array written as the latest data for if we don't pass timestamps

    //okay we are ready to append arrays to the file
    return new Promise((res,rej) => {
        exists(filename).then((fileExists) => {
            if(!fileExists) {
                writeFile(
                    filename,
                    csv.header.join(',')+'\n' + csvProcessed,
                    (written:boolean) => {
                        res(written);
                    }
                );
            } else {
                appendFile(
                    filename, 
                    csvProcessed, 
                    (written:boolean) => {
                        res(written);
                    }
                );
            }
        });
    }) as Promise<boolean>
}

export const createCSV = (
    filename:string,
    header:string[]
) => {
    if(header[0].toLowerCase().includes('time') || header[0].toLowerCase().includes('unix')) {
        header.splice(1,0,'localized') //toISOLocal
    }

    csvs[filename] = {
        header,
        latest:[] as any
    };

}
