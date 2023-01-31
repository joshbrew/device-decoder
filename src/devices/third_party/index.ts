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

const Devices = {};
Object.assign(Devices,d);
Object.assign(Devices,Devices3rdParty);


export { Devices } 