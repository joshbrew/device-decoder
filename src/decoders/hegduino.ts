
let textdecoder = new TextDecoder();

export default function hegduinocodec(value:ArrayBuffer) {
    //hegduino format is utf8
    //Per line: timestamp, red, infrared, ratio, temperature
    let output = {
        timestamp: 0,
        red: 0,
        infrared: 0,
        ratio: 0,
        temperature: 0
    }

    let txt = textdecoder.decode(value);
    let line = txt.split(','); //serial will stream in as utf8 lines
    if(line.length >= 5) {
        output.timestamp = parseInt(line[0]);
        output.red = parseInt(line[1]);
        output.infrared = parseInt(line[2]);
        output.ratio = parseFloat(line[3]);
        output.temperature = parseFloat(line[4]);

        return output;

    }
    else return txt;
}