import { Object3D } from "three";
import { ITilingScheme } from "../../tilingscheme/tiling_scheme";
import { Entity } from "../entity";

/**
 * 几何渲染器接口
 */
export interface IGeometryVisualizer {
    //显示
    show: (entity: Entity, tilingScheme: ITilingScheme, root: Object3D) => void;
    //隐藏
    hide: (entity: Entity, root: Object3D) => void;
    //移除
    remove: (entity: Entity, root: Object3D) => void;
}