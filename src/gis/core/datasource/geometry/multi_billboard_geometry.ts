import { Utils } from "../../../../core/utils/utils";
import { GeometryUpdateProperty } from "../../../decorator/decorator";
import { Cartographic } from "../../cartographic";
import { BillboardGeometryVisualizer } from "../visualizer/billboard_geometry_visualizer";
import { BaseBillboardGeometry, BaseBillboardGeometryOptions, BillboardSingleRenderData } from "./base_billboard_geometry";
import { GeometryType } from "./geometry";

export type MultiBillboardGeometryOptions = {
    positions: Cartographic[];
    rotations?: number[];
    scales?: number[];
} & BaseBillboardGeometryOptions

export class MultiBillboardGeometry extends BaseBillboardGeometry {

    private _positions: Cartographic[];

    public get positions () {
        return this._positions;
    }

    @GeometryUpdateProperty()
    public set positions (val: Cartographic[]) {
        this._positions = val;
        this._instanceCount = this._positions.length;
    }

    private _rotations: number[];

    public get rotations () {
        return this._rotations;
    }

    @GeometryUpdateProperty()
    public set rotations (val: number[]) {
        this._rotations = val;
    }

    private _scales: number[];

    public get scales () {
        return this._scales;
    }

    @GeometryUpdateProperty()
    public set scales (val: number[]) {
        this._scales = val;
    }

    public constructor (options: MultiBillboardGeometryOptions) {
        super(options, GeometryType.MULTI_BILLBOARD, new BillboardGeometryVisualizer());
        this._positions = options.positions;
        this._instanceCount = this._positions.length;
        this._rotations = Utils.defaultValue(options.rotations, []);
        this._scales = Utils.defaultValue(options.scales, []);
    }

    public getRenderData () {
        return this.positions.map((position: Cartographic, index: number) => {
            const res: BillboardSingleRenderData = {
                position: position,
                rotation: this.rotations[index] || 0,
                scale: this.scales[index] || 1
            }
            return res;
        });
    }

    public clone () {
        return new MultiBillboardGeometry({
            image: this.image,
            width: this.width,
            height: this.height,
            center: this.center,
            positions: this.positions.map(p => p.clone()),
            rotations: this.rotations,
            scales: this.scales
        })
    }

}