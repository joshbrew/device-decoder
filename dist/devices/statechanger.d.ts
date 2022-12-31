import { WebglLinePlotProps } from "webgl-plot-utils";
import { BLEDeviceOptions } from "../ble/ble_client";
export declare function statechangercodec(value: any): string | {
    timestamp: number;
    left_red: number;
    left_infrared: number;
    left_heg: number;
    center_red: number;
    center_infrared: number;
    center_heg: number;
    right_red: number;
    right_infrared: number;
    right_heg: number;
};
export declare const statechangerSerialSettings: {
    baudRate: number;
    codec: typeof statechangercodec;
};
export declare const statechangerBLESettings: BLEDeviceOptions;
export declare const statechangerChartSettings: Partial<WebglLinePlotProps>;
