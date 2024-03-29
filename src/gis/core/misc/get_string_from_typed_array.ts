import { Utils } from "../../../core/utils/utils";

/**
 * 从Uint8Array中读取字符串
 */
export function getStringFromTypedArray (uint8Array: Uint8Array, byteOffset: number, byteLength: number) {
    if (!Utils.defined(uint8Array)) {
        throw new Error("uint8Array is required.");
    }
    if (byteOffset < 0) {
        throw new Error("byteOffset cannot be negative.");
    }
    if (byteLength < 0) {
        throw new Error("byteLength cannot be negative.");
    }
    if (byteOffset + byteLength > uint8Array.byteLength) {
        throw new Error("sub-region exceeds array bounds.");
    }
    byteOffset = Utils.defaultValue(byteOffset, 0);
    byteLength = Utils.defaultValue(byteLength, uint8Array.byteLength - byteOffset);

    uint8Array = uint8Array.subarray(byteOffset, byteOffset + byteLength);

    return getStringFromTypedArray.decode(uint8Array);
}

// Exposed functions for testing
getStringFromTypedArray.decodeWithTextDecoder = function (view: Uint8Array) {
    var decoder = new TextDecoder("utf-8");
    return decoder.decode(view);
};

getStringFromTypedArray.decodeWithFromCharCode = function (view: Uint8Array) {
    var result = "";
    var codePoints = utf8Handler(view);
    var length = codePoints.length;
    for (var i = 0; i < length; ++i) {
        var cp = codePoints[i];
        if (cp <= 0xffff) {
            result += String.fromCharCode(cp);
        } else {
            cp -= 0x10000;
            result += String.fromCharCode((cp >> 10) + 0xd800, (cp & 0x3ff) + 0xdc00);
        }
    }
    return result;
};

function inRange (a: number, min: number, max: number) {
    return min <= a && a <= max;
}

// This code is inspired by public domain code found here: https://github.com/inexorabletash/text-encoding
function utf8Handler (utfBytes: Uint8Array) {
    var codePoint = 0;
    var bytesSeen = 0;
    var bytesNeeded = 0;
    var lowerBoundary = 0x80;
    var upperBoundary = 0xbf;

    var codePoints = [];
    var length = utfBytes.length;
    for (var i = 0; i < length; ++i) {
        var currentByte = utfBytes[i];

        // If bytesNeeded = 0, then we are starting a new character
        if (bytesNeeded === 0) {
            // 1 Byte Ascii character
            if (inRange(currentByte, 0x00, 0x7f)) {
                // Return a code point whose value is byte.
                codePoints.push(currentByte);
                continue;
            }

            // 2 Byte character
            if (inRange(currentByte, 0xc2, 0xdf)) {
                bytesNeeded = 1;
                codePoint = currentByte & 0x1f;
                continue;
            }

            // 3 Byte character
            if (inRange(currentByte, 0xe0, 0xef)) {
                // If byte is 0xE0, set utf-8 lower boundary to 0xA0.
                if (currentByte === 0xe0) {
                    lowerBoundary = 0xa0;
                }
                // If byte is 0xED, set utf-8 upper boundary to 0x9F.
                if (currentByte === 0xed) {
                    upperBoundary = 0x9f;
                }

                bytesNeeded = 2;
                codePoint = currentByte & 0xf;
                continue;
            }

            // 4 Byte character
            if (inRange(currentByte, 0xf0, 0xf4)) {
                // If byte is 0xF0, set utf-8 lower boundary to 0x90.
                if (currentByte === 0xf0) {
                    lowerBoundary = 0x90;
                }
                // If byte is 0xF4, set utf-8 upper boundary to 0x8F.
                if (currentByte === 0xf4) {
                    upperBoundary = 0x8f;
                }

                bytesNeeded = 3;
                codePoint = currentByte & 0x7;
                continue;
            }

            throw new Error("String decoding failed.");
        }

        // Out of range, so ignore the first part(s) of the character and continue with this byte on its own
        if (!inRange(currentByte, lowerBoundary, upperBoundary)) {
            codePoint = bytesNeeded = bytesSeen = 0;
            lowerBoundary = 0x80;
            upperBoundary = 0xbf;
            --i;
            continue;
        }

        // Set appropriate boundaries, since we've now checked byte 2 of a potential longer character
        lowerBoundary = 0x80;
        upperBoundary = 0xbf;

        // Add byte to code point
        codePoint = (codePoint << 6) | (currentByte & 0x3f);

        // We have the correct number of bytes, so push and reset for next character
        ++bytesSeen;
        if (bytesSeen === bytesNeeded) {
            codePoints.push(codePoint);
            codePoint = bytesNeeded = bytesSeen = 0;
        }
    }

    return codePoints;
}


if (typeof TextDecoder !== "undefined") {
    getStringFromTypedArray.decode =
        getStringFromTypedArray.decodeWithTextDecoder;
} else {
    getStringFromTypedArray.decode =
        getStringFromTypedArray.decodeWithFromCharCode;
}