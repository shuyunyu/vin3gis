import { Utils } from "../../../../core/utils/utils";
import { getBinaryAccessor } from "../../misc/get_binary_accessor";
import { Earth3DTileBatchTableHierachy } from "./earth_3dtile_batch_table_hierachy";
import { IEarth3DTileContent } from "./earth_3dtile_content";

export class Earth3DTileBatchTable {

    private _featuresLength: number;

    private _extensions: Record<string, any>;

    private _properties: Record<string, any>;

    private _batchTableHierarchy?: Earth3DTileBatchTableHierachy;

    private _batchTableBinaryProperties: any;

    private _content: IEarth3DTileContent;

    constructor (content: IEarth3DTileContent, featuresLength: number, batchTableJson: any, batchTableBinary: Uint8Array | undefined, colorChangedCallback?: Function) {
        this._featuresLength = featuresLength;
        let extensions;
        if (Utils.defined(batchTableJson)) {
            extensions = batchTableJson.extensions;
        }
        this._extensions = Utils.defaultValue(extensions, {});
        let properties = this.initializeProperties(batchTableJson);
        this._properties = properties;
        this._batchTableHierarchy = this.initializeHierarchy(this, batchTableJson, batchTableBinary);
        this._batchTableBinaryProperties = Earth3DTileBatchTable.getBinaryProperties(featuresLength, properties, batchTableBinary);
        this._content = content;

        // this._batchTexture = new BatchTexture({
        //     featuresLength: featuresLength,
        //     colorChangedCallback: colorChangedCallback,
        //     content: content,
        // });
    }

    private initializeProperties (jsonHeader: any) {
        var properties = {};

        if (!Utils.defined(jsonHeader)) {
            return properties;
        }

        for (var propertyName in jsonHeader) {
            if (
                jsonHeader.hasOwnProperty(propertyName) &&
                propertyName !== "HIERARCHY" && // Deprecated HIERARCHY property
                propertyName !== "extensions" &&
                propertyName !== "extras"
            ) {
                //@ts-ignore
                properties[propertyName] = Utils.clone(jsonHeader[propertyName], true);
            }
        }

        return properties;
    }

    private initializeHierarchy (batchTable: Earth3DTileBatchTable, jsonHeader: any, binaryBody: Uint8Array | undefined) {
        if (!Utils.defined(jsonHeader)) {
            return;
        }

        var hierarchy = batchTable._extensions["3DTILES_batch_table_hierarchy"];

        var legacyHierarchy = jsonHeader.HIERARCHY;
        if (Utils.defined(legacyHierarchy)) {
            console.warn(
                "batchTableHierarchyExtension",
                "The batch table HIERARCHY property has been moved to an extension. Use extensions.3DTILES_batch_table_hierarchy instead."
            );
            batchTable._extensions["3DTILES_batch_table_hierarchy"] = legacyHierarchy;
            hierarchy = legacyHierarchy;
        }

        if (!Utils.defined(hierarchy)) {
            return;
        }

        return new Earth3DTileBatchTableHierachy({
            extension: hierarchy,
            binaryBody: binaryBody,
        });
    }

    public static getBinaryProperties (featuresLength: number, properties: any, binaryBody: any) {
        var binaryProperties;
        for (var name in properties) {
            if (properties.hasOwnProperty(name)) {
                var property = properties[name];
                var byteOffset = property.byteOffset;
                if (Utils.defined(byteOffset)) {
                    // This is a binary property
                    var componentType = property.componentType;
                    var type = property.type;
                    if (!Utils.defined(componentType)) {
                        console.error("componentType is required.");
                    }
                    if (!Utils.defined(type)) {
                        console.error("type is required.");
                    }
                    if (!Utils.defined(binaryBody)) {
                        console.error(
                            "Property " + name + " requires a batch table binary."
                        );
                    }

                    var binaryAccessor = getBinaryAccessor(property);
                    var componentCount = binaryAccessor.componentsPerAttribute;
                    var classType = binaryAccessor.classType;
                    var typedArray = binaryAccessor.createArrayBufferView(
                        binaryBody.buffer,
                        binaryBody.byteOffset + byteOffset,
                        featuresLength
                    );

                    if (!Utils.defined(binaryProperties)) {
                        binaryProperties = {};
                    }

                    // Store any information needed to access the binary data, including the typed array,
                    // componentCount (e.g. a VEC4 would be 4), and the type used to pack and unpack (e.g. Cartesian4).
                    //@ts-ignore
                    binaryProperties[name] = {
                        typedArray: typedArray,
                        componentCount: componentCount,
                        type: classType,
                    };
                }
            }
        }
        return binaryProperties;
    }

}