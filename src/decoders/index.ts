import ads131m08codec from './ads131m08';
import cytoncodec from './cyton';
import freeeeg128codec from './freeeeg128';
import freeeeg32codec from './freeeeg32';
import hegduinocodec from './hegduino';

const textdecoder = new TextDecoder();

export const decoders:any = {
    'raw':(data:ArrayBuffer) => { return new Uint8Array(data); },
    'utf8':(data:ArrayBuffer) => { return textdecoder.decode(data); },
    'console-f12':(data:ArrayBuffer) => { data = new Uint8Array(data); console.log(data); return data; },
    'debug':(data:ArrayBuffer,debugmessage:string) => { data = new Uint8Array(data); console.log(debugmessage,data); return `${debugmessage} ${data}`; },
    'ads131m08':ads131m08codec,
    //'max3010x':(data:ArrayBuffer) => { return data; },
    //'mpu6050':(data:ArrayBuffer) => { return data; },
    'freeeeg32':freeeeg32codec, //https://github.com/joshbrew/freeeeg32.js
    'freeeeg128':freeeeg128codec,
    'cyton':cytoncodec, //https://github.com/joshbrew/cyton.js
    //'cognixionBLE':(data:ArrayBuffer) => { return data; }, //see the super secret docs
    'hegduino':hegduinocodec, //https://github.com/joshbrew/hegduino.js -- incl check for android (3 outputs only) output
    //'peanut':(data:ArrayBuffer) => { return data; } //https://github.com/joshbrew/peanutjs/blob/main/peanut.js
    //...custom?
}