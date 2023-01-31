export * from './muse'
export * from './ganglion'

import { ganglionSettings } from './ganglion';
import { museSettings } from './muse';
import { webgazerSettings } from './webgazer';


export const Devices3rdParty = {
    CUSTOM_BLE:{
        muse:museSettings,
        ganglion:ganglionSettings
    },
    CUSTOM:{
        webgazer:webgazerSettings
    }
}

import { Devices as d } from '../index';

const Devices = {} as any;
Object.assign(Devices,d);
Devices.CUSTOM_BLE = Devices3rdParty.CUSTOM_BLE;
Object.assign(Devices.CUSTOM, Devices3rdParty.CUSTOM);//prevent overwrite


export { Devices } 