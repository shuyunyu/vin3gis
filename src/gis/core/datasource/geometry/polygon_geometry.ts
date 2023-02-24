import { Color } from "three";
import { math } from "../../../../core/math/math";
import { Utils } from "../../../../core/utils/utils";
import { GeometryUpdateProperty } from "../../../decorator/decorator";
import { Cartographic } from "../../cartographic";
import { PolygonGeometryVisualizer } from "../visualizer/polygon_geometry_visualizer";
import { BaseGeometry } from "./base_geometry";
import { GeometryType } from "./geometry";

export type PolygonGeometryOptions = {
    positions?: Cartographic[];//取lnglat构建平面,height将会被忽略
    color?: Color;
    opacity?: number;
    height?: number;//polygon位于空间中的高度
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

    private _height: number;

    public get height () {
        return this._height;
    }

    @GeometryUpdateProperty()
    public set height (val: number) {
        this._height = val;
    }

    public constructor (options?: PolygonGeometryOptions) {
        options = options || {};
        super({ type: GeometryType.POLYGON });
        this._positions = Utils.defaultValue(options.positions, []);
        this._color = Utils.defaultValue(options.color, new Color());
        this._opacity = math.clamp(Utils.defaultValue(options.opacity, 1), 0, 1);
        this._height = Utils.defaultValue(options.height, 0);
        this.visualizer = new PolygonGeometryVisualizer();
    }

    public clone () {
        return new PolygonGeometry({
            positions: this.positions.map(pos => pos.clone()),
            color: this.color.clone(),
            opacity: this.opacity,
            height: this.height
        });
    }

}