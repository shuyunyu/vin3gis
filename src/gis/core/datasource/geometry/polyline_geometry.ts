import { Utils } from "../../../../core/utils/utils";
import { GeometryRerenderProperty } from "../../../decorator/decorator";
import { Cartographic } from "../../cartographic";
import { PolylineGeometryVisualizer } from "../visualizer/polyline_geometry_visualizer";
import { BaseGeometry } from "./base_geometry";
import { GeometryType } from "./geometry";

export type PolylineGeometryOptions = {
    positions?: Cartographic[];
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

    public constructor (options?: PolylineGeometryOptions) {
        options = options || {};
        super({ type: GeometryType.POLYLINE });
        this._positions = Utils.defaultValue(options.positions, []);
        this.visualizer = new PolylineGeometryVisualizer();
    }

    public clone () {
        return new PolylineGeometry({
            positions: this.positions.map(pos => pos.clone())
        });
    }

}