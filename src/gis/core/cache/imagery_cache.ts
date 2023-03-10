import { Utils } from "../../../core/utils/utils";
import { IImageryTileProvider } from "../provider/imagery_tile_provider";
import { Imagery } from "../scene/imagery";
import { QuadtreeTile } from "../scene/quad_tree_tile";

/**
 * 图片缓存管理对象
 */
class ImageryCache {

    private static _instance?: ImageryCache;

    private _cache: Record<string, Imagery> = {};

    public static get instance () {
        if (this._instance !== undefined) {
            return this._instance;
        }
        this._instance = new ImageryCache();
        return this._instance;
    }

    private _size = 0;

    public get size () {
        return this._size;
    }

    /**
     * 从缓存中获取Imagery
     */
    public getImagery (tile: QuadtreeTile, provider: IImageryTileProvider) {
        let key = this.getCacheKey(tile.x, tile.y, tile.level, provider);
        let imagery = this._cache[key];
        if (!Utils.defined(imagery)) {
            imagery = this._cache[key] = new Imagery(tile, provider);
            this._size++;
        }
        imagery.addReference();
        return imagery;
    }

    /**
     * 移除缓存
     */
    public removeImagery (x: number, y: number, level: number, provider: IImageryTileProvider) {
        let key = this.getCacheKey(x, y, level, provider);
        if (this._cache[key]) {
            delete this._cache[key];
            this._size--;
        }
    }

    //获取缓存key
    private getCacheKey (x: number, y: number, level: number, provider: IImageryTileProvider) {
        return `${provider.id}_${x}_${y}_${level}`;
    }

}

export const imageryCache = ImageryCache.instance;