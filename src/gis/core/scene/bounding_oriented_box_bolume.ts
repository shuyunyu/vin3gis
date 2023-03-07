import { Box3, Matrix3, Sphere, Vector3 } from "three";
import { math } from "../../../core/math/math";
import { IntersectUtils } from "../../../core/utils/intersect_utils";
import { Utils } from "../../../core/utils/utils";
import { Earth3DTilesetGltfUpAxis } from "../../@types/core/earth_3dtileset";
import { CoordinateOffsetType } from "../../@types/core/gis";
import { Cartesian3 } from "../cartesian/cartesian3";
import { ITilingScheme } from "../tilingscheme/tiling_scheme";
import { WebMercatorTilingScheme } from "../tilingscheme/web_mercator_tiling_scheme";
import { Transform } from "../transform/transform";
import { IBoundingVolume } from "./bounding_volume";
import { FrameState } from "./frame_state";

const volumeConstant = (4.0 / 3.0) * math.PI;
const scratchVec3 = new Vector3();

export class BoundingOrientedBoxVolume implements IBoundingVolume {

    private static defaultTilingScheme: ITilingScheme = new WebMercatorTilingScheme();

    private _tilingScheme: ITilingScheme;

    //中心点
    private _center: Cartesian3 | undefined;

    //方向矩阵
    private _halfAxes: Matrix3 | undefined;

    //obb
    private _obb: Box3 | undefined;

    private _boundingSphere: Sphere | undefined;

    //保存范围球的中心 避免每次都去计算
    private _boundingSphereCenter: Vector3 | undefined;

    private _boundingSphereRadius: number | undefined;

    private _boundingSphereVolume: number | undefined;

    private _upAxis: Earth3DTilesetGltfUpAxis;

    public get center () {
        return this._center!;
    }

    public get halfAxes () {
        return this._halfAxes!;
    }

    public get obb () {
        return this._obb!;
    }

    public get boundingSphere () {
        return this._boundingSphere!;
    }

    public get boundingSphereCenter () {
        return this._boundingSphereCenter!;
    }

    public get boundingSphereRadius () {
        return this._boundingSphereRadius!;
    }

    public get boundingSphereVolume () {
        return this._boundingSphereVolume!;
    }

    constructor (center: Cartesian3, halfAxes: Matrix3, upAxis: Earth3DTilesetGltfUpAxis, coordinateOffsetType: CoordinateOffsetType, tilingScheme?: ITilingScheme) {
        this._tilingScheme = Utils.defaultValue(tilingScheme, BoundingOrientedBoxVolume.defaultTilingScheme);
        this._upAxis = upAxis;
        this.update(center, halfAxes, coordinateOffsetType);
    }

    public distanceToCamera (frameState: FrameState): number {
        let metersPerUnit = Transform.getMetersPerUnit();
        return Math.max(0, (Cartesian3.distance(this.boundingSphereCenter, frameState.cameraWorldRTS.position) - this.boundingSphereRadius) * metersPerUnit);
    }

    public computeVisible (frameState: FrameState) {
        return IntersectUtils.intersectBoxFrustum(this.obb, frameState.frustum);
    }

    public update (center: Cartesian3, halfAxes: Matrix3, coordinateOffsetType: CoordinateOffsetType) {
        let metersPerUnit = Transform.getMetersPerUnit();
        let cartographic = this._tilingScheme.projection.ellipsoid.cartesianToCartographic(center);
        Transform.wgs84ToCartographic(cartographic, coordinateOffsetType, cartographic);
        this._center = this._tilingScheme.projection.project(cartographic!);
        this._halfAxes = new Matrix3().copy(halfAxes).multiplyScalar(1 / metersPerUnit);
        this._obb = this.createOBB(this._center, this._halfAxes);
        this._boundingSphere = this.createBoundingSphere(this._halfAxes);
        this._boundingSphereCenter = this._boundingSphere.center.clone();
        this._boundingSphereRadius = this._boundingSphere.radius;
        let radius = this._boundingSphereRadius * metersPerUnit;
        this._boundingSphereVolume = volumeConstant * radius * radius * radius;
    }

    public createBoundingSphere (halfAxes: Matrix3) {
        let u = new Vector3(halfAxes.elements[0], halfAxes.elements[1], halfAxes.elements[2]);
        let v = new Vector3(halfAxes.elements[3], halfAxes.elements[4], halfAxes.elements[5]);
        let w = new Vector3(halfAxes.elements[6], halfAxes.elements[7], halfAxes.elements[8]);
        Cartesian3.add(u, u, v);
        Cartesian3.add(u, u, w);
        let radius = u.length();
        let center = this.obb.getCenter(new Vector3());
        return new Sphere(center, radius);
    }

    private createOBB (center: Cartesian3, halfAxes: Matrix3) {
        let xV = new Vector3(halfAxes.elements[0], halfAxes.elements[1], halfAxes.elements[2]);
        let yV = new Vector3(halfAxes.elements[3], halfAxes.elements[4], halfAxes.elements[5]);
        let zV = new Vector3(halfAxes.elements[6], halfAxes.elements[7], halfAxes.elements[8]);
        let hx = xV.length();
        let hy = yV.length();
        let hz = zV.length();
        let centerVec = Transform.earthCar3ToWorldVec3(center, scratchVec3);
        xV.normalize();
        yV.normalize();
        zV.normalize();
        let obb = geometry.OBB.create(centerVec.x, centerVec.y, centerVec.z, hx, hz, hy, halfAxes.elements[0], halfAxes.elements[1], halfAxes.elements[2], halfAxes.elements[3], halfAxes.elements[4], halfAxes.elements[5], halfAxes.elements[6], halfAxes.elements[7], halfAxes.elements[8]);
        if (this._upAxis == Earth3DTilesetGltfUpAxis.Z) {
            obb.translateAndRotate(Mat4.IDENTITY, Quat.fromEuler(new Quat(), -math.PI_OVER_TWO, 0, 0), obb);
        }
        return obb;
    }

}