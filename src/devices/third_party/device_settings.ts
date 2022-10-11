import { WebglLinePlotProps } from "webgl-plot-utils";
import { FilterSettings } from "../../util/BiquadFilters";


let defaultsetting1 = {
    sps:250, 
    useDCBlock:true, 
    useBandpass:true, 
    bandpassLower:3, 
    bandpassUpper:45
};

export const ganglionFilterSettings:{[key:string]:FilterSettings} = {
    '0':JSON.parse(JSON.stringify(defaultsetting1)), //twos compliment 2^23
    '1':JSON.parse(JSON.stringify(defaultsetting1)),
    '2':JSON.parse(JSON.stringify(defaultsetting1)),
    '3':JSON.parse(JSON.stringify(defaultsetting1))
}

const defaultChartSetting = {nSec:10, sps:250, units:'mV'};
export const ganglionChartSettings:Partial<WebglLinePlotProps> = {
    lines:{
        '0':JSON.parse(JSON.stringify(defaultChartSetting)),
        '1':JSON.parse(JSON.stringify(defaultChartSetting)),
        '2':JSON.parse(JSON.stringify(defaultChartSetting)),
        '3':JSON.parse(JSON.stringify(defaultChartSetting)),
        'ax':{nSec:10, sps:250, units:'mg'},
        'ay':{nSec:10, sps:250, units:'mg'},
        'az':{nSec:10, sps:250, units:'mg'},
    },
    generateNewLines:true //to add the additional 16 channels
};


let defaultsetting = {
    sps:250, 
    useDCBlock:true, 
    useBandpass:true, 
    bandpassLower:3, 
    bandpassUpper:45
};


export const museFilterSettings:{[key:string]:FilterSettings} = {
    '0':JSON.parse(JSON.stringify(defaultsetting)), //twos compliment 2^23
    '1':JSON.parse(JSON.stringify(defaultsetting)),
    '2':JSON.parse(JSON.stringify(defaultsetting)),
    '3':JSON.parse(JSON.stringify(defaultsetting)),
    '4':JSON.parse(JSON.stringify(defaultsetting))
}


export const museChartSettings:Partial<WebglLinePlotProps> = {
    lines:{
        '0':{nSec:10, sps:250, units:'uV'},
        '1':{nSec:10, sps:250, units:'uV'},
        '2':{nSec:10, sps:250, units:'uV'},
        '3':{nSec:10, sps:250, units:'uV'},
        '4':{nSec:10, sps:250, units:'uV'},
        'ax':{nSec:10, sps:100, units:'mg'},
        'ay':{nSec:10, sps:100, units:'mg'},
        'az':{nSec:10, sps:100, units:'mg'},
        'gx':{nSec:10, sps:100, units:'rps'},
        'gy':{nSec:10, sps:100, units:'rps'},
        'gz':{nSec:10, sps:100, units:'rps'},
    },
    generateNewLines:true //to add the additional 16 channels
};


