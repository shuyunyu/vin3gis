import { Event, Object3D } from "three";
import { ITilingScheme } from "../../tilingscheme/tiling_scheme";
import { Entity } from "../entity";
import { IGeometryVisualizer } from "./geometry_visualizer";

export class BaseGeometryVisualizer implements IGeometryVisualizer {

    private _geometryObject?: Object3D;

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
        }
    }

}