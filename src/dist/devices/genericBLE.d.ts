export declare function hrcodec(data: DataView): {
    hr: number;
    timestamp: number;
};
export declare const heartRateBLESettings: {
    services: {
        heart_rate: {
            heart_rate_measurement: {
                notify: boolean;
                notifyCallback: any;
                codec: typeof hrcodec;
            };
        };
    };
};
