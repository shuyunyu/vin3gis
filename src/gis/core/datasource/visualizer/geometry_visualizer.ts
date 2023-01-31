import { Object3D } from "three";
import { FrameRenderer } from "../../../../core/renderer/frame_renderer";
import { ITilingScheme } from "../../tilingscheme/tiling_scheme";
import { Entity } from "../entity";

/**
 * 几何渲染器接口
 */
export interface IGeometryVisualizer {
    //显示
    show: (entity: Entity, tilingScheme: ITilingScheme, root: Object3D, renderer: FrameRenderer) => void;
    //隐藏
    hide: (entity: Entity, root: Object3D) => void;
    //更新 都某些属性改变时  需要更新渲染
    update: (entity: Entity, tilingScheme: ITilingScheme, root: Object3D, renderer: FrameRenderer) => void;
    //移除
    remove: (entity: Entity, root: Object3D) => void;
    //当renderer触发resize时 执行的代码
    onRendererSize: (entity: Entity, renderer: FrameRenderer) => void;
}