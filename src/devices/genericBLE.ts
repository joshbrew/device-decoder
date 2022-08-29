

export function hrcodec(data:DataView) {
    return {
        hr:data.getInt8(1),
        timestamp: Date.now()
    };
}

//this is a generic bluetooth gatt
export const heartRateBLESettings = {
    services:{
        'heart_rate': {
            'heart_rate_measurement':{
                notify:true,
                notifyCallback:undefined,
                codec:hrcodec
            }
        }
    }
}