import { Color } from "three";
import { math } from "../../../../core/math/math";
import { Utils } from "../../../../core/utils/utils";
import { GeometryUpdateProperty } from "../../../decorator/decorator";
import { Cartographic } from "../../cartographic";
import { PolygonGeometryVisualizer } from "../visualizer/polygon_geometry_visualizer";
import { BaseGeometry } from "./base_geometry";
import { GeometryType } from "./geometry";

export type PolygonGeometryOptions = {
    positions?: Cartographic[];
    color?: Color;
    opacity?: number;
}

export class PolygonGeometry extends BaseGeometry {

    private _positions: Cartographic[];

    public get positions () {
        return this._positions;
    }

    @GeometryUpdateProperty()
    public set positions (val: Cartographic[]) {
        this._positions = val;
    }

    private _color: Color;

    public get color () {
        return this._color;
    }

    @GeometryUpdateProperty()
    public set color (val: Color) {
        this._color = val;
    }

    private _opacity: number;

    public get opacity () {
        return this._opacity;
    }

    @GeometryUpdateProperty()
    public set opacity (val: number) {
        this._opacity = math.clamp(val, 0, 1);
    }

    public constructor (options?: PolygonGeometryOptions) {
        options = options || {};
        super({ type: GeometryType.POLYGON });
        this._positions = Utils.defaultValue(options.positions, []);
        this._color = Utils.defaultValue(options.color, new Color());
        this._opacity = math.clamp(Utils.defaultValue(options.opacity, 1), 0, 1);
        this.visualizer = new PolygonGeometryVisualizer();
    }

    public clone () {
        return new PolygonGeometry({
            positions: this.positions.map(pos => pos.clone()),
            color: this.color.clone(),
            opacity: this.opacity
        });
    }

}