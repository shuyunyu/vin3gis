import { Color } from "three";
import { Utils } from "../../../../core/utils/utils";
import { Cartographic } from "../../cartographic";
import { PointGeometryVisualizer } from "../visualizer/point_geometry_visualizer";
import { BaseGeometry } from "./base_geometry";
import { GeometryType } from "./geometry";

export type PointGeometryOptions = {
    position?: Cartographic;
    //点的尺寸 default 1
    size?: number;
    //尺寸是否随相机的改变而改变 default false
    sizeAttenuation?: boolean;
    //点的颜色
    color?: Color;
    //是否显示outline default false
    outline?: boolean;
    //outline的尺寸 defalt 0.1
    outlineSize?: number;
    //outline的颜色
    outlineColor?: Color;
}

export class PointGeometry extends BaseGeometry {

    private _position: Cartographic;

    public get position () {
        return this._position;
    }

    public set position (val: Cartographic) {
        this._position = val;
        this.update();
    }

    private _size: number;

    public get size () {
        return this._size;
    }

    public set size (val: number) {
        this._size = Math.max(0, val);
        this.update();
    }

    private _sizeAttenuation: boolean;

    public get sizeAttenuation () {
        return this._sizeAttenuation;
    }

    public set sizeAttenuation (val: boolean) {
        this._sizeAttenuation = val;
        this.update();
    }

    private _color: Color;

    public get color () {
        return this._color;
    }

    public set color (val: Color) {
        this._color = val;
        this.update();
    }

    private _outline: boolean;

    public get outline () {
        return this._outline;
    }

    public set outline (val: boolean) {
        this._outline = val;
        this.update();
    }

    private _outlineSize: number;

    public get outlineSize () {
        return this._outlineSize;
    }

    public set outlineSize (val: number) {
        this._outlineSize = val;
        this.update();
    }

    private _outlineColor: Color;

    public get outlineColor () {
        return this._outlineColor;
    }

    public set outlineColor (val: Color) {
        this._outlineColor = val;
        this.update();
    }

    public constructor (options?: PointGeometryOptions) {
        options = options || {};
        super({ type: GeometryType.POINT });
        this._position = Utils.defaultValue(options.position, new Cartographic(0, 0, 0));
        this._size = Utils.defaultValue(options.size, 1);
        this._sizeAttenuation = Utils.defaultValue(options.sizeAttenuation, false);
        this._color = Utils.defaultValue(options.color, new Color());
        this._outline = Utils.defaultValue(options.outline, false);
        this._outlineSize = Utils.defaultValue(options.outlineSize, 0.1);
        this._outlineColor = Utils.defaultValue(options.outlineColor, new Color());
        this.visualizer = new PointGeometryVisualizer();
    }

    public clone () {
        return new PointGeometry({
            position: this._position,
            size: this._size,
            sizeAttenuation: this._sizeAttenuation,
            color: this._color.clone(),
            outline: this._outline,
            outlineSize: this._outlineSize,
            outlineColor: this._outlineColor
        });
    }

}