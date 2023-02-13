import { Color } from "three";
import { Utils } from "../../../../core/utils/utils";
import { GeometryRerenderProperty, GeometryUpdateProperty } from "../../../decorator/decorator";
import { Cartographic } from "../../cartographic";
import { PolylineGeometryVisualizer } from "../visualizer/polyline_geometry_visualizer";
import { BaseGeometry } from "./base_geometry";
import { GeometryType } from "./geometry";

export type PolylineGeometryOptions = {
    positions?: Cartographic[];
    color?: Color;
    width?: number;
}

export class PolylineGeometry extends BaseGeometry {

    private _positions: Cartographic[];

    public get positions () {
        return this._positions;
    }

    @GeometryRerenderProperty()
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

    private _width: number;

    public get width () {
        return this._width;
    }

    @GeometryUpdateProperty()
    public set width (val: number) {
        this._width = val;
    }

    public constructor (options?: PolylineGeometryOptions) {
        options = options || {};
        super({ type: GeometryType.POLYLINE });
        this._positions = Utils.defaultValue(options.positions, []);
        this._color = Utils.defaultValue(options.color, new Color());
        this._width = Utils.defaultValue(options.width, 1);
        this.visualizer = new PolylineGeometryVisualizer();
    }

    public clone () {
        return new PolylineGeometry({
            positions: this.positions.map(pos => pos.clone())
        });
    }

}