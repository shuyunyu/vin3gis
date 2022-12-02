import { FrameRenderer } from "../../../core/renderer/frame_renderer";
import { ViewPort } from "../../core/misc/view_port";
import { IImageryTileProvider } from "../../core/provider/imagery_tile_provider";

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
    WGS84,
    GCJ02,
    BD09
}

export type MapViewerOptions = {
    //坐标方案
    coordinateOType?: CoordinateType;
    //渲染对象
    renderer: FrameRenderer;
    //瓦片提供者
    imageryTileProivder: IImageryTileProvider;
    //是否允许双击放大地图
    dblClickZoom?: boolean;
    //是否允许平移地图
    enablePan?: boolean;
    //是否允许缩放
    enableZoom?: boolean;
    //是否允许倾斜
    enablePitch?: boolean;
    //是否允许旋转
    enableRotate?: boolean;
    //初始视角
    homeViewPort: ViewPort;
    //瓦片缓存数量 默认100
    tileCacheSize?: number;
}

export namespace MeshDefines {

    export type TileMeshAttribute = {
        vertices: Float32Array,
        indices: number[],
        uvs: Float32Array,
        normals: Float32Array
    }

}