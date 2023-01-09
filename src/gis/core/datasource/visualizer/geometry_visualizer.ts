import { ITilingScheme } from "../../tilingscheme/tiling_scheme";
import { Entity } from "../entity";

/**
 * 几何渲染器接口
 */
export interface IGeometryVisualizer {
    //显示
    show: (entity: Entity, tilingScheme: ITilingScheme) => void;
    //隐藏
    hide: (entity: Entity) => void;
    //移除
    remove: (entity: Entity) => void;
}