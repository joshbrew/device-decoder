
import { WebglLinePlotProps } from 'webgl-plot-utils';
import {bitflippin} from '../bitflippin'

// baud: 38400
// bufferSize: 20


export const PeanutCodes = { //bytecode struct formats
    0x02: {type: 'POOR_SIGNAL',   format:'<B',                byteLength:1},
    0x90: {type: 'unfilteredHEG', format:'<i',                byteLength:4},
    0x91: {type: 'filteredHEG',   format:'<i',                byteLength:4},
    0x93: {type: 'rawdata4',      format:'<iiii',             byteLength:4*4},
    0x94: {type: 'rawdata6',      format:'<iiiiii',           byteLength:4*6},
    0xA0: {type: 'sampleNumber',  format:'<i',                byteLength:4},
    0xB0: {type: 'debug0',        format:'<i',                byteLength:4},
    0xB1: {type: 'debug1',        format:'<i',                byteLength:4},
    0xB2: {type: 'debug2',        format:'<i',                byteLength:4},
    0xB3: {type: 'debug3',        format:'<i',                byteLength:4},
    0xB4: {type: 'debug4',        format:'<iiiiii',           byteLength:4*6},
    0xB5: {type: 'debug4',        format:'<iiiiii',           byteLength:4*6},
    0xB6: {type: 'rawdata27',     format:'<B'+'i'.repeat(26), byteLength:1+4*26}
}

export function peanutcodec(data:any) {
    let result:any = {}

    let i = 0; 
    while(i < data.length) {
        if(PeanutCodes[data[i]] && i + 1 + PeanutCodes[data[i]].byteLength <= data.length) {
            let slice = data.slice(i+1, i+1+PeanutCodes[data[i]].byteLength).buffer
            console.log(data, i, PeanutCodes[data[i]].byteLength, PeanutCodes[data[i]].type, slice)
            let unpacked:any = bitflippin.struct(PeanutCodes[data[i]].format).unpack(
                slice
            )
            let code = PeanutCodes[data[i]].type;

            if(code === 'unfilteredHEG' || code === 'filteredHEG')
                unpacked = unpacked[0]/256;
            else if (code === 'POOR_SIGNAL' || code === 'sampleNumber' || code === 'debug0' || code === 'debug1' || code === 'debug2' || code === 'debug3') 
                unpacked = unpacked[0];

            if(!result[PeanutCodes[data[i]].type]) {
                result[PeanutCodes[data[i]].type] = [unpacked];
            } else result[PeanutCodes[data[i]].type].push(unpacked);

            i += PeanutCodes[data[i]].byteLength+1;
        } else i++;
    }

    return result;
}

export const peanutChartSettings: Partial<WebglLinePlotProps> = {
    lines: {
        filteredHEG:{sps:10.101, nSec:60}
    },
    generateNewLines:true,
    cleanGeneration:false
}