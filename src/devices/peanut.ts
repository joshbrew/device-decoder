
import { WebglLinePlotProps } from 'webgl-plot-utils';
import {ByteParser} from '../util/ByteParser'

// baud: 38400
// search bytes: 170,170
// write 'protocol 3\n' on connecting to get the known data format (it defaults to something undocumented)


export const PeanutCodes = { //bytecode struct formats
    0x02: {type: 'POOR_SIGNAL',   format:'<B',                byteLength:1},
    0x90: {type: 'heg', format:'<i',                byteLength:4}, //unfilteredHEG <-- we'll use this as it contains useful heartrate data
    0x91: {type: 'filteredHEG',     format:'<i',                byteLength:4}, //filteredHEG
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
            //console.log(data, i, PeanutCodes[data[i]].byteLength, PeanutCodes[data[i]].type, slice)
            let unpacked:any = ByteParser.struct(PeanutCodes[data[i]].format).unpack(
                slice
            )
            let code = PeanutCodes[data[i]].type;

            if(code === 'unfilteredHEG' || code === 'heg')
                unpacked = unpacked[0]/256;
            else if (code === 'POOR_SIGNAL' || code === 'sampleNumber' || code === 'debug0' || code === 'debug1' || code === 'debug2' || code === 'debug3') 
                unpacked = unpacked[0];

            if(!result[PeanutCodes[data[i]].type]) { 
                if(Array.isArray(unpacked)) result[PeanutCodes[data[i]].type] = unpacked;
                else result[PeanutCodes[data[i]].type] = [unpacked];
            } else {
                if(Array.isArray(unpacked)) result[PeanutCodes[data[i]].type].push(...unpacked);
                else result[PeanutCodes[data[i]].type].push(unpacked);
            }
            i += PeanutCodes[data[i]].byteLength+1;
        } else i++;
    }

    //console.log(result);
    result.timestamp = Date.now();

    return result;
}

export const peanutSerialSettings = {
    baudRate:38400,
    bufferSize:400, //less crashy
    write:'protocol 3\n', //need to send this on connect to initialize the output stream properly
    buffering:{
        searchBytes:new Uint8Array([170,170]),
    },
    codec:peanutcodec,
    sps:10.101
};

export const peanutChartSettings: Partial<WebglLinePlotProps> = {
    lines: {
        filteredHEG:{sps:10.101, nSec:60}, //filteredHEG
        heg:{sps:10.101, nSec:60}, //filteredHEG
        debug0:{sps:10.101, nSec:60}, //filteredHEG
        debug1:{sps:10.101, nSec:60}, //filteredHEG
        debug2:{sps:10.101, nSec:60}, //filteredHEG
        debug3:{sps:10.101, nSec:60}, //filteredHEG
        debug4:{sps:60.101, nSec:60}, //filteredHEG
    },
    generateNewLines:false,
    cleanGeneration:false
}