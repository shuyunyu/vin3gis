import { getStringFromTypedArray } from "./get_string_from_typed_array";

/**
 * Parses JSON from a Uint8Array.
 * @param uint8Array 
 * @param byteOffset 
 * @param byteLength 
 * @returns 
 */
export function getJsonFromTypedArray (uint8Array: Uint8Array, byteOffset: number, byteLength: number) {
    return JSON.parse(getStringFromTypedArray(uint8Array, byteOffset, byteLength));
}