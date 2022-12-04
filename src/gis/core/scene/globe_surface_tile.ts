import { Utils } from "../../../core/utils/utils";
import { QuadtreeTileLoadState } from "../../@types/core/gis";
import { IImageryTileProvider } from "../provider/imagery_tile_provider";
import { ImageryTileProviderCollection } from "../provider/imagery_tile_provider_collection";
import { QuadtreeTile } from "./quad_tree_tile";
import { TileImagery } from "./tile_imagery";
import { TileNode } from "./tile_node";

export class GlobeSurfaceTile {

    private _tile: QuadtreeTile

    private _imageryProviderCollection: ImageryTileProviderCollection;

    private _tileImageryRecord: Record<string, TileImagery> = Object.create(null);

    //等待渲染的 瓦片提供者
    private _tileImageryProviderToRenderQueue: IImageryTileProvider[] = [];

    private _tileImageryRendered: boolean = false;

    //判断是否可以卸载瓦片资源
    public get eligibleForUnloading () {
        let shouleRemoveTile = true;
        for (const key in this._tileImageryRecord) {
            const tileImagery = this._tileImageryRecord[key];
            shouleRemoveTile = !tileImagery.loadingImagery;
            if (!shouleRemoveTile) {
                break;
            }
        }
        return shouleRemoveTile;
    }

    constructor (tile: QuadtreeTile, imageryProviderCollection: ImageryTileProviderCollection) {
        this._tile = tile;
        this._imageryProviderCollection = imageryProviderCollection;
    }

    /**
     * 初始化
     */
    public static initialize (tile: QuadtreeTile, imageryProviderCollectoin: ImageryTileProviderCollection) {
        if (!Utils.defined(tile.data)) {
            tile.data = new GlobeSurfaceTile(tile, imageryProviderCollectoin);
        }
        if (tile.state === QuadtreeTileLoadState.START) {
            tile.state = QuadtreeTileLoadState.LOADING;
            tile.data!.prepareNewTile();
        }
    }

    //准备新的瓦片数据
    private prepareNewTile () {
        let providers = this._imageryProviderCollection.toArray();
        for (let i = 0; i < providers.length; i++) {
            const provider = providers[i];
            let tileImagery = new TileImagery(this._tile, provider);
            this._tileImageryRecord[provider.id] = tileImagery;
        }
    }

    /**
     * 状态处理
     */
    public processStateMachine () {
        GlobeSurfaceTile.initialize(this._tile, this._imageryProviderCollection);
        this.processTerrain();
        this.processImagery();
    }

    /**
     * 处理地形
     */
    private processTerrain () {
        this._tile.renderable = true;
        this._tile.state = QuadtreeTileLoadState.DONE;
    }

    //处理贴图
    private processImagery () {
        //状态处理
        let providers = this._imageryProviderCollection.toArray();
        for (let i = 0; i < providers.length; i++) {
            const provider = providers[i];
            let tileImagery = this._tileImageryRecord[provider.id];
            if (!Utils.defined(tileImagery)) {
                tileImagery = this._tileImageryRecord[provider.id] = new TileImagery(this._tile, provider);
            }
            tileImagery.priority = this._tile.priority;
            //最底下的图层使用loading图片加载
            if (provider.visible) {
                tileImagery.processStateMachine(i !== 0);
            }
        }
    }

    /**
     * 判断是否有瓦片贴图
     */
    public hasTileImagery (provider: IImageryTileProvider) {
        let tileImagery = this._tileImageryRecord[provider.id];
        return Utils.defined(tileImagery) && tileImagery.hasImagery;
    }

    /**
     * 添加到渲染队列 按ImageryProvider的排序渲染
     */
    public addToTileImageryRenderQueue (imageryProvider: IImageryTileProvider) {
        this.processImagery();
        let index = this._imageryProviderCollection.indexOf(imageryProvider);
        let tileImagery = this._tileImageryRecord[imageryProvider.id];
        this._tileImageryProviderToRenderQueue[index] = imageryProvider;
        let loadingImageryChanged = tileImagery.imageryChanged;
        if (loadingImageryChanged) {
            tileImagery.imageryChanged = false;
            this._tileImageryRendered = false;
            //只渲染最下层的
            if (index === 0) {
                this.renderTileImagery(imageryProvider);
            }
        } else {
            if (this._tileImageryRendered) {
                return;
            }
            let providers = this._imageryProviderCollection.toArray();
            let allImageryDone = true;
            for (let i = 0; i < providers.length; i++) {
                const provider = providers[i];
                if (provider.visible) {
                    let tImagery = this._tileImageryRecord[provider.id];
                    //如果最下层还未渲染 先渲染它 不必等到上层加载完成
                    if (i === 0 && !Utils.defined(tImagery.node)) {
                        this.renderTileImagery(provider);
                    }
                    allImageryDone = allImageryDone && Utils.defined(this._tileImageryProviderToRenderQueue[i]) && tImagery.loaded;
                    if (!allImageryDone) {
                        break;
                    }
                }
            }
            //按图层顺序重置瓦片节点
            if (allImageryDone) {
                //只调整上层瓦片
                for (let i = 1; i < this._tileImageryProviderToRenderQueue.length; i++) {
                    const provider = this._tileImageryProviderToRenderQueue[i];
                    this.renderTileImagery(provider);
                }
                this._tileImageryProviderToRenderQueue.length = 0;
                this._tileImageryRendered = true;
            }
        }
    }

    /**
     * 渲染单个瓦片贴图
     */
    private renderTileImagery (provider: IImageryTileProvider) {
        if (!provider.tileImageryRenderedQueue.contains(this._tile)) {
            provider.tileImageryRenderedQueue.enqueue(this._tile);
        }
        let tileImagery = this._tileImageryRecord[provider.id];
        let texture = tileImagery.createTexture();
        //缩放等级之外没有贴图
        if (Utils.defined(texture)) {
            // let node = TileFactory.renderImageryToTileNode(provider, texture!, imageryRectangle, this._tile.nativeRectangle, this._tile.id, tileImagery.node, tileImagery.texture);
            // tileImagery.node = node;
            if (tileImagery.node) {
                tileImagery.node.recycle();
            }
            tileImagery.node = TileNode.create(provider, this._tile, texture, tileImagery.imageryCoordinateRectangle);
            tileImagery.node.render();
        } else {
            tileImagery.recyleNodeResource();
        }
    }

    /**
     * 回收瓦片贴图(节点)
     */
    public recyleTileImagery (provider: IImageryTileProvider) {
        let tileImagery = this._tileImageryRecord[provider.id];
        tileImagery.recyleNodeResource();
        this.markToRerenderTileImagery();
    }

    /**
     * 标记为需要重新渲染tileImagery
     */
    public markToRerenderTileImagery () {
        this._tileImageryRendered = false;
        this._tileImageryProviderToRenderQueue.length = 0;
    }

    /**
     * 释放资源
     */
    public releaseResource () {
        for (const key in this._tileImageryRecord) {
            if (Object.prototype.hasOwnProperty.call(this._tileImageryRecord, key)) {
                const tileImagery = this._tileImageryRecord[key];
                tileImagery.releaseResource();
            }
        }
        this._tileImageryRecord = Object.create(null);
        this.markToRerenderTileImagery();
    }

}