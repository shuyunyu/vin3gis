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

    private _size: number;

    public get size () {
        return this._size;
    }

    private _sizeAttenuation: boolean;

    public get sizeAttenuation () {
        return this._sizeAttenuation;
    }

    private _color: Color;

    public get color () {
        return this._color;
    }

    private _outline: boolean;

    public get outline () {
        return this._outline;
    }

    private _outlineSize: number;

    public get outlineSize () {
        return this._outlineSize;
    }

    private _outlineColor: Color;

    public get outlineColor () {
        return this._outlineColor;
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