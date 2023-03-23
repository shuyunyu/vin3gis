import { BoxGeometry, BufferGeometry, Material, Matrix3, Matrix4, Mesh, Quaternion, Sphere, Vector3 } from "three";
import { math } from "../../../core/math/math";
import { OBB } from "../../../core/math/obb";
import { IntersectUtils } from "../../../core/utils/intersect_utils";
import { Utils } from "../../../core/utils/utils";
import { Earth3DTilesetGltfUpAxis } from "../../@types/core/earth_3dtileset";
import { CoordinateOffsetType } from "../../@types/core/gis";
import { Cartesian3 } from "../cartesian/cartesian3";
import { ITilingScheme } from "../tilingscheme/tiling_scheme";
import { webMercatorTilingScheme } from "../tilingscheme/web_mercator_tiling_scheme";
import { Transform } from "../transform/transform";
import { IBoundingVolume } from "./bounding_volume";
import { FrameState } from "./frame_state";

const volumeConstant = (4.0 / 3.0) * math.PI;
const scratchMat4 = new Matrix4();

export class BoundingOrientedBoxVolume implements IBoundingVolume {

    private _tilingScheme: ITilingScheme;

    //中心点
    private _center: Cartesian3;

    //方向矩阵
    private _halfAxis: Matrix3;

    private _gltfUpAxis: Earth3DTilesetGltfUpAxis;

    //obb
    private _obb: OBB;

    private _boundingSphere: Sphere;

    //保存范围球的中心 避免每次都去计算
    private _boundingSphereCenter: Vector3;

    private _boundingSphereRadius: number;

    private _boundingSphereVolume: number;

    public get center () {
        return this._center;
    }

    public get halfAxis () {
        return this._halfAxis!;
    }

    public get obb () {
        return this._obb;
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

    constructor (center: Cartesian3, gltfUpAxis: Earth3DTilesetGltfUpAxis, halfAxis: Matrix3, coordinateOffsetType: CoordinateOffsetType, tilingScheme?: ITilingScheme) {
        this._tilingScheme = Utils.defaultValue(tilingScheme, webMercatorTilingScheme);
        this.update(center, gltfUpAxis, halfAxis, coordinateOffsetType);
    }

    public distanceToCamera (frameState: FrameState): number {
        let metersPerUnit = Transform.getMetersPerUnit();
        return Math.max(0, (Cartesian3.distance(this.boundingSphereCenter, frameState.cameraWorldRTS.position) - this.boundingSphereRadius) * metersPerUnit);
    }

    public computeVisible (frameState: FrameState) {
        return IntersectUtils.intersectOBBFrustum(this.obb, frameState.frustum);
    }

    public update (center: Cartesian3, gltfUpAxis: Earth3DTilesetGltfUpAxis, halfAxis: Matrix3, coordinateOffsetType: CoordinateOffsetType) {
        this._gltfUpAxis = gltfUpAxis;
        let cartographic = this._tilingScheme.projection.ellipsoid.cartesianToCartographic(center);
        Transform.wgs84ToCartographic(cartographic, coordinateOffsetType, cartographic);
        this._halfAxis = halfAxis.clone();
        this._center = this._tilingScheme.projection.project(cartographic);
        this._obb = this.createOBB(this._center, this._halfAxis);
        this._boundingSphere = this.createBoundingSphere(this._halfAxis);
        this._boundingSphereCenter = this._boundingSphere.center.clone();
        this._boundingSphereRadius = this._boundingSphere.radius;
        let radius = this._boundingSphereRadius;
        this._boundingSphereVolume = volumeConstant * radius * radius * radius;
    }

    public createBoundingSphere (halfAxis: Matrix3) {
        let u = new Vector3(halfAxis.elements[0], halfAxis.elements[1], halfAxis.elements[2]);
        let v = new Vector3(halfAxis.elements[3], halfAxis.elements[4], halfAxis.elements[5]);
        let w = new Vector3(halfAxis.elements[6], halfAxis.elements[7], halfAxis.elements[8]);
        Cartesian3.add(u, u, v);
        Cartesian3.add(u, u, w);
        let radius = u.length();
        radius = Transform.carCoordToWorldCoord(radius);
        let center = this.obb.center.clone();
        return new Sphere(center, radius);
    }

    private createOBB (center: Cartesian3, halfAxis: Matrix3) {
        let xV = new Vector3(halfAxis.elements[0], halfAxis.elements[1], halfAxis.elements[2]);
        let yV = new Vector3(halfAxis.elements[3], halfAxis.elements[4], halfAxis.elements[5]);
        let zV = new Vector3(halfAxis.elements[6], halfAxis.elements[7], halfAxis.elements[8]);
        let hx = xV.length();
        let hy = yV.length();
        let hz = zV.length();
        let centerVec = Transform.geoCar3ToWorldVec3(center);
        xV.normalize();
        yV.normalize();
        zV.normalize();
        halfAxis = new Matrix3().fromArray([
            xV.x, xV.y, xV.z,
            yV.x, yV.y, yV.z,
            zV.x, zV.y, zV.z
        ]);
        const halfSize = new Vector3(hx, hy, hz).multiply(Transform.getMetersScale());
        if (this._gltfUpAxis === Earth3DTilesetGltfUpAxis.Z) {
            Transform.earthMatrix3ToWorldMatrix3(halfAxis, halfAxis);
            //@ts-ignore
            Transform.earthCar3ToWorldVec3(halfSize, halfSize);
        }
        let obb = new OBB(centerVec, halfSize, halfAxis);
        return obb;
    }

    public createBoundingMesh (material: Material): Mesh<BufferGeometry, Material | Material[]> {
        const obb = this.obb;
        const halfSize = obb.halfSize;
        const geometry = new BoxGeometry(halfSize.x * 2, halfSize.y * 2, halfSize.z * 2);
        const mesh = new Mesh(geometry, material);
        const mat = scratchMat4.setFromMatrix3(obb.rotation);
        mesh.position.copy(obb.center);
        const rot = new Quaternion().setFromRotationMatrix(mat);
        mesh.setRotationFromQuaternion(rot);
        mesh.matrixWorldNeedsUpdate = true;
        return mesh;

    }

}