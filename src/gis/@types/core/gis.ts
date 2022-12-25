import { ViewPort } from "../../core/misc/view_port";
import { IImageryTileProvider } from "../../core/provider/imagery_tile_provider";
import { Imagery } from "../../core/scene/imagery";

export interface ICartesian2Like {
    x: number;
    y: number;
}

export interface ICartesian3Like extends ICartesian2Like {
    z: number;
}

export interface ICartesian4Like extends ICartesian3Like {
    w: number;
}

export interface IQuatLike {
    x: number;
    y: number;
    z: number;
    w: number;
}

//四叉树瓦片 加载状态
export enum QuadtreeTileLoadState {
    START = 0,
    LOADING,
    DONE,
    FAILED
}

/**
 * 坐标类型
 */
export enum CoordinateType {
    WGS84 = "wgs84",
    GCJ02 = "gcj02",
    BD09 = "bd09"
}

export type MapViewerOptions = {
    //没threejs单位距离代表实际的多少米
    UNIT_PER_METERS?: number;
    //渲染fps 默认30
    RENDER_RPS?: number;
    //坐标方案
    coordinateOType?: CoordinateType;
    //地图渲染的html元素或者元素的id
    target: string | HTMLElement;
    //瓦片提供者
    imageryTileProivder: IImageryTileProvider;
    //是否允许平移地图
    enablePan?: boolean;
    panSpeed?: number;
    //是否允许缩放
    enableZoom?: boolean;
    zoomSpeed?: number;
    //是否允许旋转
    enableRotate?: boolean;
    rotateSpeed?: number;
    //是否允许惯性
    enableDamping?: boolean;
    //惯性系数
    dampingFactor?: number;
    //视角能推进的最小距离
    minDistance?: number;
    //视角能推进的最大距离
    maxDistance?: number;
    //初始视角
    homeViewPort: ViewPort;
    //瓦片缓存数量 默认100
    tileCacheSize?: number;
    //相机的fov
    fov?: number;
}

export namespace MeshDefines {

    export type TileMeshAttribute = {
        vertices: Float32Array,
        indices: number[],
        baseUvs?: Float32Array,
        overlayUvs?: Float32Array,
        normals: Float32Array
    }

}

//图片请求结果
export type ImageRequestResult = HTMLImageElement | ImageBitmap | Blob;


//贴图瓦片渲染参数
export type ImageryTileRenderParam = {
    imagery: Imagery;
    opacity: number;
}