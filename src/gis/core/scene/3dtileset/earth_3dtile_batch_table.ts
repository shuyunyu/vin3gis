import { Utils } from "../../../../core/utils/utils";
import { getBinaryAccessor } from "../../misc/get_binary_accessor";
import { Earth3DTileBatchTableHierachy } from "./earth_3dtile_batch_table_hierachy";
import { IEarth3DTileContent } from "./earth_3dtile_content";

export class Earth3DTileBatchTable {

    private _featuresLength: number;

    public get featuresLength () {
        return this._featuresLength;
    }

    private _extensions: Record<string, any>;

    private _properties: Record<string, any>;

    private _batchTableHierarchy?: Earth3DTileBatchTableHierachy;

    private _batchTableBinaryProperties: any;

    private _binaryPropertiesByteLength: number;

    private _content: IEarth3DTileContent;

    public get batchTableByteLength () {
        let totalByteLength = this._binaryPropertiesByteLength;

        if (Utils.defined(this._batchTableHierarchy)) {
            totalByteLength += this._batchTableHierarchy.byteLength;
        }

        // totalByteLength += this._batchTexture.byteLength;

        return totalByteLength;
    }

    public constructor (content: IEarth3DTileContent, featuresLength: number, batchTableJson: any, batchTableBinary: Uint8Array | undefined, colorChangedCallback?: Function) {
        this._featuresLength = featuresLength;
        let extensions;
        if (Utils.defined(batchTableJson)) {
            extensions = batchTableJson.extensions;
        }
        this._extensions = Utils.defaultValue(extensions, {});
        let properties = initializeProperties(batchTableJson);
        this._properties = properties;
        this._batchTableHierarchy = initializeHierarchy(this, batchTableJson, batchTableBinary);
        const binaryProperties = getBinaryProperties(featuresLength, properties, batchTableBinary);
        this._binaryPropertiesByteLength = countBinaryPropertyMemory(
            binaryProperties
        );
        this._batchTableBinaryProperties = binaryProperties;
        this._content = content;

        // this._batchTexture = new BatchTexture({
        //     featuresLength: featuresLength,
        //     colorChangedCallback: colorChangedCallback,
        //     content: content,
        // });
    }

    public static getBinaryProperties (featuresLength: number, batchTableJson: any, batchTableBinary: any) {
        return getBinaryProperties(featuresLength, batchTableJson, batchTableBinary);
    }

    public isClass (batchId: number, className: string) {
        checkBatchId(batchId, this.featuresLength);

        const hierarchy = this._batchTableHierarchy;
        if (!Utils.defined(hierarchy)) {
            return false;
        }

        return hierarchy.isClass(batchId, className);
    }

    public isExactClass (batchId: number, className: string) {
        return this.getExactClassName(batchId) === className;
    }

    public getExactClassName (batchId: number) {
        checkBatchId(batchId, this.featuresLength);
        const hierarchy = this._batchTableHierarchy;
        if (!Utils.defined(hierarchy)) {
            return undefined;
        }
        return hierarchy.getClassName(batchId);
    }

    public hasProperty (batchId: number, name: string) {

        checkBatchId(batchId, this.featuresLength);
        return (
            Utils.defined(this._properties[name]) ||
            (Utils.defined(this._batchTableHierarchy) &&
                this._batchTableHierarchy.hasProperty(batchId, name))
        );
    }

    public hasPropertyBySemantic () {
        // Cesium 3D Tiles 1.0 formats do not have semantics
        return false;
    }

    public getPropertyIds (batchId: number, results?: string[]) {

        checkBatchId(batchId, this.featuresLength);

        results = Utils.defined(results) ? results : [];
        results.length = 0;

        const scratchPropertyIds = Object.keys(this._properties);
        results.push.apply(results, scratchPropertyIds);

        if (Utils.defined(this._batchTableHierarchy)) {
            results.push.apply(
                results,
                this._batchTableHierarchy.getPropertyIds(batchId, scratchPropertyIds)
            );
        }

        return results;
    }

