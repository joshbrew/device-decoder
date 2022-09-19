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

import { Devices } from '../index';

Object.assign(Devices, Devices3rdParty); //install third party driver devices to main list just by importing this file

export { Devices } 