import { Frustum } from "three";
import { GenericEvent } from "../../../core/event/generic_event";
import { IScheduleRequestTask, RequestTaskStatus } from "../../../core/xhr/scheduler/@types/request";
import { ImageRequestResult } from "../../@types/core/gis";
import { Rectangle } from "../geometry/rectangle";
import { QuadtreeTile } from "../scene/quad_tree_tile";
import { ITilingScheme } from "../tilingscheme/tiling_scheme";

/**
 * 定义 图片瓦片提供者接口
 */
export interface IImageryTileProvider {
    //id
    id: string;
    //瓦片格式 .png | .jpg
    format: string;
    //是否可见
    visible: boolean;
    //是否是tms类型瓦片地图 default fasle
    tms: boolean;
    //最大缩放等级
    maximumLevel: number;
    //最小缩放等级
    minimumLevel: number;
    //瓦片宽度 像素
    tileWidth: number;
    //瓦片高度 像素
    tileHeight: number;
    //标识 是否准备完毕
    ready: boolean;
    //瓦片提供范围
    rectangle: Rectangle;
    //瓦片方案
    tilingScheme: ITilingScheme;
    //visibilityChangedEvent
    visibilityChanged: GenericEvent<IImageryTileProvider>;
    //验证瓦片的缩放等级是否在限制的缩放等级之内
    validateTileLevelIsInRange (level: number): boolean;
    //请求 图片资源
    requestTileImageAsset (x: number, y: number, level: number, priority: number, onComplete: (img: ImageRequestResult, state: RequestTaskStatus) => void): IScheduleRequestTask | undefined;
    //计算瓦片可见性
    computeTileVisibility (tile: QuadtreeTile, frustum: Frustum): boolean;
    //获取指定等级下的 最大几何误差
    getLevelMaximumGeometricError (level: number): number;
}