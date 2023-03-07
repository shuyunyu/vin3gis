import { Box3, Sphere, Vector3 } from "three";
import { math } from "../../../core/math/math";
import { IntersectUtils } from "../../../core/utils/intersect_utils";
import { Utils } from "../../../core/utils/utils";
import { CoordinateOffsetType } from "../../@types/core/gis";
import { GeometryUtils } from "../../utils/geometry_utils";
import { Cartesian3 } from "../cartesian/cartesian3";
import { Cartographic } from "../cartographic";
import { Rectangle } from "../geometry/rectangle";
import { ITilingScheme } from "../tilingscheme/tiling_scheme";
import { WebMercatorTilingScheme } from "../tilingscheme/web_mercator_tiling_scheme";
import { Transform } from "../transform/transform";
import { IBoundingVolume } from "./bounding_volume";
import { FrameState } from "./frame_state";

const scratchVec3 = new Vector3();
const volumeConstant = (4.0 / 3.0) * math.PI;

export class BoundingRegionVolume implements IBoundingVolume {

    private static defaultTilingScheme: ITilingScheme = new WebMercatorTilingScheme();

    //投影过后的矩形范围
    private _rectangle: Rectangle | undefined;

    private _minimumHeight: number | undefined;

    private _maximumHeight: number | undefined;

    private _tilingScheme: ITilingScheme;

    private _aabb: Box3 | undefined;

    private _boundingSphere: Sphere | undefined;

    private _boundingSphereCenter: Vector3 | undefined;

    private _boundingSphereRadius: number | undefined;

    private _boundingSphereVolume: number | undefined;

    public get rectangle () {
        return this._rectangle!;
    }

    public get minimumHeight () {
        return this._minimumHeight!;
    }

    public get maximumHeight () {
        return this._maximumHeight!;
    }

    public get boundingSphere () {
        return this._boundingSphere!;
    }

    public get aabb () {
        return this._aabb!;
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

    constructor (southWest: Cartographic, northEast: Cartographic, minimumHeight: number, maximumHeight: number, coordinateOffsetType: CoordinateOffsetType, tilingScheme?: ITilingScheme) {
        this._tilingScheme = Utils.defaultValue(tilingScheme, BoundingRegionVolume.defaultTilingScheme);
        this.update(southWest, northEast, minimumHeight, maximumHeight, coordinateOffsetType);
    }
    public distanceToCamera (frameState: FrameState): number {
        let metersPerUnit = Transform.getMetersPerUnit();
        return Math.max(0, (Cartesian3.distance(this.boundingSphereCenter, frameState.cameraWorldRTS.position) - this.boundingSphereRadius) * metersPerUnit);
    }

    public computeVisible (frameState: FrameState) {
        return IntersectUtils.intersectBoxFrustum(this.aabb, frameState.frustum);
    }

    public update (southWest: Cartographic, northEast: Cartographic, minimumHeight: number, maximumHeight: number, coordinateOffsetType: CoordinateOffsetType) {
        let projectedSW = this._tilingScheme.projection.project(southWest);
        let projectedNE = this._tilingScheme.projection.project(northEast);
        Transform.wgs84ToCartesian(this._tilingScheme.projection, projectedSW, coordinateOffsetType, projectedSW);
        Transform.wgs84ToCartesian(this._tilingScheme.projection, projectedNE, coordinateOffsetType, projectedNE);
        this._rectangle = new Rectangle(projectedSW.x, projectedSW.y, projectedNE.x, projectedNE.y);
        this._minimumHeight = minimumHeight;
        this._maximumHeight = maximumHeight;
        this._aabb = this.createAABB(this._rectangle, minimumHeight, maximumHeight);
        this._boundingSphere = this._aabb.getBoundingSphere(new Sphere());
        this._boundingSphereCenter = this._boundingSphere.center.clone();
        this._boundingSphereRadius = this._boundingSphere.radius;
        let metersPerUnit = Transform.getMetersPerUnit();
        let radius = this._boundingSphereRadius * metersPerUnit;
        this._boundingSphereVolume = volumeConstant * radius * radius * radius;
    }

    public createAABB (rectangle: Rectangle, minimumHeight: number, maximumHeight: number) {
        let metersPerUnit = Transform.getMetersPerUnit();
        let y = (minimumHeight + maximumHeight) / 2;
        let halfW = rectangle.width / 2;
        let halfH = (maximumHeight - minimumHeight) / 2;
        let halfL = rectangle.height / 2;
        let centerCar = new Cartesian3(rectangle.center.x, rectangle.center.y, y);
        let centerVec = Transform.earthCar3ToWorldVec3(centerCar, scratchVec3);
        return GeometryUtils.createBox3(centerVec, halfW / metersPerUnit, halfH / metersPerUnit, halfL / metersPerUnit);
    }

}
