import { FeatureDetection } from "./feature_detection";

export function arraySlice (array: any, begin: number, end: number) {
    if (typeof array.slice === "function") {
        return array.slice(begin, end);
    }

    var copy = Array.prototype.slice.call(array, begin, end);
    var typedArrayTypes = FeatureDetection.typedArrayTypes;
    var length = typedArrayTypes.length;
    for (var i = 0; i < length; ++i) {
        if (array instanceof typedArrayTypes[i]) {
            copy = new typedArrayTypes[i](copy);
            break;
        }
    }

    return copy;
}