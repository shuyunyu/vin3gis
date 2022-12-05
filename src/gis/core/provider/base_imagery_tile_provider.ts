import { Frustum } from "three";
import { GenericEvent } from "../../../core/event/generic_event";
import { IntersectUtils } from "../../../core/utils/intersect_utils";
import { Utils } from "../../../core/utils/utils";
import { IScheduleRequestTask, RequestTaskStatus } from "../../../core/xhr/scheduler/@types/request";
import { ImageRequestResult } from "../../@types/core/gis";
import { Rectangle } from "../geometry/rectangle";
import { QuadtreeTile } from "../scene/quad_tree_tile";
import { QuadtreeTileQueue } from "../scene/quad_tree_tile_queue";
import { TileNodeContainer } from "../scene/tile_node_container";
import { ITilingScheme } from "../tilingscheme/tiling_scheme";
import { WebMercatorTilingScheme } from "../tilingscheme/web_mercator_tiling_scheme";
import { IImageryTileProvider } from "./imagery_tile_provider";
import { ImageryTileProviderOptions } from "./imagery_tile_provider_options";

/**
 * 基础图片切片 提供者
 */
export class BaseImageryTileProvider implements IImageryTileProvider {

    //瓦片节点容器 
    //需要将瓦片节点容器添加至场景中才能显示图层
    public readonly tileNodeContainer: TileNodeContainer;

    //id
    public readonly id;

    private _levelZeroMaximumGeometricError: number | undefined;

    //瓦片格式
    public readonly format: string = '.png';
    //是否可见
    private _visible: boolean;
    //最大缩放等级
    public readonly maximumLevel: number = 3;
    //等小缩放等级
    public readonly minimumLevel: number = 21;
    //瓦片宽度
    public readonly tileWidth: number = 256;
    //瓦片高度
    public readonly tileHeight: number = 256;
    //标识是否已经准备完毕
    public readonly ready: boolean = false;
    //切片范围
    public readonly rectangle: Rectangle;
    //瓦片方案
    public readonly tilingScheme: ITilingScheme;

    public readonly visibilityChanged = new GenericEvent<IImageryTileProvider>;

    public readonly tileImageryRenderedQueue: QuadtreeTileQueue;

    public get visible () {
        return this._visible;
    }

    public set visible (visible: boolean) {
        if (this._visible === visible) return;
        this._visible = visible;
        this.tileNodeContainer.object3d.visible = this._visible;
        this.visibilityChanged.invoke(this);
    }


    public constructor (imageryTileProviderOptions?: ImageryTileProviderOptions) {
        this.id = Utils.createGuid();
        this._visible = Utils.defaultValue(imageryTileProviderOptions?.visible, true);
        this.tileNodeContainer = new TileNodeContainer();
        this.tileNodeContainer.object3d.visible = this._visible;
        this.format = Utils.defaultValue(imageryTileProviderOptions?.format, '.png');
        this.maximumLevel = Utils.defaultValue(imageryTileProviderOptions?.maximumLevel, 0);
        this.minimumLevel = Utils.defaultValue(imageryTileProviderOptions?.minimumLevel, 0);
        this.tileWidth = Utils.defaultValue(imageryTileProviderOptions?.tileWidth, 256);
        this.tileHeight = Utils.defaultValue(imageryTileProviderOptions?.tileHeight, 256);
        this.tilingScheme = Utils.defaultValue(imageryTileProviderOptions?.tilingScheme, new WebMercatorTilingScheme());
        this.rectangle = Utils.defaultValue(imageryTileProviderOptions?.rectangle, this.tilingScheme.projection.rectangle);
        this.tileImageryRenderedQueue = new QuadtreeTileQueue();
        let width = this.tilingScheme.projection.rectangle.width;
        let tilesOfXAtZeroLevel = this.tilingScheme.getNumberOfXTilesAtLevel(0);
        this._levelZeroMaximumGeometricError = width / tilesOfXAtZeroLevel / this.tileWidth;
        this.ready = true;
    }

    /**
     * 请求瓦片图片资源
     * 子类需重写此方法
     * @param x 
     * @param y 
     * @param level 
     * @param priority 
     * @param onComplete 
     */
    public requestTileImageAsset (x: number, y: number, level: number, priority: number, onComplete: (img: ImageRequestResult, state: RequestTaskStatus) => void): IScheduleRequestTask | undefined {
        throw new Error('Method not implemented.');
    }

    /**
     * 验证瓦片的缩放等级是否在限制的缩放等级之内
     * @param level 
     * @returns 
     */
    public validateTileLevelIsInRange (level: number): boolean {
        return level >= this.minimumLevel && level <= this.maximumLevel;
    }

    /**
     * 检查瓦片可见性
     */
    public computeTileVisibility (tile: QuadtreeTile, frustum: Frustum): boolean {
        return IntersectUtils.intersectBoxFrustum(tile.aabb, frustum);
    }

    /**
     * 获取指定等级下的 最大几何误差
     * @param level 
     */
    public getLevelMaximumGeometricError (level: number): number {
        return this._levelZeroMaximumGeometricError! / (1 << level);
    }

}