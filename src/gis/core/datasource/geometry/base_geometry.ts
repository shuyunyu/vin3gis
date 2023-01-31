import { Entity } from "../entity";
import { IGeometryVisualizer } from "../visualizer/geometry_visualizer";
import { GeometryType, IGeometry } from "./geometry";

type GeometryOptions = {
    type: GeometryType;
}

export class BaseGeometry implements IGeometry {

    public readonly type: GeometryType;

    public visualizer: IGeometryVisualizer;

    private _entity?: Entity;

    public get entity () {
        return this._entity;
    }

    public set entity (val: Entity | undefined) {
        this._entity = val;
    }

    public constructor (options: GeometryOptions) {
        this.type = options.type;
    }

    public clone () {
        return null;
    }

    /**
     * 重新渲染该Geometry
     */
    public render () {
        this.entity?.rendererGeometry(this);
    }

    /**
     * 通过属性渲染该Geomtry
     * @param propKey 
     * @param preVal 
     * @param nextVal 
     */
    public rerenderByProp (propKey: string, preVal: any, nextVal: any) {
        this.render();
    }

    /**
     * 通过属性更新该Geometry
     * @param propKey 
     * @param preVal 
     * @param nextVal 
     */
    public updateByProp (propKey: string, preVal: any, nextVal: any) {
        this.entity?.updateGeometry(this);
    }

}