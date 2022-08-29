export class ArrayManip {
    //autoscale array to -1 and 1
    static autoscale(array, lineIdx=0, nLines=1, centerZero=false, ymin?:number, ymax?:number) {
        if(array?.length === 0 ) return array;
        let max = ymax ? ymax : Math.max(...array)
        let min = ymin ? ymin : Math.min(...array);

        let _lines = 1/nLines;
        let scalar = 1;
        if(centerZero) {
            let absmax = Math.max(Math.abs(min),Math.abs(max));
            if(absmax !== 0) scalar = _lines/absmax;
            return array.map(y => (y*scalar+(_lines*(lineIdx+1)*2-1-_lines))); //scaled array
        }
        else {
            if(max === min) {
                if(max !== 0) {
                    scalar = _lines/max;
                }
            }
            else scalar = _lines/(max-min);
            return array.map(y => (2*((y-min)*scalar-(1/(2*nLines)))+(_lines*(lineIdx+1)*2-1-_lines))); //scaled array
        }
    }

    static genTimestamps(ct,sps) {
        let now = Date.now();
        let toInterp = [now - ct*1000/sps, now];
        return ArrayManip.upsample(toInterp, ct);
    }

    //absolute value maximum of array (for a +/- valued array)
    static absmax(array) {
        return Math.max(Math.abs(Math.min(...array)),Math.max(...array));
    }

    //averages values when downsampling.
    static downsample(array, fitCount, scalar=1) {

        if(array.length > fitCount) {        
            let output = new Array(fitCount);
            let incr = array.length/fitCount;
            let lastIdx = array.length-1;
            let last = 0;
            let counter = 0;
            for(let i = incr; i < array.length; i+=incr) {
                let rounded = Math.round(i);
                if(rounded > lastIdx) rounded = lastIdx;
                for(let j = last; j < rounded; j++) {
                    output[counter] += array[j];
                }
                output[counter] /= (rounded-last)*scalar;
                counter++;
                last = rounded;
            }
            return output;
        } else return array; //can't downsample a smaller array
    }

    //Linear upscaling interpolation from https://stackoverflow.com/questions/26941168/javascript-interpolate-an-array-of-numbers. Input array and number of samples to fit the data to
	static upsample(array, fitCount, scalar=1) {

		var linearInterpolate = function (before, after, atPoint) {
			return (before + (after - before) * atPoint)*scalar;
		};

		var newData = new Array(fitCount);
		var springFactor = (array.length - 1) / (fitCount - 1);
		newData[0] = array[0]; // for new allocation
		for ( var i = 1; i < fitCount - 1; i++) {
			var tmp = i * springFactor;
			var before = Math.floor(tmp);
			var after =  Math.ceil(tmp);
			var atPoint = tmp - before;
			newData[i] = linearInterpolate(array[before], array[after], atPoint);
		}
		newData[fitCount - 1] = array[array.length - 1]; // for new allocation
		return newData;
	};

    static interpolate(array:number[], fitCount:number, scalar=1) {
        if(array.length > fitCount) {
            return ArrayManip.downsample(array, fitCount, scalar);
        } else if(array.length < fitCount) {
            return ArrayManip.upsample(array, fitCount, scalar);
        }
        return array;
    }

    static HSLToRGB(h,s,l, scalar=255):[number,number,number] {
        // Must be fractions of 1
        s /= 100;
        l /= 100;
      
        let c = (1 - Math.abs(2 * l - 1)) * s,
            x = c * (1 - Math.abs((h / 60) % 2 - 1)),
            m = l - c/2,
            r = 0,
            g = 0,
            b = 0;
     
        if (0 <= h && h < 60) {
            r = c; g = x; b = 0;  
        } else if (60 <= h && h < 120) {
            r = x; g = c; b = 0;
        } else if (120 <= h && h < 180) {
            r = 0; g = c; b = x;
        } else if (180 <= h && h < 240) {
            r = 0; g = x; b = c;
        } else if (240 <= h && h < 300) {
            r = x; g = 0; b = c;
        } else if (300 <= h && h < 360) {
            r = c; g = 0; b = x;
        }
        r = (r + m) * scalar;
        g = (g + m) * scalar;
        b = (b + m) * scalar;

        return [r,g,b];
    }

    //push new entries to end of array and roll over starting entries with a set array length
    static circularBuffer(arr:any[],newEntries:any[]) {
        if(newEntries.length < arr.length)
            arr.splice(
                0,
                arr.length-newEntries.length,
                ...arr.slice(newEntries.length)
            ).splice(
                    newEntries.length,
                    arr.length,
                    ...newEntries
                );
        else if (newEntries.length > arr.length) {
            arr.splice(0,arr.length,newEntries.slice(newEntries.length-arr.length));
        }
        else { 
            arr.splice(0,arr.length,...newEntries);
        }
        
        return arr;
    }

    //e.g. mimic arduino serial plotter data, make sure we return an object of key:array pairs for each channel represented
    static reformatData(
        data:{
            [key:string]:number[]|number|{values:number[]|number,[key:string]:any}
        }|string|((number|number[])[])|number, 
        key?:string //if passing a single value
    ) {
        //take incoming data formats and return them in the format that our charting library likes so we can blindly pass stuff in
        if (Array.isArray(data)) {
            if(Array.isArray(data[0])) {
                let d = {};
                data.forEach((arr,i) => {
                    d[i] = arr;
                });
                data = d;
                if(isNaN(data[0][0])) return undefined;//throw new Error(`Invalid data format: ${data}`);
            }
            else if(key) {
                data = {[key]:data} as any;
                if(isNaN(data[key][0]))  return undefined;//throw new Error(`Invalid data format: ${data}`);
            }
            else {
                data = {0:data} as any;
                if(isNaN(data[0][0]))  return undefined;//throw new Error(`Invalid data format: ${data}`);
            }
        } else if(typeof data === 'object') { //swap incoming key:value pairs into our charting library format
            for(const key in data) {
                if(typeof data[key] === 'number') data[key] = [data[key] as number];
                else if ((data[key] as any)?.values) {
                    if(typeof (data[key] as any).values === 'number') 
                        (data[key] as any).values = [(data[key] as any).values];
                }
                if(isNaN(data[key][0]))  return undefined;//throw new Error(`Invalid data format: ${data}`);
                
            }
        }
        else if (typeof data === 'string') { //let's parse different string formats 
            let split:any;
            if(data.includes('\t')) {
                split = data.split('\t');
            } else if (data.includes(',')) {
                split = data.split(',');
            } 
            data = {};
            if(split) {
                split.forEach((val,i) => {
                    if(val.includes(':')) {
                        let [key,v] = val.split(':');
                        let fl = parseFloat(v);
                        if(fl) data[key] = [fl];
                        else return undefined;
                    } else {
                        let fl = parseFloat(val);
                        if(fl) data[i] = [fl];
                        else return undefined;
                    }
                });
            }
        } else if (typeof data === 'number') {
            if(key) data = {[key]:[data]};    
            else data = {0:[data]};
        }
    
        return data;// as {[key:string]:(number[]|{values:number[],[key:string]:any}|WebglLineProps)};
    }

    //pad an array based on a time interval between sample sets, averaging slope
    static padTime(
        data:number[], //new data, assumed to be sequential between a gap
        lastValue:number, //the last data point before the gap
        time:number,    //interval that's passed to determine slope between samples
        targetFit:number //e.g. time(s) * sps i.e. if our chart expects a certain number of points per second to stay consistent
    ) {
        let slopeIncr = ((data[0]-lastValue) / time) / targetFit;
        let padded = [...new Array(targetFit - data.length).map((_,i) => lastValue + slopeIncr*(i+1)),...data];

        return padded;
    }

    static interpolateForTime(
        data:number[], //new data, assumed to be evenly spread over a time interval
        time:number, //the time interval passed (s)
        targetSPS:number //number of points per second expected by graph
    ) {
        return ArrayManip.interpolate(data, Math.ceil(targetSPS*time));
    }
}