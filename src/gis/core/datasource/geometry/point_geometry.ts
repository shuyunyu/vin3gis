import { Color } from "three";
import { Utils } from "../../../../core/utils/utils";
import { Cartographic } from "../../cartographic";
import { PointGeometryVisualizer } from "../visualizer/point_geometry_visualizer";
import { BasePointGeometry, BasePointGeometryOptions } from "./base_point_geometry";
import { GeometryType } from "./geometry";

export interface PointGeometryOptions extends BasePointGeometryOptions {
    //point的位置
    position?: Cartographic;
}

export class PointGeometry extends BasePointGeometry {

    private _position: Cartographic;

    public get position () {
        return this._position;
    }

    public set position (val: Cartographic) {
        this._position = val;
        this.update();
    }

    public constructor (options?: PointGeometryOptions) {
        options = options || {};
        super(GeometryType.POINT, options);
        this._position = Utils.defaultValue(options.position, Cartographic.ZERO.clone());
        this.visualizer = new PointGeometryVisualizer();
    }

    public clone () {
        return new PointGeometry({
            position: this.position.clone(),
            size: this.size,
            sizeAttenuation: this.sizeAttenuation,
            color: this.color.clone(),
            outline: this.outline,
            outlineSize: this.outlineSize,
            outlineColor: this.outlineColor
        });
    }

}