//temp/pressure/humidity sensor codec
//https://randomnerdtutorials.com/bme280-sensor-arduino-pressure-temperature-humidity/
import { WebglLinePlotProps } from "webgl-plot-utils";
import { ByteParser } from "../util/ByteParser";

export const sealevel_hpa = 1013.25;

//our config: 3 bytes per packet, packet contains 6 32bit ints, tint tfrac pint pfrac hint hfrac
export const bme280codec = (data:any) => {
    let arr; 
    if((data as DataView).getInt8) arr = new Uint8Array(data.buffer);
    else if(!data.buffer) arr = new Uint8Array(data);
    else arr = data;

    let output:any = {
        temp:[],
        pressure:[],
        humidity:[],
        altitude:[] //in meters
    }

    for(let j = 0; j < 3; j++) {
        let i = j*24;
        let tint = ByteParser.bytesToUInt32(arr[0+i],arr[1+i],arr[2+i],arr[3+i]);
        let tfrac = ByteParser.bytesToUInt32(arr[4+i],arr[5+i],arr[6+i],arr[7+i]);
        output.temp.push(tint + tfrac/Math.pow(10,Math.ceil(Math.log10(tfrac))))
        
        let pint = ByteParser.bytesToUInt32(arr[8+i],arr[9+i],arr[10+i],arr[11+i]);
        let pfrac = ByteParser.bytesToUInt32(arr[12+i],arr[13+i],arr[14+i],arr[15+i]);
        output.pressure.push(pint + pfrac/Math.pow(10,Math.ceil(Math.log10(pfrac))))
        
        let hint = ByteParser.bytesToUInt32(arr[16+i],arr[17+i],arr[18+i],arr[19+i]);
        let hfrac = ByteParser.bytesToUInt32(arr[20+i],arr[21+i],arr[22+i],arr[23+i]);
        output.humidity.push(hint + hfrac/Math.pow(10,Math.ceil(Math.log10(hfrac))))
    
        output.altitude.push(altitude(output.pressure[j],output.temp[j]));
    }

    return output;

}

let exponent = 1/5.257;
let denom = 1/0.0065;

//works up to 9km altitude
function altitude(pressure,temperature) {
    return (Math.pow(sealevel_hpa/pressure,exponent) - 1)*(temperature+273.15)*denom;
}

export const bme280ChartSettings:Partial<WebglLinePlotProps> = {
    lines:{
        'temp':   {nSec:120,  sps:3.33, units:'C'},
        'pressure':{nSec:120, sps:3.33, units:'hPa'},
        'humidity':{nSec:120, sps:3.33, units:'%'},
        'altitude':{nSec:120, sps:3.33, units:'m'}
    }
}