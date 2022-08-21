import { WebglLinePlotProps } from "webgl-plot-utils";
import { BLEDeviceOptions } from "../ble/ble_client";
export declare function blueberryshortcodec(value: DataView): {
    sred: number;
    sir: number;
    sir2: number;
};
export declare function blueberrylongcodec(value: DataView): {
    lred: number;
    lir: number;
    lir2: number;
};
export declare const blueberry2BLESettings: BLEDeviceOptions;
export declare const blueberry2ChartSettings: Partial<WebglLinePlotProps>;
