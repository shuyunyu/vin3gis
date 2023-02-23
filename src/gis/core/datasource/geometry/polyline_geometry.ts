import { Color } from "three";
import { Utils } from "../../../../core/utils/utils";
import { GeometryUpdateProperty } from "../../../decorator/decorator";
import { Cartographic } from "../../cartographic";
import { PolylineGeometryVisualizer } from "../visualizer/polyline_geometry_visualizer";
import { BaseGeometry } from "./base_geometry";
import { GeometryType } from "./geometry";

export type PolylineGeometryOptions = {
    positions?: Cartographic[];
    color?: Color;
    width?: number;
    useVertexColor?: boolean;//是否使用顶点颜色
    vertexColors?: Color[];//顶点颜色数组
    dashed?: boolean;//是否为虚线
    dashOffset?: number;//虚线偏移量
    dashScale?: number;//虚线缩放量
    dashSize?: number;//虚线尺寸
}

export class PolylineGeometry extends BaseGeometry {

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

    private _width: number;

    public get width () {
        return this._width;
    }

    @GeometryUpdateProperty()
    public set width (val: number) {
        this._width = val;
    }

    private _useVertexColor: boolean;

    public get useVertexColor () {
        return this._useVertexColor;
    }

    @GeometryUpdateProperty()
    public set useVertexColor (val: boolean) {
        this._useVertexColor = val;
    }

    private _vertexColors: Color[];

    public get vertexColors () {
        return this._vertexColors;
    }

    @GeometryUpdateProperty()
    public set vertexColors (val: Color[]) {
        this._vertexColors = val;
    }

    private _dashed: boolean;

    public get dashed () {
        return this._dashed;
    }

    @GeometryUpdateProperty()
    public set dashed (val: boolean) {
        this._dashed = val;
    }

    private _dashOffset: number;

    public get dashOffset () {
        return this._dashOffset;
    }

    @GeometryUpdateProperty()
    public set dashOffset (val: number) {
        this._dashOffset = val;
    }

    private _dashScale: number;

    public get dashScale () {
        return this._dashScale;
    }

    @GeometryUpdateProperty()
    public set dashScale (val: number) {
        this._dashScale = val;
    }

    private _dashSize: number;

    public get dashSize () {
        return this._dashSize;
    }

    @GeometryUpdateProperty()
    public set dashSize (val: number) {
        this._dashSize = val;
    }

    public constructor (options?: PolylineGeometryOptions) {
        options = options || {};
        super({ type: GeometryType.POLYLINE });
        this._positions = Utils.defaultValue(options.positions, []);
        this._color = Utils.defaultValue(options.color, new Color());
        this._width = Utils.defaultValue(options.width, 1);
        this._useVertexColor = Utils.defaultValue(options.useVertexColor, false);
        this._vertexColors = Utils.defaultValue(options.vertexColors, []);
        this._dashed = Utils.defaultValue(options.dashed, false);
        this._dashOffset = Utils.defaultValue(options.dashOffset, 0);
        this._dashScale = Utils.defaultValue(options.dashScale, 1);
        this._dashSize = Utils.defaultValue(options.dashSize, 1);
        this.visualizer = new PolylineGeometryVisualizer();
    }

    public clone () {
        return new PolylineGeometry({
            positions: this.positions.map(pos => pos.clone()),
            color: this.color.clone(),
            width: this.width,
            useVertexColor: this.useVertexColor,
            vertexColors: this.vertexColors.map(c => c.clone()),
            dashed: this.dashed,
            dashOffset: this.dashOffset,
            dashScale: this.dashScale,
            dashSize: this.dashSize
        });
    }

}