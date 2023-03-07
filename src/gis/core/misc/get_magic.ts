import { Utils } from "../../../core/utils/utils";
import { getStringFromTypedArray } from "./get_string_from_typed_array";

export function getMagic (uint8Array: Uint8Array, byteOffset?: number) {
    byteOffset = Utils.defaultValue(byteOffset, 0);
    return getStringFromTypedArray(
        uint8Array,
        byteOffset!,
        Math.min(4, uint8Array.length)
    );
}