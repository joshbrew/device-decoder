import { WebglLinePlotProps } from "webgl-plot-utils";
import { BLEDeviceOptions } from "../ble/ble_client";
export declare function statechangercodec(value: any): string | {
    timestamp: number;
    left_red: number;
    left_ir: number;
    left_heg: number;
    center_red: number;
    center_ir: number;
    center_heg: number;
    right_red: number;
    right_ir: number;
    right_heg: number;
    red: number;
    ir: number;
    heg: number;
};
export declare const statechangerSerialSettings: {
    deviceType: string;
    deviceName: string;
    baudRate: number;
    codec: typeof statechangercodec;
    sps: number;
};
export declare const statechangerBLESettings: BLEDeviceOptions;
export declare const statechangerChartSettings: Partial<WebglLinePlotProps>;
