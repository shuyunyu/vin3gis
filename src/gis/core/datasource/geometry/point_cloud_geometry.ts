import { Color } from "three";
import { Utils } from "../../../../core/utils/utils";
import { Cartographic } from "../../cartographic";
import { PointCloudGeometryVisualizer } from "../visualizer/point_cloud_geometry_visualizer";
import { BaseGeometry } from "./base_geometry";
import { GeometryType } from "./geometry";

//点云几何构造参数
export type PointCloudGeometryOptions = {
    //点的尺寸
    size?: number;
    //各个点的位置
    positions?: Cartographic[];
    //各个点的颜色
    colors?: Color[];
    //尺寸是否随着相机变化而衰减
    sizeAttenuation?: boolean;
}

export class PointCloudGeometry extends BaseGeometry {

    private _size: number;

    public get size () {
        return this._size;
    }

    public set size (val: number) {
        this._size = Math.max(0, val);
        this.update();
    }

    private _positions: Cartographic[];

    public get positions () {
        return this._positions;
    }

    public set positions (val: Cartographic[]) {
        this._positions = val;
        this.update();
    }

    private _colors: Color[];

    public get colors () {
        return this._colors;
    }

    private set colors (val: Color[]) {
        this._colors = val;
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

    public constructor (options?: PointCloudGeometryOptions) {
        options = options || {};
        super({ type: GeometryType.POINT_CLOUD });
        this._size = Utils.defaultValue(options.size, 0.05);
        this._sizeAttenuation = Utils.defaultValue(options.sizeAttenuation, false);
        this._positions = Utils.defaultValue(options.positions, []);
        this._colors = Utils.defaultValue(options.colors, []);
        this.visualizer = new PointCloudGeometryVisualizer();
    }

    public clone () {
        return new PointCloudGeometry({
            size: this.size,
            positions: this.positions.map(pos => pos.clone()),
            colors: this.colors.map(c => c.clone())
        });
    }

}