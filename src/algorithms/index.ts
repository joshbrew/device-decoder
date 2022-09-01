
import { beat_detect } from './pulseDetect/beat_detect';
import { accel_gyro } from './accel_gyro';

export type Algorithm = (context,data:{[key:string]:any}|any)=>{[key:string]:any}|undefined

export type AlgorithmContextProps = {
    ondata:Algorithm,
    oncreate?:(ctx:AlgorithmContext)=>void,
    structs?:{ [key:string]:any }, //default structures
    [key:string]:any
}

export type AlgorithmContext = {
    ondata:Algorithm,
    oncreate?:(ctx:AlgorithmContext)=>void,
    run?:(data:{[key:string]:any}|any)=>any, //quicker macro
    [key:string]:any
};






//data in, interpretation out (with unique key:value pairs)
export const algorithms: { [key:string]:AlgorithmContextProps } = {
    beat_detect, //beat detection, set sps and maxFreq detection (for low passing)
    accel_gyro, //get absolute angle and position change from starting point (need magnetometer for global position, the gyro is relative)
    heartrate:beat_detect, //alias
    breath:beat_detect
};
algorithms['breath'].structs = Object.assign({},algorithms['breath'].structs); 
algorithms['breath'].structs.maqFreq = 0.5; //another quick preset




export function createAlgorithmContext(
    options:AlgorithmContextProps,
    inputs?:{[key:string]:any} //e.g. set the sample rate for this run
):AlgorithmContext {

    let ctx = {
        _id:options._id ? options._id : `algorithm${Math.floor(Math.random()*1000000000000000)}`,
        ondata:options.ondata,
        run:(data:{[key:string]:any}|any) => {
            return ctx.ondata(ctx, data);
        }
    } as AlgorithmContext;
    if(options.structs) recursivelyAssign(ctx, JSON.parse( JSON.stringify( options.structs ))); //hard copy
    if(inputs) recursivelyAssign(ctx, JSON.parse( JSON.stringify( options.structs )));

    if(options.oncreate) {
        ctx.oncreate = options.oncreate;
    }
    if(ctx.oncreate) {
        ctx.oncreate(ctx);
    }

    return ctx;

}


let recursivelyAssign = (target,obj) => {
    for(const key in obj) {
        if(typeof obj[key] === 'object') {
            if(typeof target[key] === 'object') recursivelyAssign(target[key], obj[key]);
            else target[key] = recursivelyAssign({},obj[key]); 
        } else target[key] = obj[key];
    }

    return target;
}



//we need to wrap whatever functions in an object that allows feedback with stored variables.
// e.g. for heart rate we can use a feed forward algorithm and store some data on each pass to update the next pass, leading to much better performance
