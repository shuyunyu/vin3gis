import { GenericEvent } from "../../../core/event/generic_event";
import { math } from "../../../core/math/math";
import { IntersectUtils } from "../../../core/utils/intersect_utils";
import { Utils } from "../../../core/utils/utils";
import { IScheduleRequestTask, RequestTaskStatus } from "../../../core/xhr/scheduler/@types/request";
import { ImageRequestResult } from "../../@types/core/gis";
import { Rectangle } from "../geometry/rectangle";
import { InternalConfig } from "../internal/internal_config";
import { FrameState } from "../scene/frame_state";
import { QuadtreeTile } from "../scene/quad_tree_tile";
import { ITilingScheme } from "../tilingscheme/tiling_scheme";
import { WebMercatorTilingScheme } from "../tilingscheme/web_mercator_tiling_scheme";
import { Transform } from "../transform/transform";
import { IImageryTileProvider } from "./imagery_tile_provider";
import { ImageryTileProviderOptions } from "./imagery_tile_provider_options";

/**
 * 基础图片切片 提供者
 */
export class BaseImageryTileProvider implements IImageryTileProvider {

    //id
    public readonly id;
    //是否是tms类型瓦片地图 default fasle
    public readonly tms;

    private _levelZeroMaximumGeometricError: number | undefined;

    //瓦片格式
    public readonly format: string = '.png';
    //是否可见
    private _visible: boolean;
    //不透明度
    private _opacity: number;
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
    //切片范围 可以限定切片的显示
    public readonly rectangle: Rectangle;
    //瓦片方案
    public readonly tilingScheme: ITilingScheme;

    public readonly visibilityChanged = new GenericEvent<IImageryTileProvider>;

    //标识是否在WebWorker中请求瓦片图片
    public requestTileImageInWorker: boolean;

    public get visible () {
        return this._visible;
    }

    public set visible (visible: boolean) {
        if (this._visible === visible) return;
        this._visible = visible;
        this.visibilityChanged.invoke(this);
    }

    public get opacity () {
        return this._opacity;
    }

    public set opacity (val: number) {
        this._opacity = math.clamp(val, 0, 1);
    }

    public constructor (imageryTileProviderOptions?: ImageryTileProviderOptions) {
        imageryTileProviderOptions = imageryTileProviderOptions || {};
        this.id = Utils.createGuid();
        this.tms = Utils.defaultValue(imageryTileProviderOptions.tms, false);
        this._visible = Utils.defaultValue(imageryTileProviderOptions.visible, true);
        this._opacity = Utils.defaultValue(imageryTileProviderOptions.opacity, 1.0);
        this.format = Utils.defaultValue(imageryTileProviderOptions.format, '.png');
        this.minimumLevel = Utils.defaultValue(imageryTileProviderOptions.minimumLevel, 3);
        this.maximumLevel = Utils.defaultValue(imageryTileProviderOptions.maximumLevel, 21);
        this.tileWidth = Utils.defaultValue(imageryTileProviderOptions.tileWidth, 256);
        this.tileHeight = Utils.defaultValue(imageryTileProviderOptions.tileHeight, 256);
        this.tilingScheme = Utils.defaultValue(imageryTileProviderOptions.tilingScheme, new WebMercatorTilingScheme());
        this.rectangle = Utils.defaultValue(imageryTileProviderOptions.rectangle, this.tilingScheme.projection.rectangle);
        this.requestTileImageInWorker = Utils.defaultValue(imageryTileProviderOptions.requestTileImageInWorker, InternalConfig.REQUEST_RASTER_TILE_IN_WORKER);
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
     * 验证瓦片的范围是否在限制之内
     * @param tile 
     */
    public validateTileRectangleInRange (tile: QuadtreeTile): boolean {
        return this.rectangle.contains(tile.rectangle);
    }

    /**
     * 检查瓦片可见性
     */
    public computeTileVisibility (tile: QuadtreeTile, frameState: FrameState): boolean {
        if (frameState.fog.enable) {
            const fogFacotr = math.fog(Transform.carCoordToWorldCoord(tile.distanceToCamera), frameState.fog.density);
            if (fogFacotr >= 1.0) {
                return false;
            }
        }
        return IntersectUtils.intersectBoxFrustum(tile.aabb, frameState.frustum);
    }

    /**
     * 获取指定等级下的 最大几何误差
     * @param level 
     */
    public getLevelMaximumGeometricError (level: number): number {
        return this._levelZeroMaximumGeometricError! / (1 << level);
    }

}