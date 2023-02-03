import { Utils } from "../../../../core/utils/utils";
import { GeometryRerenderProperty } from "../../../decorator/decorator";
import { Cartographic } from "../../cartographic";
import { MultiPointGeometryVisualizer } from "../visualizer/multi_point_geometry_visualizer";
import { BillboardSingleRenderData } from "./base_billboard_geometry";
import { BasePointGeometry, BasePointGeometryOptions } from "./base_point_geometry";
import { GeometryType } from "./geometry";

export type MultiPointGeometryOptions = {
    //point的位置
    positions?: Cartographic[];
    //每个点的缩放值 通过这个值 可以控制点的大小
    scales?: number[];
} & BasePointGeometryOptions

/**
 * 多点几何
 */
export class MultiPointGeometry extends BasePointGeometry {

    private _positions: Cartographic[];

    public get positions () {
        return this._positions;
    }

    @GeometryRerenderProperty()
    public set positions (val: Cartographic[] | null) {
        this._positions = val || [];
    }

    private _scales: number[];

    public get scales () {
        return this._scales;
    }

    @GeometryRerenderProperty()
    public set scales (val: number[]) {
        this._scales = val;
    }

    public constructor (options?: MultiPointGeometryOptions) {
        options = options || {};
        super(GeometryType.MULTI_POINT, options);
        this._positions = Utils.defaultValue(options.positions, []);
        this._scales = Utils.defaultValue(options.scales, []);
        this.visualizer = new MultiPointGeometryVisualizer();
    }

    public getRenderData () {
        return this.positions.map((position: Cartographic, index: number) => {
            const renderData: BillboardSingleRenderData = {
                position: position,
                rotation: 0,
                scale: this._scales[index] || 1
            };
            return renderData;
        });
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