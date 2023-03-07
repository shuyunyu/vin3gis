import { Utils } from "../../../../core/utils/utils";
import { getJsonFromTypedArray } from "../../misc/get_json_from_typed_array";
import { getMagic } from "../../misc/get_magic";
import { Earth3DTileContentType } from "./earth_3dtile_content_type";

interface Preprocessed3DTileContent {
    contentType: string,
    binaryPayload?: Uint8Array;
    jsonPayload?: string;
}

/**
 * 3dtile content 预处理
 */
export function preprocess3DTileContent (arrayBuffer: ArrayBuffer): Preprocessed3DTileContent {
    let uint8Array = new Uint8Array(arrayBuffer);
    let contentType = getMagic(uint8Array);
    // We use glTF for JSON glTF files. For binary glTF, we rename this
    // to glb to disambiguate
    if (contentType === "glTF") {
        contentType = "glb";
    }
    if (Earth3DTileContentType.isBinaryFormat(contentType)) {
        // For binary files, the enum value is the magic number
        return {
            contentType: contentType,
            binaryPayload: uint8Array
        }
    }
    let json = getJsonContent(uint8Array);
    if (Utils.defined(json.geometricError) || (Utils.defined(json.root) && Utils.defined(json.root.geometricError))) {
        // Most likely a tileset JSON
        return {
            contentType: Earth3DTileContentType.EXTERNAL_TILESET,
            jsonPayload: json,
        };
    }

    if (Utils.defined(json.asset)) {
        // Most likely a glTF. Tileset JSON also has an "asset" property
        // so this check needs to happen second
        return {
            contentType: Earth3DTileContentType.GLTF,
            jsonPayload: json,
        };
    }

    throw new Error("Invalid tile content.");
}

function getJsonContent (uint8Array: Uint8Array) {
    var json;

    try {
        json = getJsonFromTypedArray(uint8Array, 0, uint8Array.length);
    } catch (error) {
        throw new Error("Invalid tile content.");
    }

    return json;
}