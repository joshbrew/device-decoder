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
        timestamp:Date.now(),
        temp:[],
        pressure:[],
        altitude:[] //in meters
    }

    let mode = 0; //bmp280
    if(arr[0].length === 74) mode = 1; //bme280

    if(!mode) { //bmp280
        for(let j = 0; j < 3; j++) {
            let i = j*16+2;
            let tint = ByteParser.bytesToInt32(arr[3+i],arr[2+i],arr[1+i],arr[0+i]);
            let tfrac = ByteParser.bytesToInt32(arr[7+i],arr[6+i],arr[5+i],arr[4+i]);
            output.temp.push(tint + tfrac/Math.pow(10,Math.ceil(Math.log10(tfrac))))
            
            let pint = 10*ByteParser.bytesToInt32(arr[11+i],arr[10+i],arr[9+i],arr[8+i]);
            let pfrac = ByteParser.bytesToInt32(arr[15+i],arr[14+i],arr[13+i],arr[12+i]);
            output.pressure.push(pint + pfrac/Math.pow(10,Math.ceil(Math.log10(pfrac))));
        
            output.altitude.push(altitude(output.pressure[j],output.temp[j]));
        }
    }
    else { //bme280
        output.humidity = [];
        for(let j = 0; j < 3; j++) {
            let i = j*24+2;
            let tint = ByteParser.bytesToInt32(arr[3+i],arr[2+i],arr[1+i],arr[0+i]);
            let tfrac = ByteParser.bytesToInt32(arr[7+i],arr[6+i],arr[5+i],arr[4+i]);
            output.temp.push(tint + tfrac/Math.pow(10,Math.ceil(Math.log10(tfrac))))
            
            let pint = 10*ByteParser.bytesToInt32(arr[11+i],arr[10+i],arr[9+i],arr[8+i]);
            let pfrac = ByteParser.bytesToInt32(arr[15+i],arr[14+i],arr[13+i],arr[12+i]);
            output.pressure.push(pint + pfrac/Math.pow(10,Math.ceil(Math.log10(pfrac))));
            
            let hint = ByteParser.bytesToInt32(arr[19+i],arr[18+i],arr[17+i],arr[16+i]);
            let hfrac = ByteParser.bytesToInt32(arr[23+i],arr[22+i],arr[21+i],arr[20+i]);
            output.humidity.push(hint + hfrac/Math.pow(10,Math.ceil(Math.log10(hfrac))))
        
            output.altitude.push(altitude(output.pressure[j],output.temp[j]));
        }
    }

    //console.log(data, output);

    return output;

}

//works up to 9km altitude
function altitude(pressure,temperature) {
    return 44330 * (1.0 - Math.pow(pressure / sealevel_hpa, 0.1903));
}

export const bme280ChartSettings:Partial<WebglLinePlotProps> = {
    lines:{
        'temp':   {nSec:120,  sps:3.33, units:'C'},
        'pressure':{nSec:120, sps:3.33, units:'hPa'},
        'humidity':{nSec:120, sps:3.33, units:'%'},
        'altitude':{nSec:120, sps:3.33, units:'m'}
    }
}