    public getPropertyBySemantic (batchId: number, name: string) {
        // Cesium 3D Tiles 1.0 formats do not have semantics
        return undefined;
    }

    public getProperty (batchId: number, name: string) {

        checkBatchId(batchId, this.featuresLength);

        if (Utils.defined(this._batchTableBinaryProperties)) {
            const binaryProperty = this._batchTableBinaryProperties[name];
            if (Utils.defined(binaryProperty)) {
                return getBinaryProperty(binaryProperty, batchId);
            }
        }

        const propertyValues = this._properties[name];
        if (Utils.defined(propertyValues)) {
            return Utils.clone(propertyValues[batchId], true);
        }

        if (Utils.defined(this._batchTableHierarchy)) {
            const hierarchyProperty = this._batchTableHierarchy.getProperty(
                batchId,
                name
            );
            if (Utils.defined(hierarchyProperty)) {
                return hierarchyProperty;
            }
        }

        return undefined;
    }

    public setProperty (batchId: number, name: string, value: any) {
        const featuresLength = this.featuresLength;
        checkBatchId(batchId, featuresLength);

        if (Utils.defined(this._batchTableBinaryProperties)) {
            const binaryProperty = this._batchTableBinaryProperties[name];
            if (Utils.defined(binaryProperty)) {
                setBinaryProperty(binaryProperty, batchId, value);
                return;
            }
        }

        if (Utils.defined(this._batchTableHierarchy)) {
            if (this._batchTableHierarchy.setProperty(batchId, name, value)) {
                return;
            }
        }

        let propertyValues = this._properties[name];
        if (!Utils.defined(propertyValues)) {
            // Property does not exist. Create it.
            this._properties[name] = new Array(featuresLength);
            propertyValues = this._properties[name];
        }

        propertyValues[batchId] = Utils.clone(value, true);
    }

}


function initializeHierarchy (batchTable: Earth3DTileBatchTable, jsonHeader: any, binaryBody: Uint8Array | undefined) {
    if (!Utils.defined(jsonHeader)) {
        return;
    }
    //@ts-ignore
    var hierarchy = batchTable._extensions["3DTILES_batch_table_hierarchy"];

    var legacyHierarchy = jsonHeader.HIERARCHY;
    if (Utils.defined(legacyHierarchy)) {
        console.warn(
            "batchTableHierarchyExtension",
            "The batch table HIERARCHY property has been moved to an extension. Use extensions.3DTILES_batch_table_hierarchy instead."
        );
        //@ts-ignore
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

function countBinaryPropertyMemory (binaryProperties) {
    if (!Utils.defined(binaryProperties)) {
        return 0;
    }

    let byteLength = 0;
    for (const name in binaryProperties) {
        if (binaryProperties.hasOwnProperty(name)) {
            byteLength += binaryProperties[name].typedArray.byteLength;
        }
    }
    return byteLength;
}

function initializeProperties (jsonHeader: any) {
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

function getBinaryProperties (featuresLength: number, properties: any, binaryBody: any) {
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

function checkBatchId (batchId: number, featuresLength: number) {
    if (!Utils.defined(batchId) || batchId < 0 || batchId >= featuresLength) {
        throw new Error(`batchId is required and must be between zero and featuresLength - 1 (${featuresLength}` + ")."
        );
    }
}

function getBinaryProperty (binaryProperty, index) {
    const typedArray = binaryProperty.typedArray;
    const componentCount = binaryProperty.componentCount;
    if (componentCount === 1) {
        return typedArray[index];
    }
    return binaryProperty.type.unpack(typedArray, index * componentCount);
}

function setBinaryProperty (binaryProperty, index, value) {
    const typedArray = binaryProperty.typedArray;
    const componentCount = binaryProperty.componentCount;
    if (componentCount === 1) {
        typedArray[index] = value;
    } else {
        binaryProperty.type.pack(value, typedArray, index * componentCount);
    }
}