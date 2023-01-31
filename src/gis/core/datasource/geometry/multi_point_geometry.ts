import { Utils } from "../../../../core/utils/utils";
import { GeometryRerenderProperty } from "../../../decorator/decorator";
import { Cartographic } from "../../cartographic";
import { MultiPointGeometryVisualizer } from "../visualizer/multi_point_geometry_visualizer";
import { BasePointGeometry, BasePointGeometryOptions } from "./base_point_geometry";
import { GeometryType } from "./geometry";

export type MultiPointGeometryOptions = {
    //point的位置
    positions?: Cartographic[];
} & BasePointGeometryOptions

/**
 * 多点几何
 */
export class MultiPointGeometry extends BasePointGeometry {

    private _positions?: Cartographic[];

    public get positions () {
        return this._positions;
    }

    @GeometryRerenderProperty()
    public set positions (val: Cartographic[] | null) {
        this._positions = val || [];
    }

    public constructor (options?: MultiPointGeometryOptions) {
        options = options || {};
        super(GeometryType.MULTI_POINT, options);
        this._positions = Utils.defaultValue(options.positions, []);
        this.visualizer = new MultiPointGeometryVisualizer();
    }

    public clone () {
        return new MultiPointGeometry({
            positions: this.positions.map(pos => pos.clone()),
            size: this.size,
            color: this.color.clone(),
            outline: this.outline,
            outlineSize: this.outlineSize,
            outlineColor: this.outlineColor
        })
    }

}