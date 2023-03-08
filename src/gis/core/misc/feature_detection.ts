let typedArrayTypes: any[] = [];
if (typeof ArrayBuffer !== "undefined") {
    typedArrayTypes.push(
        Int8Array,
        Uint8Array,
        Int16Array,
        Uint16Array,
        Int32Array,
        Uint32Array,
        Float32Array,
        Float64Array
    );

    if (typeof Uint8ClampedArray !== "undefined") {
        typedArrayTypes.push(Uint8ClampedArray);
    }

    if (typeof Uint8ClampedArray !== "undefined") {
        typedArrayTypes.push(Uint8ClampedArray);
    }

    //@ts-ignore
    if (typeof BigInt64Array !== "undefined") {
        // eslint-disable-next-line no-undef
        //@ts-ignore
        typedArrayTypes.push(BigInt64Array);
    }

    //@ts-ignore
    if (typeof BigUint64Array !== "undefined") {
        // eslint-disable-next-line no-undef
        //@ts-ignore
        typedArrayTypes.push(BigUint64Array);
    }
}


export class FeatureDetection {
    public static typedArrayTypes: any[] = typedArrayTypes;
}
