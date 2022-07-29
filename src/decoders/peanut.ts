

const codes = { //bytecode struct formats
    0x02: {type: 'POOR_SIGNAL',   format:'<B',                byteLength:1},
    0x90: {type: 'unfilteredHEG', format:'<i',                byteLength:4},
    0x91: {type: 'filteredHEG',   format:'<i',                byteLength:4},
    0x93: {type: 'rawdata4',      format:'<i',                byteLength:4},
    0x94: {type: 'rawdata6',      format:'<iiii',             byteLength:4*4},
    0xA0: {type: 'sampleNumber',  format:'<i',                byteLength:4},
    0xB0: {type: 'debug0',        format:'<i',                byteLength:4},
    0xB1: {type: 'debug1',        format:'<i',                byteLength:4},
    0xB2: {type: 'debug2',        format:'<i',                byteLength:4},
    0xB3: {type: 'debug3',        format:'<i',                byteLength:4},
    0xB4: {type: 'debug4',        format:'<iiiiii',           byteLength:4*6},
    0xB5: {type: 'debug4',        format:'<iiiiii',           byteLength:4*6},
    0xB6: {type: 'rawdata27',     format:'<B'+'i'.repeat(26), byteLength:1+4*26}
}

const searchBytes = new Uint8Array([170,170]);