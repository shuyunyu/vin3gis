import { Color } from "three";
import { Utils } from "../../../../core/utils/utils";
import { GeometryRerenderProperty } from "../../../decorator/decorator";
import { Cartographic } from "../../cartographic";
import { PointGeometryVisualizer } from "../visualizer/point_geometry_visualizer";
import { BillboardSingleRenderData } from "./base_billboard_geometry";
import { BasePointGeometry, BasePointGeometryOptions } from "./base_point_geometry";
import { GeometryType } from "./geometry";

export interface PointGeometryOptions extends BasePointGeometryOptions {
    //point的位置
    position?: Cartographic;
}

/**
 * 单点几何
 */
export class PointGeometry extends BasePointGeometry {

    private _position: Cartographic;

    public get position () {
        return this._position;
    }

    @GeometryRerenderProperty()
    public set position (val: Cartographic) {
        this._position = val;
    }

    public constructor (options?: PointGeometryOptions) {
        options = options || {};
        super(GeometryType.POINT, options);
        this._position = Utils.defaultValue(options.position, Cartographic.ZERO.clone());
        this.visualizer = new PointGeometryVisualizer();
    }

    public getRenderData () {
        const renderData: BillboardSingleRenderData = {
            position: this.position,
            rotation: 0,
            scale: 1
        }
        return [renderData];
    }

    public clone () {
        return new PointGeometry({
            position: this.position.clone(),
            size: this.size,
            color: this.color.clone(),
            outline: this.outline,
            outlineSize: this.outlineSize,
            outlineColor: this.outlineColor
        });
    }

}