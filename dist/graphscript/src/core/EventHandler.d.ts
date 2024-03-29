export declare class EventHandler {
    pushToState: {};
    data: {};
    triggers: {};
    constructor(data?: {
        [key: string]: any;
    });
    setState: (updateObj: {
        [key: string]: any;
    }) => {};
    setValue: (key: any, value: any) => void;
    triggerEvent: (key: any, value: any) => void;
    subscribeEvent: (key: string, onchange: (res: any) => void, refObject?: {
        [key: string]: any;
    }, refKey?: string) => number;
    unsubscribeEvent: (key: string, sub?: number) => boolean;
    subscribeEventOnce: (key: string, onchange: (res: any) => void) => void;
    getEvent: (key: any, sub: any) => any;
    getSnapshot: () => void;
    onRemoved: (trigger: {
        sub: number;
        onchange: Function;
    }) => void;
}
