import { IImageryTileProvider } from "../provider/imagery_tile_provider";
import { QuadtreeTile } from "./quad_tree_tile";
import { TileReplacementQueue } from "./tile_replacement_queue";

export class QuadtreePrimitive {
    //切片提供者
    private _tileProvider: IImageryTileProvider;

    //level=0 的 瓦片
    private _levelZeroTiles: QuadtreeTile[] | undefined;

    private _tileReplacementQueue: TileReplacementQueue;

    private _tileCacheSize: number;

    public get tileCacheSize () {
        return this._tileCacheSize;
    }

    public set tileCacheSize (val: number) {
        this._tileCacheSize = val;
    }

    public get tileProvider () {
        return this._tileProvider;
    }

    public set tileProvider (provider: IImageryTileProvider) {
        this._tileProvider = provider;
    }

    public get levelZeroTiles () {
        return this._levelZeroTiles;
    }

    public set levelZeroTiles (tiles: QuadtreeTile[] | undefined) {
        this._levelZeroTiles = tiles;
    }

    public get tileReplacementQueue () {
        return this._tileReplacementQueue;
    }

    constructor (tileProvider: IImageryTileProvider, tileCacheSize: number) {
        this._tileProvider = tileProvider;
        this._tileReplacementQueue = new TileReplacementQueue();
        this._tileCacheSize = tileCacheSize;
    }
}