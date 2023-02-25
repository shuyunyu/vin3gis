import { Utils } from "../../../../core/utils/utils";
import { GeometryUpdateProperty } from "../../../decorator/decorator";
import { Cartographic } from "../../cartographic";
import { MultiPolygonGeometryViauzlizer } from "../visualizer/multi_polygon_geometry_visualizer";
import { BaseGeometry } from "./base_geometry";
import { GeometryType } from "./geometry";

export type MultiPolygonGeometryOptions = {
    positions?: Cartographic[][];
    holes?: Cartographic[][][];
}

export class MultiPolygonGeometry extends BaseGeometry {

    private _positions: Cartographic[][];

    public get positions () {
        return this._positions;
    }

    @GeometryUpdateProperty()
    public set positions (val: Cartographic[][]) {
        this._positions = val;
    }

    private _holes: Cartographic[][][];

    public get holes () {
        return this._holes;
    }

    @GeometryUpdateProperty()
    public set holes (val: Cartographic[][][]) {
        this._holes = val;
    }

    public constructor (options?: MultiPolygonGeometryOptions) {
        options = options || {};
        super({ type: GeometryType.MULTI_POLYGON });
        this._positions = Utils.defaultValue(options.positions, []);
        this._holes = Utils.defaultValue(options.holes, []);
        this.visualizer = new MultiPolygonGeometryViauzlizer();
    }

    public clone () {
        return new MultiPolygonGeometry({
            positions: this.positions.map(posArr => posArr.map(pos => pos.clone())),
            holes: this.holes.map(holes => holes.map(hole => hole.map(pos => pos.clone())))
        });
    }

}