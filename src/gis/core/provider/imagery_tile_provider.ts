import { GenericEvent } from "../../../core/event/generic_event";
import { IScheduleRequestTask, RequestTaskStatus } from "../../../core/xhr/scheduler/@types/request";
import { TileNodeCache } from "../cache/tile_node_cache";
import { Rectangle } from "../geometry/rectangle";
import { QuadtreeTile } from "../scene/quad_tree_tile";
import { QuadtreeTileQueue } from "../scene/quad_tree_tile_queue";
import { TileNodeContainer } from "../scene/tile_node_container";
import { ITilingScheme } from "../tilingscheme/tiling_scheme";

/**
 * 定义 图片瓦片提供者接口
 */
export interface IImageryTileProvider {
    //该瓦片提供者使用的瓦片节点容器
    tileNodeContainer: TileNodeContainer;
    //id
    id: string;
    //瓦片格式 .png | .jpg
    format: string;
    //是否以base64的方式加载瓦片
    isBase64: boolean;
    //是否可见
    visible: boolean;
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
    //装备完成的Promise
    readyPromise: Promise<boolean>;
    //瓦片提供范围
    rectangle: Rectangle;
    //瓦片方案
    tilingScheme: ITilingScheme;
    //visibilityChangedEvent
    visibilityChanged: GenericEvent<IImageryTileProvider>;
    //保存上一帧渲染瓦片贴图的队列
    tileImageryRenderedQueue: QuadtreeTileQueue;
    //瓦片节点缓存
    tileNodeCache: TileNodeCache;
    //验证瓦片的缩放等级是否在限制的缩放等级之内
    validateTileLevelIsInRange (level: number): boolean;
    //请求 图片资源
    requestTileImageAsset (x: number, y: number, level: number, priority: number, onComplete: (img: HTMLImageElement, state: RequestTaskStatus) => void): IScheduleRequestTask | undefined;
    //计算瓦片可见性
    computeTileVisibility (tile: QuadtreeTile): boolean;
    //获取指定等级下的 最大几何误差
    getLevelMaximumGeometricError (level: number): number;
    //将瓦片渲染至creator的节点
    // renderTileToNode (parent: Node): any;
}