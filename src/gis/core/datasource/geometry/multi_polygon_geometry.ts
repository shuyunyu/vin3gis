import { Color } from "three";
import { Utils } from "../../../../core/utils/utils";
import { GeometryUpdateProperty } from "../../../decorator/decorator";
import { Cartographic } from "../../cartographic";
import { MultiPolygonGeometryViauzlizer } from "../visualizer/multi_polygon_geometry_visualizer";
import { BaseGeometry } from "./base_geometry";
import { GeometryType } from "./geometry";

export type MultiPolygonGeometryOptions = {
    positions?: Cartographic[][];
    holes?: Cartographic[][][];
    colors?: Color[];
    opacities?: number[];
    extrudedHeights?: number[];
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

    private _colors: Color[];

    public get colors () {
        return this._colors;
    }

    @GeometryUpdateProperty()
    public set colors (val: Color[]) {
        this._colors = val;
    }

    private _opacities: number[];

    public get opacities () {
        return this._opacities;
    }

    @GeometryUpdateProperty()
    public set opacities (val: number[]) {
        this._opacities = val;
    }

    private _extrudedHeights: number[];

    public get extrudedHeights () {
        return this._extrudedHeights;
    }

    @GeometryUpdateProperty()
    public set extrudedHeights (val: number[]) {
        this._extrudedHeights = val;
    }

    public constructor (options?: MultiPolygonGeometryOptions) {
        options = options || {};
        super({ type: GeometryType.MULTI_POLYGON });
        this._positions = Utils.defaultValue(options.positions, []);
        this._holes = Utils.defaultValue(options.holes, []);
        this._colors = Utils.defaultValue(options.colors, []);
        this._opacities = Utils.defaultValue(options.opacities, []);
        this._extrudedHeights = Utils.defaultValue(options.extrudedHeights, []);
        this.visualizer = new MultiPolygonGeometryViauzlizer();
    }

    public clone () {
        return new MultiPolygonGeometry({
            positions: this.positions.map(posArr => posArr.map(pos => pos.clone())),
            holes: this.holes.map(holes => holes.map(hole => hole.map(pos => pos.clone()))),
            colors: this.colors.map(color => color.clone()),
            opacities: this.opacities,
            extrudedHeights: this.extrudedHeights
        });
    }

}