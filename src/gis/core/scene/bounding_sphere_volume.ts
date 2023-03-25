import { BufferGeometry, Material, Mesh, Sphere, SphereGeometry, Vector3 } from "three";
import { math } from "../../../core/math/math";
import { IntersectUtils } from "../../../core/utils/intersect_utils";
import { Utils } from "../../../core/utils/utils";
import { CoordinateOffsetType } from "../../@types/core/gis";
import { Cartesian3 } from "../cartesian/cartesian3";
import { ITilingScheme } from "../tilingscheme/tiling_scheme";
import { webMercatorTilingScheme } from "../tilingscheme/web_mercator_tiling_scheme";
import { Transform } from "../transform/transform";
import { IBoundingVolume } from "./bounding_volume";
import { FrameState } from "./frame_state";

const fromPointsCurrentPos = new Cartesian3();
const fromPointsXMin = new Cartesian3();
const fromPointsYMin = new Cartesian3();
const fromPointsZMin = new Cartesian3();
const fromPointsXMax = new Cartesian3();
const fromPointsYMax = new Cartesian3();
const fromPointsZMax = new Cartesian3();
const fromPointsScratch = new Cartesian3();
const fromPointsRitterCenter = new Cartesian3();
const fromPointsMinBoxPt = new Cartesian3();
const fromPointsMaxBoxPt = new Cartesian3();
const fromPointsNaiveCenterScratch = new Cartesian3();
const volumeConstant = (4.0 / 3.0) * math.PI;

const scracthVec3 = new Vector3();

export class BoundingSphereVolume implements IBoundingVolume {

    private _tilingScheme: ITilingScheme;

    private _center: Cartesian3;

    private _radius: number;

    private _sphere: Sphere;

    private _boundingSphereCenter: Vector3;

    private _boundingSphereRadius: number;

    private _boundingSphereVolume: number;

    public get center () {
        return this._center!;
    }

    public get radius () {
        return this._radius!;
    }

