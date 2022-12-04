import { Texture } from "three";
import { Utils } from "../../../core/utils/utils";
import { imageryCache } from "../cache/imagery_cache";
import { Rectangle } from "../geometry/rectangle";
import { tileTexturePool } from "../pool/tile_texture_pool";
import { IImageryTileProvider } from "../provider/imagery_tile_provider";
import { Imagery, ImageryState } from "./imagery";
import { QuadtreeTile } from "./quad_tree_tile";
import { TileNode } from "./tile_node";

/**
 * 瓦片图片
 */
export class TileImagery {

    private _imagery: Imagery;

    private _texture?: Texture;

    private _node?: TileNode;

    private _imageryProvider: IImageryTileProvider;

    private _loadingImagery: Imagery | undefined;

    private _priority: number;

    //图片资源坐标矩形
    private _imageryCoordinateRectangle: Rectangle | undefined;

    //标识 贴图是否有变更
    private _imageryChanged: boolean = false;

    private _loaded: boolean;

    public get imageryProvider () {
        return this._imageryProvider;
    }

    public get loaded () {
        return this._loaded;
    }

    public get hasImagery () {
        return this.loaded || (Utils.defined(this._loadingImagery) && this._loadingImagery!.state === ImageryState.LOADED);
    }

    public get loadingImagery () {
        return this._loadingImagery;
    }

    public get node () {
        return this._node;
    }

    public set node (val: TileNode | undefined) {
        this._node = val;
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

    public get texture () {
        return this._texture;
    }

    constructor (tile: QuadtreeTile, provider: IImageryTileProvider) {
        this._imagery = imageryCache.getImagery(tile, provider);
        this._imageryProvider = provider;
        this._imageryChanged = false;
        this._loaded = false;
        this._priority = tile.priority;
    }

    /**
     * 状态处理
     */
    public processStateMachine (skipLoading?: boolean) {
        if (!this.loaded) {
            this._imagery!.processStateMachine();
            if (Utils.defined(this._loadingImagery)) {
                this._loadingImagery!.processStateMachine();
            }
            if (this._imagery.state === ImageryState.LOADED) {
                this._loaded = true;
                this._imageryChanged = true;
                if (Utils.defined(this._loadingImagery)) {
                    this._loadingImagery!.releaseResource();
                    this._loadingImagery = undefined;
                }
            } else if (this._imagery.state === ImageryState.FAILED) {
                //如果失败了 那最近的加载好的父级瓦片作为当前瓦片
                let ancestor = this._imagery.parent;
                while (Utils.defined(ancestor) && ancestor!.state !== ImageryState.LOADED) {
                    ancestor = ancestor!.parent;
                }
                if (Utils.defined(ancestor) && ancestor!.isValid) {
                    this._loaded = true;
                    this._imageryChanged = true;
                    this._imagery = ancestor!;
                    ancestor!.addReference();
                }
            } else if (!skipLoading) {
                //如果需要的贴图正在加载 则使用最近的父级贴图先替代
                let ancestor = this._imagery.parent;
                while (Utils.defined(ancestor) && !ancestor!.isValid) {
                    ancestor = ancestor!.parent;
                }
                if (this._loadingImagery !== ancestor) {
                    if (Utils.defined(this._loadingImagery)) {
                        this._loadingImagery!.releaseResource();
                    }
                    this._loadingImagery = ancestor;
                    if (Utils.defined(ancestor)) {
                        ancestor!.addReference();
                        this._imageryChanged = true;
                    }
                }
            }
        }
    }

    private createTextureWithImagery (imagery: Imagery) {
        //可能没有图片资源
        //请求被abort
        return imagery.imageAsset ? tileTexturePool.create(imagery.imageAsset) : undefined;
    }

    /**
     * 创建贴图
     */
    public createTexture () {
        //node回收之后 texture不可复用  所以需要先清除原来的texture
        this.releaseTextureResource();
        let texture: Texture;
        if (this.loaded) {
            texture = this.createTextureWithImagery(this._imagery!);
            this._imageryCoordinateRectangle = this._imagery.rectangle;
        } else {
            if (Utils.defined(this._loadingImagery) && this._loadingImagery!.state === ImageryState.LOADED) {
                texture = this.createTextureWithImagery(this._loadingImagery!);
                this._imageryCoordinateRectangle = this._loadingImagery!.rectangle;
            }
        }
        this._texture = texture;
        return this._texture;
    }

    /**
     * 回收节点资源
     */
    public recyleNodeResource () {
        if (Utils.defined(this._node)) {
            this._node.recycle();
            this._node = undefined;
        }
        this.releaseTextureResource();
    }

    /**
     * 释放贴图资源
     */
    public releaseTextureResource () {
        if (Utils.defined(this._texture)) {
            tileTexturePool.recycle(this._texture);
        }
        this._imageryCoordinateRectangle = undefined;
        this._texture = undefined;
    }

    /**
     * 释放资源
     */
    public releaseResource () {
        this.recyleNodeResource();
        if (Utils.defined(this._imagery)) {
            this._imagery.releaseResource();
        }
        if (Utils.defined(this._loadingImagery)) {
            this._loadingImagery.releaseResource();
        }
    }

}