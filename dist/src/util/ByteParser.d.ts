import { ArrayManip } from "./arraymanip";
export declare class ByteParser extends ArrayManip {
    static codes: {
        '\\n': number;
        '\\r': number;
        '\\t': number;
        '\\s': number;
        '\\b': number;
        '\\f': number;
        '\\': number;
    };
    static toDataView(value: string | number | ArrayBufferLike | DataView | number[]): DataView;
    static genTimestamps(ct: any, sps: any, from?: any): any[];
    static searchBuffer(buffer: number[] | ArrayBuffer, searchString: number[] | ArrayBuffer, limit?: number): any[];
    static bytesToInt16(x0: number, x1: number): number;
    static bytesToUInt16(x0: number, x1: number): number;
    static Uint16ToBytes(y: number): number[];
    static bytesToInt24(x0: number, x1: number, x2: number): number;
    static bytesToUInt24(x0: number, x1: number, x2: number): number;
    static Uint24ToBytes(y: number): number[];
    static bytesToInt32(x0: number, x1: number, x2: number, x3: number): number;
    static bytesToUInt32(x0: number, x1: number, x2: number, x3: number): number;
    static Uint32ToBytes(y: number): number[];
    static get2sCompliment(val: number, nbits: number): number;
    static getSignedInt(...args: number[]): number;
    static asUint8Array(input: any): Uint8Array;
    static boyerMoore(patternBuffer: any): {
        (txtBuffer: any, start?: number, end?: any): number;
        byteLength: number;
    };
    static struct(format: string): Readonly<{
        unpack: (arrb: any) => any[];
        pack: (...values: any[]) => ArrayBuffer;
        unpack_from: (arrb: any, offs: any) => any[];
        pack_into: (arrb: any, offs: any, ...values: any[]) => void;
        iter_unpack: (arrb: any) => Generator<any[], void, unknown>;
        format: string;
        size: number;
    }>;
}
