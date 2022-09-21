export * from './muse'
export * from './ganglion'

import { ganglionSettings } from './ganglion';
import { museSettings } from './muse';


export const Devices3rdParty = {
    BLE_OTHER:{
        muse:museSettings,
        ganglion:ganglionSettings
    }
}

import { Devices as d } from '../index';

const Devices = {};
Object.assign(Devices,d);
Object.assign(Devices,Devices3rdParty);


export { Devices } 