    public get boundingSphere () {
        return this._sphere!;
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

    public get sphere () {
        return this._sphere!;
    }

    constructor (center: Cartesian3, radius: number, coordinateOffsetType: CoordinateOffsetType, tilingScheme?: ITilingScheme) {
        this._tilingScheme = Utils.defaultValue(tilingScheme, webMercatorTilingScheme);
        this.update(center, radius, coordinateOffsetType);
    }
    public distanceToCamera (frameState: FrameState): number {
        let metersPerUnit = Transform.getMetersPerUnit();
        let distance = Math.max(0, (Cartesian3.distance(this.boundingSphereCenter, frameState.cameraWorldRTS.position) - this.boundingSphereRadius) * metersPerUnit);
        return distance;
    }

    public computeVisible (frameState: FrameState) {
        return IntersectUtils.intersectSphereFrustum(this.sphere, frameState.frustum);
    }

    public update (center: Cartesian3, radius: number, coordinateOffsetType: CoordinateOffsetType) {
        this._center = center.clone();
        Transform.wgs84ToCartesian(this._tilingScheme.projection, this.center, coordinateOffsetType, this._center);
        this._radius = radius;
        let metersPerUnit = Transform.getMetersPerUnit();
        let centerVec = Transform.geoCar3ToWorldVec3(center, scracthVec3);
        this._sphere = new Sphere(centerVec, this._radius / metersPerUnit);
        this._boundingSphereCenter = this._sphere.center.clone();
        this._boundingSphereRadius = this._sphere.radius;
        this._boundingSphereVolume = volumeConstant * radius * radius * radius;
    }

    public createDebugBoundingVolumeMesh (material: Material): Mesh<BufferGeometry, Material | Material[]> {
        const geometry = new SphereGeometry(this.radius);
        const mesh = new Mesh(geometry, material);
        mesh.position.copy(this.boundingSphere.center);
        mesh.matrixWorldNeedsUpdate = true;
        return mesh;
    }

    public static fromPoints (positions: Cartesian3[], coordinateOffsetType: CoordinateOffsetType, result?: BoundingSphereVolume) {
        if (!Utils.defined(result)) {
            result = new BoundingSphereVolume(new Cartesian3(0, 0, 0), 0, coordinateOffsetType);
        }
        if (!Utils.defined(positions) || positions.length === 0) {
            result!.update(Cartesian3.ZERO.clone(), 0, coordinateOffsetType);
            return result!;
        }

        let currentPos = positions[0].clone(fromPointsCurrentPos);

        let xMin = currentPos.clone(fromPointsXMin);
        let yMin = currentPos.clone(fromPointsYMin);
        let zMin = currentPos.clone(fromPointsZMin);

        let xMax = currentPos.clone(fromPointsXMax);
        let yMax = currentPos.clone(fromPointsYMax);
        let zMax = currentPos.clone(fromPointsZMax);

        let numPositions = positions.length;
        let i;
        for (i = 1; i < numPositions; i++) {
            positions[i].clone(currentPos);

            let x = currentPos.x;
            let y = currentPos.y;
            let z = currentPos.z;

            // Store points containing the the smallest and largest components
            if (x < xMin.x) {
                currentPos.clone(xMin);
            }

            if (x > xMax.x) {
                currentPos.clone(xMax);
            }

            if (y < yMin.y) {
                currentPos.clone(yMin);
            }

            if (y > yMax.y) {
                currentPos.clone(yMax);
            }

            if (z < zMin.z) {
                currentPos.clone(zMin);
            }

            if (z > zMax.z) {
                currentPos.clone(zMax);
            }
        }

        // Compute x-, y-, and z-spans (Squared distances b/n each component's min. and max.).
        let xSpan = Cartesian3.lengthSqr(Cartesian3.subtract(fromPointsScratch, xMax, xMin));
        let ySpan = Cartesian3.lengthSqr(Cartesian3.subtract(fromPointsScratch, yMax, yMin));
        let zSpan = Cartesian3.lengthSqr(Cartesian3.subtract(fromPointsScratch, zMax, zMin));

        // Set the diameter endpoints to the largest span.
        let diameter1 = xMin;
        let diameter2 = xMax;
        let maxSpan = xSpan;
        if (ySpan > maxSpan) {
            maxSpan = ySpan;
            diameter1 = yMin;
            diameter2 = yMax;
        }
        if (zSpan > maxSpan) {
            maxSpan = zSpan;
            diameter1 = zMin;
            diameter2 = zMax;
        }

        // Calculate the center of the initial sphere found by Ritter's algorithm
        let ritterCenter = fromPointsRitterCenter;
        ritterCenter.x = (diameter1.x + diameter2.x) * 0.5;
        ritterCenter.y = (diameter1.y + diameter2.y) * 0.5;
        ritterCenter.z = (diameter1.z + diameter2.z) * 0.5;

        // Calculate the radius of the initial sphere found by Ritter's algorithm
        let radiusSquared = Cartesian3.lengthSqr(Cartesian3.subtract(fromPointsScratch, diameter2, ritterCenter));
        let ritterRadius = Math.sqrt(radiusSquared);

        // Find the center of the sphere found using the Naive method.
        let minBoxPt = fromPointsMinBoxPt;
        minBoxPt.x = xMin.x;
        minBoxPt.y = yMin.y;
        minBoxPt.z = zMin.z;

        let maxBoxPt = fromPointsMaxBoxPt;
        maxBoxPt.x = xMax.x;
        maxBoxPt.y = yMax.y;
        maxBoxPt.z = zMax.z;

        let naiveCenter = Cartesian3.midpoint(minBoxPt, maxBoxPt, fromPointsNaiveCenterScratch);

        // Begin 2nd pass to find naive radius and modify the ritter sphere.
        let naiveRadius = 0;
        for (i = 0; i < numPositions; i++) {
            positions[i].clone(currentPos);

            // Find the furthest point from the naive center to calculate the naive radius.
            let r = Cartesian3.len(
                Cartesian3.subtract(fromPointsScratch, currentPos, naiveCenter)
            );
            if (r > naiveRadius) {
                naiveRadius = r;
            }

            // Make adjustments to the Ritter Sphere to include all points.
            let oldCenterToPointSquared = Cartesian3.lengthSqr(
                Cartesian3.subtract(fromPointsScratch, currentPos, ritterCenter)
            );
            if (oldCenterToPointSquared > radiusSquared) {
                let oldCenterToPoint = Math.sqrt(oldCenterToPointSquared);
                // Calculate new radius to include the point that lies outside
                ritterRadius = (ritterRadius + oldCenterToPoint) * 0.5;
                radiusSquared = ritterRadius * ritterRadius;
                // Calculate center of new Ritter sphere
                let oldToNew = oldCenterToPoint - ritterRadius;
                ritterCenter.x =
                    (ritterRadius * ritterCenter.x + oldToNew * currentPos.x) /
                    oldCenterToPoint;
                ritterCenter.y =
                    (ritterRadius * ritterCenter.y + oldToNew * currentPos.y) /
                    oldCenterToPoint;
                ritterCenter.z =
                    (ritterRadius * ritterCenter.z + oldToNew * currentPos.z) /
                    oldCenterToPoint;
            }
        }

        if (ritterRadius < naiveRadius) {
            result!.update(ritterCenter, ritterRadius, coordinateOffsetType);
        } else {
            result!.update(naiveCenter, naiveRadius, coordinateOffsetType);
        }
        return result!;
    }

}

