import { WebglLinePlotProps } from "webgl-plot-utils";
export declare function mpu6050codec(data: any): {
    ax: any[];
    ay: any[];
    az: any[];
    gx: any[];
    gy: any[];
    gz: any[];
    temp: number;
};
export declare const mpu6050ChartSettings: Partial<WebglLinePlotProps>;
