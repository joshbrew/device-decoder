

export function max3010xcodec(data:any) {
    let arr; 
    if(!data.buffer) arr = new Uint8Array(data);
    else arr = data;

    return arr;
}

export const max3010xChartSettings = {
    lines:{
        red:{nSec:10, sps:100},
        ir:{nSec:10, sps:100}
    }
}