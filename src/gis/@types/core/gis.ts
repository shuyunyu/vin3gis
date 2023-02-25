import { Color } from "three";
import { BaseBillboardGeometry } from "../../core/datasource/geometry/base_billboard_geometry";
import { BaseGeometry } from "../../core/datasource/geometry/base_geometry";
import { LabelGeometry } from "../../core/datasource/geometry/label_geometry";
import { MultiPointGeometry } from "../../core/datasource/geometry/multi_point_geometry";
import { MultiPolygonGeometry } from "../../core/datasource/geometry/multi_polygon_geometry";
import { MultiPolylineGeometry } from "../../core/datasource/geometry/multi_polyline_geometry";
import { PointCloudGeometry } from "../../core/datasource/geometry/point_cloud_geometry";
import { PointGeometry } from "../../core/datasource/geometry/point_geometry";
import { PolygonGeometry } from "../../core/datasource/geometry/polygon_geometry";
import { PolylineGeometry } from "../../core/datasource/geometry/polyline_geometry";
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


export type MapViewerOptions = {
    //没threejs单位距离代表实际的多少米
    UNIT_PER_METERS?: number;
    //渲染fps 默认30
    RENDER_RPS?: number;
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
    //背景
    background?: {
        //不透明度
        alpha?: number;
        //颜色
        color?: Color;
    }
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

//实体类型
export enum GeometryType {
    POINT = "point"
}

//entity 构造参数
export type EntityOptions = {
    //可见性 default true
    visible?: boolean;
    point?: PointGeometry;
    multiPoint?: MultiPointGeometry;
    pointCloud?: PointCloudGeometry;
    billboard?: BaseBillboardGeometry;
    label?: LabelGeometry;
    polyline?: PolylineGeometry;
    multiPolyline?: MultiPolylineGeometry;
    polygon?: PolygonGeometry;
    multiPolygon?: MultiPolygonGeometry;
}

//entity geometry 属性变更属性
export type GeometryPropertyChangeData = {//驱动的属性
    name: string;//属性名称
    preVal: any;//前一个值
    nextVal: any;//后一个值
}

//entity geometry 渲染的驱动者
export type EntityGeometryRenderDriver = {
    geometry: BaseGeometry;//驱动的目标geometry
    property?: GeometryPropertyChangeData;
}