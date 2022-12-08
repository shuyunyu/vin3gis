import { Utils } from "../../../core/utils/utils";
import { QuadtreeTileLoadState } from "../../@types/core/gis";
import { TileImageryProviderRenderManager } from "../manager/tile_imagery_provider_render_manager";
import { IImageryTileProvider } from "../provider/imagery_tile_provider";
import { ImageryTileProviderCollection } from "../provider/imagery_tile_provider_collection";
import { TileNodeRenderer } from "../renderer/tile_node_renderer";
import { ITerrainProvider } from "../terrain/terrain_provider";
import { QuadtreeTile } from "./quad_tree_tile";
import { TileImagery } from "./tile_imagery";

export class GlobeSurfaceTile {

    private _tile: QuadtreeTile

    private _terrainProvider: ITerrainProvider;

    private _imageryProviderCollection: ImageryTileProviderCollection;

    private _tileImagerProviderRenderManager: TileImageryProviderRenderManager;

    private _tileNodeRenderer: TileNodeRenderer;

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

    constructor (tile: QuadtreeTile, terrainProvider: ITerrainProvider, tileImagerProviderRenderManager: TileImageryProviderRenderManager, tileNodeRenderer: TileNodeRenderer) {
        this._tile = tile;
        this._terrainProvider = terrainProvider;
        this._tileImagerProviderRenderManager = tileImagerProviderRenderManager;
        this._imageryProviderCollection = tileImagerProviderRenderManager.imageryProviders;
        this._tileNodeRenderer = tileNodeRenderer;
    }

    /**
     * 初始化
     */
    public static initialize (tile: QuadtreeTile, terrainProvider: ITerrainProvider, tileImagerProviderRenderManager: TileImageryProviderRenderManager, tileNodeRenderer: TileNodeRenderer) {
        if (!Utils.defined(tile.data)) {
            tile.data = new GlobeSurfaceTile(tile, terrainProvider, tileImagerProviderRenderManager, tileNodeRenderer);
        }
        if (tile.state === QuadtreeTileLoadState.START) {
            tile.state = QuadtreeTileLoadState.LOADING;
            tile.data!.prepareNewTile();
        }
    }

    //准备新的瓦片数据
    private prepareNewTile () {
        this._imageryProviderCollection.foreach((provider: IImageryTileProvider, index: number) => {
            let tileImagery = new TileImagery(this._tile, provider);
            this._tileImageryRecord[provider.id] = tileImagery;
        });
    }

    /**
     * 状态处理
     */
    public processStateMachine () {
        GlobeSurfaceTile.initialize(this._tile, this._terrainProvider, this._tileImagerProviderRenderManager, this._tileNodeRenderer);
        this.processTerrain();
        this.processImagery();
    }

    /**
     * 处理地形
     */
    private processTerrain () {
        if (this._terrainProvider.getTileDataAvailable(this._tile.x, this._tile.y, this._tile.level)) {
            this._tile.renderable = true;
            this._tile.state = QuadtreeTileLoadState.DONE;
        } else {
            this._terrainProvider.loadTileDataAvailability(this._tile.x, this._tile.y, this._tile.level);
        }
    }

    //处理贴图
    private processImagery () {
        //状态处理
        this._imageryProviderCollection.foreach((provider: IImageryTileProvider, index: number) => {
            let tileImagery = this._tileImageryRecord[provider.id];
            if (!Utils.defined(tileImagery)) {
                tileImagery = this._tileImageryRecord[provider.id] = new TileImagery(this._tile, provider);
            }
            tileImagery.priority = this._tile.priority;
            //最底下的图层使用loading图片加载
            if (provider.visible) {
                tileImagery.processStateMachine(index !== 0);
            }
        });
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
            let allImageryDone = true;
            this._imageryProviderCollection.foreach((provider: IImageryTileProvider, i: number) => {
                if (provider.visible) {
                    let tImagery = this._tileImageryRecord[provider.id];
                    //如果最下层还未渲染 先渲染它 不必等到上层加载完成
                    if (i === 0 && !Utils.defined(tImagery.textureImagery)) {
                        this.renderTileImagery(provider);
                    }
                    allImageryDone = allImageryDone && Utils.defined(this._tileImageryProviderToRenderQueue[i]) && tImagery.loaded;
                    if (!allImageryDone) {
                        //break
                        return false;
                    }
                }
            });
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
        const queue = this._tileImagerProviderRenderManager.getProviderRenderQueue(provider);
        if (!queue.contains(this._tile)) {
            queue.enqueue(this._tile);
        }
        let tileImagery = this._tileImageryRecord[provider.id];
        //移除原来的渲染
        this.unrenderTileImagery(tileImagery);
        let textureImagery = tileImagery.createTextureImagery();
        //缩放等级之外没有贴图图片
        if (Utils.defined(textureImagery)) {
            //重新渲染瓦片图片
            this._tileNodeRenderer.render(tileImagery);
        }
    }

    /**
     * 回收瓦片贴图(节点)
     */
    public recyleTileImagery (provider: IImageryTileProvider) {
        let tileImagery = this._tileImageryRecord[provider.id];
        this.unrenderTileImagery(tileImagery);
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
            const tileImagery = this._tileImageryRecord[key];
            this.releaseTileImageryResource(tileImagery);
        }
        this._tileImageryRecord = Object.create(null);
        this.markToRerenderTileImagery();
    }

    /**
     * 取消渲染瓦片
     * @param tileImagery 
     */
    private unrenderTileImagery (tileImagery: TileImagery) {
        if (tileImagery.textureImagery) this._tileNodeRenderer.unrender(tileImagery);
        tileImagery.recyleTextureImageryResource();
    }

    /**
     * 释放瓦片资源
     * @param tileImagery 
     */
    private releaseTileImageryResource (tileImagery: TileImagery) {
        this.unrenderTileImagery(tileImagery);
        tileImagery.releaseResource();
    }

}