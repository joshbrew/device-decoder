import { ArrayManip } from '../util/arraymanip';
//We have object formats coming in like {x,y,z}, tied to devices with USB data or BLE data with specifiers 

//so we should ned up with a CSV that has one header for device info, one header for the actual column tops,
//  then it should dynamically append whatever data/devices we feed it and handle general timestamping for us


//in our case we are receiving data in a uniform format 
export const BuildCSV = (
    existingData:string|'x\na,b,c\n,1,2,3\n', 
    newData:{
        [key:string]:number[]|{
            [key:string]:number[]|{
                [key:string]:number[]
            }
        }
    },
) => {

    //first we need to parse existing data for the headers.
    let firstnewline = existingData.indexOf('\n');
    let head = existingData.substring(0,firstnewline).split(',');
    let head2 = existingData.substring(firstnewline+1,existingData.indexOf(existingData,firstnewline+1));

    

    let timestamps;
    if(newData.timestamps) timestamps = newData.timestamps;


    for(const key in newData) {
        if(Array.isArray(newData[key])) {

        }
    }
}