export declare type Algorithm = (context: any, data: {
    [key: string]: any;
} | any) => {
    [key: string]: any;
} | undefined;
export declare type AlgorithmContextProps = {
    ondata: Algorithm;
    structs?: {
        [key: string]: any;
    };
    [key: string]: any;
};
export declare type AlgorithmContext = {
    ondata: Algorithm;
    run?: (data: {
        [key: string]: any;
    } | any) => any;
    [key: string]: any;
};
export declare const algorithms: {
    [key: string]: AlgorithmContextProps;
};
export declare function createAlgorithmContext(options: AlgorithmContextProps, inputs?: {
    [key: string]: any;
}): AlgorithmContext;
