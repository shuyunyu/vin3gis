import { Utils } from "../../../../core/utils/utils";
import { IEarth3DTileContent } from "./earth_3dtile_content";

function updatePointAndFeatureCounts (statistics: Earth3DTilesetStatistics, content: IEarth3DTileContent, decrement: boolean, load: boolean) {
    if (!content) return;
    let contents = Utils.defined(content) ? content.innerContents : undefined;
    let pointsLength = content.pointsLength;
    let trianglesLength = content.trianglesLength;
    let featuresLength = content.featuresLength;
    let geometryByteLength = content.geometryByteLength;
    let texturesByteLength = content.texturesByteLength;
    let batchTableByteLength = content.batchTableByteLength;

    if (load) {
        statistics.numberOfFeaturesLoaded += decrement
            ? -featuresLength
            : featuresLength;
        statistics.numberOfPointsLoaded += decrement ? -pointsLength : pointsLength;
        statistics.geometryByteLength += decrement
            ? -geometryByteLength
            : geometryByteLength;
        statistics.texturesByteLength += decrement
            ? -texturesByteLength
            : texturesByteLength;
        statistics.batchTableByteLength += decrement
            ? -batchTableByteLength
            : batchTableByteLength;
    } else {
        statistics.numberOfFeaturesSelected += decrement
            ? -featuresLength
            : featuresLength;
        statistics.numberOfPointsSelected += decrement
            ? -pointsLength
            : pointsLength;
        statistics.numberOfTrianglesSelected += decrement
            ? -trianglesLength
            : trianglesLength;
    }

    if (Utils.defined(contents)) {
        let length = contents!.length;
        for (let i = 0; i < length; ++i) {
            updatePointAndFeatureCounts(statistics, contents![i], decrement, load);
        }
    }
}

/**
 * 3dtileset 统计信息
 */
export class Earth3DTilesetStatistics {

    // Rendering statistics
    private _selected: number = 0;
    private _visited: number = 0;

    public get selected () {
        return this._selected;
    }

    public set selected (val: number) {
        this._selected = val;
    }

    public get visited () {
        return this._visited;
    }

    public set visited (val: number) {
        this._visited = val;
    }

    // Loading statistics
    // Number of tiles with content loaded, does not include empty tiles
    private _numberOfTilesWithContentReady = 0;
    //Number of tiles in tileset JSON (and other tileset JSON files as they are loaded)
    private _numberOfTilesTotal: number = 0;
    // Running total of loaded tiles for the lifetime of the session
    private _numberOfLoadedTilesTotal: number = 0;

    public get numberOfTilesWithContentReady () {
        return this._numberOfTilesWithContentReady;
    }

    public set numberOfTilesWithContentReady (val: number) {
        this._numberOfTilesWithContentReady = val;
    }

    public get numberOfTilesTotal () {
        return this._numberOfTilesTotal;
    }

    public set numberOfTilesTotal (val: number) {
        this._numberOfTilesTotal = val;
    }

    public get numberOfLoadedTilesTotal () {
        return this._numberOfLoadedTilesTotal;
    }

    public set numberOfLoadedTilesTotal (val: number) {
        this._numberOfLoadedTilesTotal = val;
    }

    // Features statistics
    // Number of features rendered
    private _numberOfFeaturesSelected: number = 0;
    // Number of features in memory
    private _numberOfFeaturesLoaded: number = 0;
    private _numberOfPointsSelected: number = 0;
    private _numberOfPointsLoaded: number = 0;
    private _numberOfTrianglesSelected: number = 0;

    public get numberOfFeaturesSelected () {
        return this._numberOfFeaturesSelected;
    }

    public set numberOfFeaturesSelected (val: number) {
        this._numberOfFeaturesSelected = val;
    }

    public get numberOfFeaturesLoaded () {
        return this._numberOfFeaturesLoaded;
    }

    public set numberOfFeaturesLoaded (val: number) {
        this._numberOfFeaturesLoaded = val;
    }

    public get numberOfPointsSelected () {
        return this._numberOfPointsSelected;
    }

    public set numberOfPointsSelected (val: number) {
        this._numberOfPointsSelected = val;
    }

    public get numberOfPointsLoaded () {
        return this._numberOfPointsLoaded;
    }

    public set numberOfPointsLoaded (val: number) {
        this._numberOfPointsLoaded = val;
    }

    public get numberOfTrianglesSelected () {
        return this._numberOfTrianglesSelected;
    }

    public set numberOfTrianglesSelected (val: number) {
        this._numberOfTrianglesSelected = val;
    }

    // Memory statistics
    private _geometryByteLength: number = 0;
    private _texturesByteLength: number = 0;
    private _batchTableByteLength: number = 0;

    public get geometryByteLength () {
        return this._geometryByteLength;
    }

    public set geometryByteLength (val: number) {
        this._geometryByteLength = val;
    }

    public get texturesByteLength () {
        return this._texturesByteLength;
    }

    public set texturesByteLength (val: number) {
        this._texturesByteLength = val;
    }

    public get batchTableByteLength () {
        return this._batchTableByteLength;
    }

    public set batchTableByteLength (val: number) {
        this._batchTableByteLength = val;
    }

    constructor () {

    }

    public clear () {
        this.selected = 0;
        this.visited = 0;
        this.numberOfFeaturesSelected = 0;
        this.numberOfPointsSelected = 0;
        this.numberOfTrianglesSelected = 0;
    }

    public incrementSelectionCounts (content: IEarth3DTileContent) {
        updatePointAndFeatureCounts(this, content, false, false);
    }

    public incrementLoadCounts (content: IEarth3DTileContent) {
        updatePointAndFeatureCounts(this, content, false, true);
    }

    public decrementLoadCounts (content: IEarth3DTileContent) {
        updatePointAndFeatureCounts(this, content, true, true);
    }

    public clone (statistics: Earth3DTilesetStatistics, result: Earth3DTilesetStatistics) {
        result.selected = statistics.selected;
        result.visited = statistics.visited;
        result.selected = statistics.selected;
        result.numberOfTilesWithContentReady =
            statistics.numberOfTilesWithContentReady;
        result.numberOfTilesTotal = statistics.numberOfTilesTotal;
        result.numberOfFeaturesSelected = statistics.numberOfFeaturesSelected;
        result.numberOfFeaturesLoaded = statistics.numberOfFeaturesLoaded;
        result.numberOfPointsSelected = statistics.numberOfPointsSelected;
        result.numberOfPointsLoaded = statistics.numberOfPointsLoaded;
        result.numberOfTrianglesSelected = statistics.numberOfTrianglesSelected;
        result.geometryByteLength = statistics.geometryByteLength;
        result.texturesByteLength = statistics.texturesByteLength;
        result.batchTableByteLength = statistics.batchTableByteLength;
    }

}