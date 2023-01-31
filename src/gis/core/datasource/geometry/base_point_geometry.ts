import { Color } from "three";
import { Utils } from "../../../../core/utils/utils";
import { GeometryRerenderProperty } from "../../../decorator/decorator";
import { BaseGeometry } from "./base_geometry";
import { GeometryType } from "./geometry";

export type BasePointGeometryOptions = {
    //点的尺寸 default 1
    size?: number;
    //点的颜色
    color?: Color;
    //是否显示outline default false
    outline?: boolean;
    //outline的尺寸 defalt 0.1
    outlineSize?: number;
    //outline的颜色
    outlineColor?: Color;
}

/**
 * Point类型的geometry的基类
 */
export class BasePointGeometry extends BaseGeometry {

    private _size: number;

    public get size () {
        return this._size;
    }

    @GeometryRerenderProperty()
    public set size (val: number) {
        this._size = Math.max(0, val);
    }

    private _color: Color;

    public get color () {
        return this._color;
    }

    @GeometryRerenderProperty()
    public set color (val: Color) {
        this._color = val;
    }

    private _outline: boolean;

    public get outline () {
        return this._outline;
    }

    @GeometryRerenderProperty()
    public set outline (val: boolean) {
        this._outline = val;
    }

    private _outlineSize: number;

    public get outlineSize () {
        return this._outlineSize;
    }

    @GeometryRerenderProperty()
    public set outlineSize (val: number) {
        this._outlineSize = Math.max(0, val);
    }

    private _outlineColor: Color;

    public get outlineColor () {
        return this._outlineColor;
    }

    @GeometryRerenderProperty()
    public set outlineColor (val: Color) {
        this._outlineColor = val;
    }

    public constructor (type: GeometryType, options?: BasePointGeometryOptions) {
        options = options || {};
        super({ type: type });
        this._size = Utils.defaultValue(options.size, 1);
        this._color = Utils.defaultValue(options.color, new Color());
        this._outline = Utils.defaultValue(options.outline, false);
        this._outlineSize = Utils.defaultValue(options.outlineSize, 0);
        this._outlineColor = Utils.defaultValue(options.outlineColor, new Color());
    }
}