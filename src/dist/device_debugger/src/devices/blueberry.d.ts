import { WebglLinePlotProps } from "webgl-plot-utils";
import { BLEDeviceOptions } from "../ble/ble_client";
export declare function blueberrycodec(value: DataView): {
    red: number;
    ir: number;
    ir2: number;
};
export declare const blueberryBLESettings: BLEDeviceOptions;
export declare const blueberryChartSettings: Partial<WebglLinePlotProps>;
