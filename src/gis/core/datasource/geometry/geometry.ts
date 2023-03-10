import { Entity } from "../entity";
import { IGeometryVisualizer } from "../visualizer/geometry_visualizer";

/**
 * 定义几何类型
 */
export enum GeometryType {
    POINT = "point",
    MULTI_POINT = "multi-point",
    POINT_CLOUD = "point-cloud",
    POLYLINE = "polyline",
    POLYGON = "polygon",
    CIRCLE = "circle",
    LABEL = "label",
    BILLBOARD = "billboard",
    MULTI_BILLBOARD = "multi-billboard",
    MODEL = "model"
}

/**
 * 定义几何接口
 */
export interface IGeometry {
    //几何类型
    type: GeometryType;
    //渲染器
    visualizer: IGeometryVisualizer;
    //所属的Entity
    entity?: Entity;
    //copy func
    clone: () => IGeometry;
}