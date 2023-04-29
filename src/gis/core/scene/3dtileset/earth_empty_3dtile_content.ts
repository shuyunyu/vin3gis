import { FrameState } from "../frame_state";
import { Earth3DTile } from "./earth_3dtile";
import { Earth3DTileset } from "./earth_3dtileset";
import { Earth3DTileBatchTable } from "./earth_3dtile_batch_table";
import { IEarth3DTileContent } from "./earth_3dtile_content";
import { Earth3DTileFeature } from "./earth_3dtile_feature";

export class EarthEmpty3DTileContent implements IEarth3DTileContent {
    public _readyPromise: Promise<IEarth3DTileContent>;

    private _readyPromise_resolve: Function | undefined;

    private _readyPromise_reject: Function | undefined;

    private _tileset: Earth3DTileset;

    private _tile: Earth3DTile;

    private _uriList: string[] = [];

    private _featurePropertiesDirty: boolean;

    private _featuresLength: number = 0;
    private _pointsLength: number = 0;
    private _trianglesLength: number = 0;
    private _geometryByteLength: number = 0;
    private _texturesByteLength: number = 0;
    private _batchTableByteLength: number = 0;
    private _innerContents?: IEarth3DTileContent[];
    private _batchTable?: Earth3DTileBatchTable;

    public get featuresLength () {
        return this._featuresLength;
    }

    public get pointsLength () {
        return this._pointsLength;
    }

    public get trianglesLength () {
        return this._trianglesLength;
    }

    public get geometryByteLength () {
        return this._geometryByteLength;
    }

    public get texturesByteLength () {
        return this._texturesByteLength;
    }

    public get batchTableByteLength () {
        return this._batchTableByteLength;
    }

    public get innerContents () {
        return this._innerContents;
    }

    public get batchTable () {
        return this._batchTable;
    }

    public get readyPromise () {
        return this._readyPromise;
    }

    public get tileset () {
        return this._tileset;
    }

    public get tile () {
        return this._tile;
    }

    public get uriList () {
        return this._uriList;
    }

    public get featurePropertiesDirty () {
        return this._featurePropertiesDirty;
    }

    public set featurePropertiesDirty (featurePropertiesDirty: boolean) {
        this._featurePropertiesDirty = featurePropertiesDirty;
    }

    constructor (tileset: Earth3DTileset, tile: Earth3DTile) {
        this._tileset = tileset;
        this._tile = tile;
        this._featurePropertiesDirty = false;
        this._readyPromise = this.createReadyPromise();
    }

    hide (tileset: Earth3DTileset): void {
    }
    show (tileset: Earth3DTileset): void {
    }
    destroy (): void {

    }

    private createReadyPromise () {
        return new Promise<IEarth3DTileContent>((resolve, reject) => {
            this._readyPromise_resolve = resolve;
            this._readyPromise_reject = reject;
        });
    }

    public update (tileset: Earth3DTileset, frameState: FrameState) {

    }

    public getFeature (batchId: number) {
        return null;
    }

    public hasProperty (batchId: number, name: string) {
        return false;
    }

}