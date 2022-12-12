import { Utils } from "../../../core/utils/utils";
import { imageryCache } from "../cache/imagery_cache";
import { Rectangle } from "../geometry/rectangle";
import { IImageryTileProvider } from "../provider/imagery_tile_provider";
import { Imagery, ImageryState } from "./imagery";
import { QuadtreeTile } from "./quad_tree_tile";

/**
 * 瓦片图片
 */
export class TileImagery {

    public readonly tile: QuadtreeTile;

    public readonly imageryProvider: IImageryTileProvider;

    private _imagery: Imagery;

    private _loadingImagery: Imagery | undefined;

    private _priority: number;

    //图片资源坐标矩形
    private _imageryCoordinateRectangle: Rectangle | undefined;

    //标识 贴图是否有变更
    private _imageryChanged: boolean = false;

    private _loaded: boolean;

    private _textureImagery?: Imagery;

    //当前瓦片对应的贴图图片
    public get textureImagery () {
        return this._textureImagery;
    }

    public get loaded () {
        return this._loaded;
    }

    public get hasImagery () {
        return this.loaded;
    }

    public get loadingImagery () {
        return this._loadingImagery;
    }

    public get imageryChanged () {
        return this._imageryChanged;
    }

    public set imageryChanged (val: boolean) {
        this._imageryChanged = val;
    }

    public get imageryCoordinateRectangle () {
        return this._imageryCoordinateRectangle;
    }

    public set priority (val: number) {
        this._priority = val;
        if (Utils.defined(this._imagery)) {
            this._imagery.priority = val;
        }
    }

    public get priority () {
        return this._priority;
    }

    constructor (tile: QuadtreeTile, provider: IImageryTileProvider) {
        this._imagery = imageryCache.getImagery(tile, provider);
        this.imageryProvider = provider;
        this.tile = tile;
        this._imageryChanged = false;
        this._loaded = false;
        this._priority = tile.priority;
    }

    /**
     * 状态处理
     */
    public processStateMachine (skipLoading?: boolean) {
        if (!this.loaded) {
            this._imagery.processStateMachine();
            if (Utils.defined(this._loadingImagery)) {
                this._loadingImagery.processStateMachine();
            }
            if (this._imagery.state === ImageryState.LOADED) {
                this._loaded = true;
                this._imageryChanged = true;
                if (Utils.defined(this._loadingImagery)) {
                    this._loadingImagery.releaseResource();
                    this._loadingImagery = undefined;
                }
            } else if (this._imagery.state === ImageryState.FAILED) {
                //如果失败了 那最近的加载好的父级瓦片作为当前瓦片
                let ancestor = this._imagery.parent;
                while (Utils.defined(ancestor) && ancestor.state !== ImageryState.LOADED) {
                    ancestor = ancestor.parent;
                }
                if (Utils.defined(ancestor) && ancestor.isValid) {
                    this._loaded = true;
                    this._imageryChanged = true;
                    this._imagery = ancestor;
                    ancestor.addReference();
                }
            } else if (!skipLoading) {
                //如果需要的贴图正在加载 则使用最近的父级贴图先替代
                let ancestor = this._imagery.parent;
                while (Utils.defined(ancestor) && !ancestor.isValid) {
                    ancestor = ancestor.parent;
                }
                if (this._loadingImagery !== ancestor) {
                    if (Utils.defined(this._loadingImagery)) {
                        this._loadingImagery.releaseResource();
                    }
                    this._loadingImagery = ancestor;
                    if (Utils.defined(ancestor)) {
                        ancestor.addReference();
                        this._imageryChanged = true;
                    }
                }
            }
        }
    }

    /**
     * 创建贴图图片
     */
    public createTextureImagery () {
        let textureImagery: Imagery;
        if (this.loaded) {
            textureImagery = this._imagery;
        } else {
            if (this._loadingImagery && this._loadingImagery.isValid) {
                textureImagery = this._loadingImagery;
            }
        }
        //可能没有图片资源
        this._textureImagery = textureImagery && textureImagery.imageAsset ? textureImagery : null;
        return this._textureImagery;
    }

    /**
     * 释放资源
     */
    public releaseResource () {
        this._textureImagery = null;
        if (Utils.defined(this._imagery)) {
            this._imagery.releaseResource();
            this._imagery = null;
        }
        if (Utils.defined(this._loadingImagery)) {
            this._loadingImagery.releaseResource();
            this._loadingImagery = null;
        }
    }

}