
let textdecoder = new TextDecoder();

export default function hegduinocodec(value:ArrayBuffer) {
    //hegduino format is utf8
    //Per line: timestamp, red, infrared, ratio, temperature
    let output = { //https://github.com/joshbrew/HEG_ESP32_Delobotomizer/blob/main/Firmware/MAX86141_HEG/MAX86141_HEG.h
        timestamp: 0,
        red: 0,
        infrared: 0,
        ratio: 0,
        ambient: 0,
        temperature: 0 //temp on v2, nonsense on v1
    }

    let txt = textdecoder.decode(value);
    let line = txt.split(','); //serial will stream in as utf8 lines
    if(line.length === 3) { //android web ble mode (20 byte packet lim)
        output.timestamp = Date.now();
        output.red = parseInt(line[0]);
        output.infrared = parseInt(line[1]);
        output.ratio = parseFloat(line[2]);

    } else if(line.length >= 5) {
        output.timestamp = parseInt(line[0]);
        output.red = parseInt(line[1]);
        output.infrared = parseInt(line[2]);
        output.ratio = parseFloat(line[3]);
        output.ambient = parseFloat(line[4]);
        output.temperature = parseFloat(line[5]);

        return output;

    } else return txt; //e.g. echoed commands or startup/crash messages
}