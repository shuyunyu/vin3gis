import { Event, Object3D } from "three";
import { SystemDefines } from "../../../../@types/core/system/system";
import { math } from "../../../../core/math/math";
import { FrameRenderer } from "../../../../core/renderer/frame_renderer";
import { disposeSystem } from "../../../../core/system/dispose_system";
import { GEOMETRY_RENDER_ORDER } from "../../misc/render_order";
import { ITilingScheme } from "../../tilingscheme/tiling_scheme";
import { Entity } from "../entity";
import { BaseGeometry } from "../geometry/base_geometry";
import { IGeometryVisualizer } from "./geometry_visualizer";

let geometryRenderOrder = GEOMETRY_RENDER_ORDER;

export class BaseGeometryVisualizer implements IGeometryVisualizer {

    protected _geometryObject?: Object3D;

    /**
     * 需要释放资源的对象列表
     */
    protected _disposableObjects: SystemDefines.Disposable[] = [];

    /**
     * 渲染顺序
     */
    private _renderOrder: number;

    public constructor () {
        geometryRenderOrder += math.EPSILON7;
        this._renderOrder = geometryRenderOrder;
    }

    /**
     * 获取当前visualizer需要操作的Entity中的Geometry
     * - 子类需要重写此方法
     * @param entity 
     */
    protected getEntityGeometry (entity: Entity): BaseGeometry {
        return null;
    }

    /**
     * 创建集合体对应的Object3D
     * - 子类需要重写此方法
     * @param entity 
     * @param tilingScheme 
     * @returns 
     */
    protected createGeometryObject (entity: Entity, tilingScheme: ITilingScheme, renderer: FrameRenderer): Object3D {
        return null;
    }

    /**
     * 当renderer触发resize时 执行的代码
     * @param entity
     * @param renderer 
     */
    public onRendererSize (entity: Entity, renderer: FrameRenderer) {

    }

    public show (entity: Entity, tilingScheme: ITilingScheme, root: Object3D, renderer: FrameRenderer) {
        if (!this._geometryObject) {
            this._geometryObject = this.createGeometryObject(entity, tilingScheme, renderer);
            if (this._geometryObject) {
                //设置渲染顺序
                this._geometryObject.renderOrder = this._renderOrder;
                root.add(this._geometryObject);
            }
        } else {
            this._geometryObject.visible = true;
        }
    }

    rerender (entity: Entity, tilingScheme: ITilingScheme, root: Object3D<Event>, renderer: FrameRenderer) {
        this.remove(entity, root);
        this.show(entity, tilingScheme, root, renderer);
    }

    public update (entity: Entity, tilingScheme: ITilingScheme, root: Object3D, renderer: FrameRenderer) {
        this.remove(entity, root);
        this.show(entity, tilingScheme, root, renderer);
    }

    public hide (entity: Entity, root: Object3D) {
        if (this._geometryObject) {
            this._geometryObject.visible = false;
        }
    }

    public remove (entity: Entity, root: Object3D) {
        if (this._geometryObject) {
            root.remove(this._geometryObject);
            this._geometryObject = null;
            //dispose obj
            this._disposableObjects.forEach(obj => disposeSystem.disposeObj(obj));
            this._disposableObjects.length = 0;
        }
    }

}