import { Color } from "three";
import { Utils } from "../../../../core/utils/utils";
import { GeometryRerenderProperty, GeometryUpdateProperty } from "../../../decorator/decorator";
import { Cartographic } from "../../cartographic"
import { MultiPolylineGeometryVisualizer } from "../visualizer/multi_polyline_geometry_visualizer";
import { BaseGeometry } from "./base_geometry";
import { GeometryType } from "./geometry";

export type MultiPolylineGeometryOptions = {
    positions?: Cartographic[][];
    colors?: Color[];
}

export class MultiPolylineGeometry extends BaseGeometry {

    private _positions: Cartographic[][];

    public get positions () {
        return this._positions;
    }

    @GeometryRerenderProperty()
    public set positions (val: Cartographic[][]) {
        this._positions = val;
    }

    private _colors: Color[];


    public get colors () {
        return this._colors;
    }

    @GeometryUpdateProperty()
    public set colors (val: Color[]) {
        this._colors = val;
    }

    public constructor (options?: MultiPolylineGeometryOptions) {
        options = options || {};
        super({ type: GeometryType.MULTI_POLYLINE });
        this._positions = Utils.defaultValue(options.positions, []);
        this._colors = Utils.defaultValue(options.colors, []);
        this.visualizer = new MultiPolylineGeometryVisualizer();
    }

    public clone () {
        return new MultiPolylineGeometry({
            positions: this.positions.map(pos => pos.map(p => p.clone())),
            colors: this.colors.map(color => color.clone())
        });
    }

}