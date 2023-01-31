
import { TimeoutOptions } from '@capacitor-community/bluetooth-le/dist/plugin';
import { BLEDeviceOptions } from '../ble/ble_client';
import { SerialPortOptions } from '../serial/serialstream';

export type BLEDeviceSettings = {
    deviceType:'BLE',
    deviceName:string,
    sps?:number, //samples per second
    codec?:(data:any) => {[key:string]:any}, //transform data into a dictionary (preferred)
    services?:{ 
        [key:string]:{ // service uuid you want to set and all of the characteristic settings and responses, keys are UUIDs
            [key:string]:{ // services can have an arbitrary number of characteristics, keys are UUIDs
                codec?:(data:any) => {[key:string]:any},  //this is an additional setting for BLE characteristic specifications
                
                read?:boolean, //should we read on connect
                readOptions?:TimeoutOptions,
                readCallback?:((result:DataView)=>void),
                write?:string|number|ArrayBufferLike|DataView, //should we write on connect and what should we write?
                writeOptions?:TimeoutOptions,
                writeCallback?:(()=>void),
                notify?:boolean, //can this characteristic notify?
                notifyCallback?:((result:DataView)=>void)
                [key:string]:any
            }
        }
    }
} & BLEDeviceOptions

export type SerialDeviceSettings = {
    deviceType:'USB',
    deviceName:string,
    sps?:number, //samples per second
    buffering?:{
        searchBytes:Uint8Array
    },
    codec:(data:any) => {[key:string]:any}, //transform data into a dictionary (preferred)
} & SerialPortOptions

export type CustomDeviceSettings = {
    deviceType:'CUSTOM'|'CUSTOM_BLE'|'CUSTOM_USB', 
    deviceName:string,
    sps?:any, //samples per second
    connect:(settings:any) => {
        _id:string, //info object used in later callbacks
        [key:string]:any
    },
    codec:(data:any) => { //transform data into a dictionary (preferred) //this runs on a thread so you can do more complex stuff at high speeds
        [key:string]:any
    },
    disconnect:(info) => void,
    //optional callbacks:
    onconnect?:(info) => void,
    beforedisconnect?:(info) => void,
    ondisconnect?:(info) => void,
    read?:(command:any) => any,
    write?:(command:any) => any
}
