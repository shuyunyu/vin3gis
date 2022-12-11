import { Utils } from "../../../core/utils/utils";
import { QuadtreeTileLoadState } from "../../@types/core/gis";
import { TileImageryProviderRenderManager } from "../manager/tile_imagery_provider_render_manager";
import { IImageryTileProvider } from "../provider/imagery_tile_provider";
import { ImageryTileProviderCollection } from "../provider/imagery_tile_provider_collection";
import { TileNodeRenderer } from "../renderer/tile_node_renderer";
import { ITerrainProvider } from "../terrain/terrain_provider";
import { Imagery } from "./imagery";
import { QuadtreeTile } from "./quad_tree_tile";
import { TileImagery } from "./tile_imagery";

export class GlobeSurfaceTile {

    private _tile: QuadtreeTile

    private _terrainProvider: ITerrainProvider;

    private _imageryProviderCollection: ImageryTileProviderCollection;

    private _tileImagerProviderRenderManager: TileImageryProviderRenderManager;

    private _tileNodeRenderer: TileNodeRenderer;

    //保存该瓦片对应的每个瓦片提供者的图片信息
    private _tileImageryRecord: Record<string, TileImagery> = Object.create(null);

    //保存上一帧渲染的贴图
    private _beforeRenderImagery: Imagery[] = [];

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

    /**
     * 判断此瓦片是否需要加载数据
     */
    public get needsLoading () {
        let targetCount = 0;
        let count = 0;
        this._imageryProviderCollection.foreach((provider: IImageryTileProvider, i: number) => {
            if (provider.visible) {
                targetCount++;
            }
            if (this.hasTileImagery(provider)) {
                count++;
            }
        });
        return count < targetCount;
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
            if (provider.visible) {
                let tileImagery = new TileImagery(this._tile, provider);
                this._tileImageryRecord[provider.id] = tileImagery;
            }
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
                // tileImagery.processStateMachine(index !== 0);
                tileImagery.processStateMachine(false);
            }
        });
    }

    /**
     * 判断是否有瓦片贴图
     */
    public hasTileImagery (provider: IImageryTileProvider) {
        let tileImagery = this._tileImageryRecord[provider.id];
        return tileImagery && tileImagery.hasImagery;
    }

    /**
     * 标记为未渲染
     */
    public markToUnrender () {
        this._beforeRenderImagery.length = 0;
    }

    /**
     * 判断是否应该更新瓦片贴图
     * @param imagerys 
     */
    private needsUpdateTileImagery (imagerys: Imagery[]) {
        for (let i = 0; i < imagerys.length; i++) {
            const imagery = imagerys[i];
            const bImagerg = this._beforeRenderImagery[i];
            if (imagery !== bImagerg) return true;
        }
        return false;
    }

    /**
     * 渲染瓦片图像
     */
    public rendererTileImagerys () {
        //TODO 多个overlay贴图提供者需要处理合图
        const toRenderImagerys: Imagery[] = [];
        this._imageryProviderCollection.foreach((provider: IImageryTileProvider, index: number) => {
            const tileImagery = this._tileImageryRecord[provider.id];
            if (tileImagery) {
                const imageryChanged = tileImagery.imageryChanged;
                if (imageryChanged) {
                    tileImagery.imageryChanged = false;
                }
                const textureImagery = tileImagery.createTextureImagery();
                if (provider.visible) {
                    if (textureImagery) {
                        toRenderImagerys.push(textureImagery);
                    } else {
                        toRenderImagerys.push(this._beforeRenderImagery[index]);
                    }
                } else {
                    toRenderImagerys.push(null);
                }
            }
        });
        if (toRenderImagerys.length && this.needsUpdateTileImagery(toRenderImagerys)) {
            this._tileNodeRenderer.render(this._tile, toRenderImagerys[0], toRenderImagerys[1]);
            this._beforeRenderImagery.length = 0;
            this._beforeRenderImagery.push(...toRenderImagerys);
        }
    }

    /**
     * 取消单个provinder的贴图渲染
     */
    public unrenderProviderTileImagery (provider: IImageryTileProvider) {
        let tileImagery = this._tileImageryRecord[provider.id];
        if (tileImagery) tileImagery.recyleTextureImageryResource();
        delete this._tileImageryRecord[provider.id];
        this.rendererTileImagerys();
    }


    /**
     * 释放瓦片所有资源
     */
    public releaseResource () {
        this._tileNodeRenderer.unrender(this._tile);
        for (const key in this._tileImageryRecord) {
            const tileImagery = this._tileImageryRecord[key];
            this.releaseTileImageryResource(tileImagery);
        }
        this._tileImageryRecord = Object.create(null);
        this._beforeRenderImagery = [];
    }

    /**
     * 释放瓦片贴图资源
     * @param tileImagery 
     */
    private releaseTileImageryResource (tileImagery: TileImagery) {
        tileImagery.recyleTextureImageryResource();
        tileImagery.releaseResource();
    }

}