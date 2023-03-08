import { Utils } from "../../../../core/utils/utils";
import { ComponentDatatype } from "../../misc/component_data_type";

export class Earth3DTileFeatureTable {

    private _json: any;

    private _buffer: Uint8Array;

    private _cachedTypedArrays: Record<string, any> = {};

    private _featuresLength: number;

    public get json () {
        return this._json;
    }

    public get buffer () {
        return this._buffer;
    }

    public get cachedTypedArrays () {
        return this._cachedTypedArrays;
    }

    public get featuresLength () {
        return this._featuresLength;
    }

    public set featuresLength (featuresLength: number) {
        this._featuresLength = featuresLength;
    }

    constructor (featureTableJson: any, featureTableBinary: Uint8Array) {
        this._json = featureTableJson;
        this._buffer = featureTableBinary;
        this._featuresLength = 0;
    }

    private getTypedArrayFromBinary (featureTable: Earth3DTileFeatureTable, semantic: string, componentType: number, componentLength: number, count: number, byteOffset: number
    ) {
        let cachedTypedArrays = featureTable.cachedTypedArrays;
        let typedArray = cachedTypedArrays[semantic];
        if (!Utils.defined(typedArray)) {
            typedArray = ComponentDatatype.createArrayBufferView(
                componentType,
                featureTable.buffer.buffer,
                featureTable.buffer.byteOffset + byteOffset,
                count * componentLength
            );
            cachedTypedArrays[semantic] = typedArray;
        }
        return typedArray;
    }

    private getTypedArrayFromArray (featureTable: Earth3DTileFeatureTable, semantic: string, componentType: number, array: any) {
        let cachedTypedArrays = featureTable.cachedTypedArrays;
        let typedArray = cachedTypedArrays[semantic];
        if (!Utils.defined(typedArray)) {
            typedArray = ComponentDatatype.createTypedArray(componentType, array);
            cachedTypedArrays[semantic] = typedArray;
        }
        return typedArray;
    }

    public getGlobalProperty (semantic: string, componentType?: number, componentLength?: number) {
        let jsonValue = this.json[semantic];
        if (!Utils.defined(jsonValue)) {
            return undefined;
        }
        if (Utils.defined(jsonValue.byteOffset)) {
            componentType = Utils.defaultValue(componentType, ComponentDatatype.UNSIGNED_INT);
            componentLength = Utils.defaultValue(componentLength, 1);
            return this.getTypedArrayFromBinary(this, semantic, componentType!, componentLength!, 1, jsonValue.byteOffset
            );
        }

        return jsonValue;
    }

    public getPropertyArray (semantic: string, componentType: number, componentLength: number) {
        let jsonValue = this.json[semantic];
        if (!Utils.defined(jsonValue)) {
            return undefined;
        }

        if (Utils.defined(jsonValue.byteOffset)) {
            if (Utils.defined(jsonValue.componentType)) {
                componentType = ComponentDatatype.fromName(jsonValue.componentType);
            }
            return this.getTypedArrayFromBinary(
                this,
                semantic,
                componentType,
                componentLength,
                this.featuresLength,
                jsonValue.byteOffset
            );
        }

        return this.getTypedArrayFromArray(this, semantic, componentType, jsonValue);
    }

    public getProperty (semantic: string, componentType: number, componentLength: number, featureId: number, result: any) {
        let jsonValue = this.json[semantic];
        if (!Utils.defined(jsonValue)) {
            return undefined;
        }

        let typedArray = this.getPropertyArray(
            semantic,
            componentType,
            componentLength
        );

        if (componentLength === 1) {
            return typedArray[featureId];
        }

        for (let i = 0; i < componentLength; ++i) {
            result[i] = typedArray[componentLength * featureId + i];
        }

        return result;
    }

}
