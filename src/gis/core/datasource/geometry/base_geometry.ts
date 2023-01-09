import { Entity } from "../entity";
import { IGeometryVisualizer } from "../visualizer/geometry_visualizer";
import { GeometryType, IGeometry } from "./geometry";

type GeometryOptions = {
    type: GeometryType;
}

export class BaseGeometry implements IGeometry {

    public readonly type: GeometryType;

    public readonly visualizer: IGeometryVisualizer;

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

}