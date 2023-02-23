import { Color } from "three";
import { Utils } from "../../../../core/utils/utils";
import { GeometryUpdateProperty } from "../../../decorator/decorator";
import { Cartographic } from "../../cartographic"
import { MultiPolylineGeometryVisualizer } from "../visualizer/multi_polyline_geometry_visualizer";
import { BaseGeometry } from "./base_geometry";
import { GeometryType } from "./geometry";

export type MultiPolylineGeometryOptions = {
    positions?: Cartographic[][];
    colors?: Color[];
    widths?: number[];
    useVertexColors?: boolean[];//是否使用顶点颜色
    vertexColors?: Color[][];
    dasheds?: boolean[];//是否是虚线
    dashOffsets?: number[];
    dashScales?: number[];
    dashSizes?: number[];
}

export class MultiPolylineGeometry extends BaseGeometry {

    private _positions: Cartographic[][];

    public get positions () {
        return this._positions;
    }

    @GeometryUpdateProperty()
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

    private _widths: number[];

    public get widths () {
        return this._widths;
    }

    @GeometryUpdateProperty()
    public set widths (val: number[]) {
        this._widths = val;
    }

    private _useVertexColor: boolean[];

    public get useVertexColor () {
        return this._useVertexColor;
    }

    @GeometryUpdateProperty()
    public set useVertexColor (val: boolean[]) {
        this._useVertexColor = val;
    }

    private _vertexColors: Color[][];

    public get vertexColors () {
        return this._vertexColors;
    }

    @GeometryUpdateProperty()
    public set vertexColors (val: Color[][]) {
        this._vertexColors = val;
    }

    private _dasheds: boolean[];

    public get dasheds () {
        return this._dasheds;
    }

    @GeometryUpdateProperty()
    public set dasheds (val: boolean[]) {
        this._dasheds = val;
    }

    private _dashOffsets: number[];

    public get dashOffsets () {
        return this._dashOffsets;
    }

    @GeometryUpdateProperty()
    public set dashOffsets (val: number[]) {
        this._dashOffsets = val;
    }

    private _dashScales: number[];

    public get dashScales () {
        return this._dashScales;
    }

    @GeometryUpdateProperty()
    public set dashScales (val: number[]) {
        this._dashScales = val;
    }

    private _dashSizes: number[];

    public get dashSizes () {
        return this._dashSizes;
    }

    @GeometryUpdateProperty()
    public set dashSizes (val: number[]) {
        this._dashSizes = val;
    }

    public constructor (options?: MultiPolylineGeometryOptions) {
        options = options || {};
        super({ type: GeometryType.MULTI_POLYLINE });
        this._positions = Utils.defaultValue(options.positions, []);
        this._colors = Utils.defaultValue(options.colors, []);
        this._widths = Utils.defaultValue(options.widths, []);
        this._useVertexColor = Utils.defaultValue(options.useVertexColors, []);
        this._vertexColors = Utils.defaultValue(options.vertexColors, []);
        this._dasheds = Utils.defaultValue(options.dasheds, []);
        this._dashOffsets = Utils.defaultValue(options.dashOffsets, []);
        this._dashScales = Utils.defaultValue(options.dashScales, []);
        this._dashSizes = Utils.defaultValue(options.dashSizes, []);
        this.visualizer = new MultiPolylineGeometryVisualizer();
    }

    public clone () {
        return new MultiPolylineGeometry({
            positions: this.positions.map(pos => pos.map(p => p.clone())),
            colors: this.colors.map(color => color.clone()),
            widths: [].concat(this._widths),
            useVertexColors: [].concat(this._useVertexColor),
            vertexColors: this.vertexColors.map(vcs => vcs.map(c => c.clone())),
            dasheds: this.dasheds,
            dashOffsets: this.dashOffsets,
            dashScales: this.dashScales,
            dashSizes: this.dashSizes
        });
    }

}