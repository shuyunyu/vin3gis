const base64abc = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
    "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
    "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "/"
];


export class Base64Utils {

    public static decodeBase64ToArrayBuffer (base64: string) {
        return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)).buffer;
    }

    public static encodeArrayBufferToBase64 (bytes: number[] | Uint8Array) {
        let result = '', i, l = bytes.length;
        for (i = 2; i < l; i += 3) {
            result += base64abc[bytes[i - 2] >> 2];
            result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
            result += base64abc[((bytes[i - 1] & 0x0F) << 2) | (bytes[i] >> 6)];
            result += base64abc[bytes[i] & 0x3F];
        }
        if (i === l + 1) { // 1 octet yet to write
            result += base64abc[bytes[i - 2] >> 2];
            result += base64abc[(bytes[i - 2] & 0x03) << 4];
            result += "==";
        }
        if (i === l) { // 2 octets yet to write
            result += base64abc[bytes[i - 2] >> 2];
            result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
            result += base64abc[(bytes[i - 1] & 0x0F) << 2];
            result += "=";
        }
        return result;

    }

    public static base64ToUint8Array (base64String: string) {
        let padding = '='.repeat((4 - base64String.length % 4) % 4);
        let base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        let rawData = window.atob(base64);
        let outputArray = new Uint8Array(rawData.length);

        for (var i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

}

