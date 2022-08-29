//AlgorithmContext implementation for a basic low-pass peak finding algorithm with some basic error correction
import { Math2 } from 'brainsatplay-math';
import { AlgorithmContext, AlgorithmContextProps } from '../index';

export const beat_detect = {
    structs:{ //assign key data structures to the context for reference on each pass
        summed:[] as any,
        smoothed:[] as any,
        //dsmoothed:[] as any, //slope
        timestamp:[] as any,
        peaks:[] as any,
        valleys:[] as any,
        peak_distances:[] as any,
        valley_distances:[] as any,
        beats:[] as any,
        sps:100, //set the sample rate, e.g. 100
        maxFreq:4, //the max frequency of peaks we want to detect, we will create a moving average and peak finding interval based on this and the sample rate. //e.g. 4hz for heart rate, or 1/3rd hz for breathing
        limit:10 //limit number of last-values stored on the peak/valley/beat arrays to save memory, can just collect externally when a beat is returned
    },
    ondata:(
        context:AlgorithmContext,
        data:{red:number|number[], ir:number|number[], timestamp?:number|number[]}
    )=>{

        let smoothFactor = context.sps/context.maxFreq;
        let smawindow = Math.floor(smoothFactor)
        let peakFinderWindow = smawindow; if(peakFinderWindow%2 === 0) peakFinderWindow+=1;
        let midpoint = Math.round(peakFinderWindow*.5);

        if(!('timestamp' in data)) { //generate timestamps if none, assuming latest data is at time of the ondata callback
            if(Array.isArray(data.red)) { //assume timestamp
                let now = Date.now();
                let toInterp = [now - data.red.length*context.sps*1000, now];
                data.timestamp = Math2.upsample(toInterp,data.red.length);
            } else {
                data.timestamp = Date.now();
            }
        }

        let pass = (red, ir, timestamp) => {
            context.summed.push(red+ir);
            context.timestamp.push(timestamp);

            let beat;
            
            if(context.summed.length > peakFinderWindow) { //we only need to store enough data in a buffer to run the algorithm (to limit buffer overflow)
                context.summed.shift();
                context.timestamp.shift();
            }

            context.smoothed.push(Math2.mean(context.smoothed));

            if(context.smoothed.length > peakFinderWindow) {
                context.smoothed.shift();
            }

            if(context.summed.length > 1) { //skip first pass
                // context.dsmoothed.push(
                //     (   context.summed[context.summed.length-1] - 
                //         context.summed[context.summed.length-2]   
                //     ) / context.timestamp[context.timestamp[context.timestamp.length-1]]
                // );

                if(Math2.isExtrema(context.summed,'valley')) {
                    context.valleys.push({
                        value:context.summed[context.summed.length - midpoint], 
                        timestamp:context.timestamp[context.timestamp.length - midpoint]
                    });
                } else if (Math2.isExtrema(context.summed,'peak')) {
                    context.peaks.push({
                        value:context.summed[context.summed.length - midpoint], 
                        timestamp:context.timestamp[context.timestamp.length - midpoint]
                    });
                }


                if(context.valleys.length > 1 && context.peaks.length > 1) {

                    let l1 = context.valleys.length; 
                    let l2 = context.peaks.length; 

                    //if we have 3+ peaks or 3+ valleys in front of the previous peak or valley, we need to shave them off as we are looking for a sine wave (1 peak 1 valley).
                    if(context.valleys > context.peaks.length + 2) {
                        while(context.valleys.length > context.peaks.length + 2) context.valleys.splice(context.valleys.length-2,1);
                    } else if (context.peaks.length > context.valleys.length+2) { while(context.peaks.length > context.valleys.length+2) { context.peaks.splice(context.valleys.length-2,1); } }

                    
                    if(l1 < context.valleys.length) { 
                        context.valley_distances.push({
                            distance:context.valleys[context.valleys.length - 1].timestamp - context.valleys[context.valleys.length - 2].timestamp,
                            timestamp:context.valleys[context.valleys.length - 1].timestamp,
                            peak0:context.valleys[context.valleys.length - 1].value,
                            peak1:context.valleys[context.valleys.length - 2].value
                        });
                    }
                    if(l2 < context.peaks.length) { 
                        context.peak_distances.push({
                            distance:context.peaks[context.peaks.length - 1].timestamp - context.peaks[context.peaks.length - 2].timestamp,
                            timestamp:context.peaks[context.peaks.length - 1].timestamp,
                            peak0:context.peaks[context.peaks.length - 1].value,
                            peak1:context.peaks[context.peaks.length - 2].value
                        });
                    }

                    if(context.peak_distances.length > 1 && context.valley_distances.length > 1) {
                        if(context.valley_distances[context.valley_distances.length -1].timestamp > context.peak_distances[context.peak_distances.length-1].timestamp) {
                            let bpm, hrv = 0;
                            if(context.beats.length < 1) {
                                bpm = 60/(0.0005 * (context.peak_distances[context.peak_distances.length-1].distance + 
                                    context.valley_distances[context.valley_distances.length-1].distance));
                                
                            } else if (context.beats[context.beats.length-1].timestamp !== context.peak_distances[context.peak_distances.length-1].timestamp) {
                                bpm = 60/(0.0005*(context.peak_distances[context.peak_distances.length-1].dt + context.valley_distances[context.valley_distances.length-1].dt));
                                hrv = Math.abs(bpm - context.beats[context.beats.length - 1].bpm);
                            }

                            beat = {
                                timestamp:context.peak_distances[context.peak_distances.length - 1].timestamp, 
                                hrv, 
                                bpm,
                                height0:context.peak_distances[context.peak_distances.length-1].peak0 - 
                                            context.valley_distances[context.valley_distances.length-1].peak0, 
                                height1:context.peak_distances[context.peak_distances.length-1].peak1 - 
                                            context.valley_distances[context.valley_distances.length-1].peak1
                            }

                            context.beats.push(beat)
                        } else {
                            let bpm, hrv = 0;
                            if(context.beats.length < 2) {
                                bpm = 60/(0.0005*(context.peak_distances[context.peak_distances.length-2].distance + context.valley_distances[context.valley_distances.length-2].distance)); //(averaged peak + valley distance (msec)) * msec/sec * 60sec/min
                            } else if(context.beats[context.beats.length-1].timestamp !== context.peak_distances[context.peak_distances.length-2].timestamp) {
                                bpm = 60/(0.0005*(context.peak_distances[context.peak_distances.length-2].distance + context.valley_distances[context.valley_distances.length-2].distance));
                                hrv = Math.abs(bpm-context.beats[context.beats.length-2].bpm);
                            }

                            beat = {
                                timestamp:context.peak_distances[context.peak_distances.length-2].timestamp, 
                                hrv, 
                                bpm, 
                                height0:context.peak_distances[context.peak_distances.length-2].peak0-context.valley_distances[context.valley_distances.length-2].peak0,
                                height1:context.peak_distances[context.peak_distances.length-2].peak1-context.valley_distances[context.valley_distances.length-2].peak1
                            }

                            context.beats.push(beat);
                        }
                    }

                    //limits memory usage
                    if(context.peaks.length > context.limit) { context.peaks.shift(); }
                    if(context.valleys.length > context.limit) { context.valleys.shift(); }
                    if(context.peak_distances.length > context.limit) { context.peak_distances.shift(); }
                    if(context.valley_distances.length > context.limit) { context.valley_distances.shift(); }
                    if(context.beats.length > context.limit) { context.beats.shift(); }

                }
            }

            return beat;
        }

        if(Array.isArray(data.red)) {
            let result = data.red.map((v,i) => { return pass(v,data.ir[i],(data.timestamp as number[])[i]); });
            return result;
        } else return pass(data.red, data.ir, data.timestamp);
        //returns a beat when one is detected with the latest data passed in, else returns undefined
    }
} as AlgorithmContextProps;