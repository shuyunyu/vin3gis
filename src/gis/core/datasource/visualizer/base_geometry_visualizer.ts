import { Object3D } from "three";
import { SystemDefines } from "../../../../@types/core/system/system";
import { disposeSystem } from "../../../../core/system/dispose_system";
import { ITilingScheme } from "../../tilingscheme/tiling_scheme";
import { Entity } from "../entity";
import { BaseGeometry } from "../geometry/base_geometry";
import { IGeometryVisualizer } from "./geometry_visualizer";

export class BaseGeometryVisualizer implements IGeometryVisualizer {

    protected _geometryObject?: Object3D;

    protected _disposableObjects: SystemDefines.Disposable[] = [];

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
    protected createGeometryObject (entity: Entity, tilingScheme: ITilingScheme): Object3D {
        return null;
    }

    public show (entity: Entity, tilingScheme: ITilingScheme, root: Object3D) {
        if (!this._geometryObject) {
            this._geometryObject = this.createGeometryObject(entity, tilingScheme);
            root.add(this._geometryObject);
        } else {
            this._geometryObject.visible = true;
        }
    }

    public update (entity: Entity, tilingScheme: ITilingScheme, root: Object3D) {
        this.remove(entity, root);
        this.show(entity, tilingScheme, root);
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