import { math } from "../../../core/math/math";
import { Cartesian3 } from "../cartesian/cartesian3";
import { Cartographic } from "../cartographic";
import { scaleToGeodeticSurface } from "../misc/scale_to_geodetic_surface";

const cartesianToCartographicN = new Cartesian3();
const cartesianToCartographicP = new Cartesian3();
const cartesianToCartographicH = new Cartesian3();

const cartographicToCartesianNormal = new Cartesian3();
const cartographicToCartesianK = new Cartesian3();

/**
 * 椭球体
 */
export class Ellipsoid {

    private _x: number;

    private _y: number;

    private _z: number;

    private _radii: Cartesian3;

    private _radiiSquared: Cartesian3;

    private _radiiToTheFourth: Cartesian3;

    private _oneOverRadii: Cartesian3;

    private _oneOverRadiiSquared: Cartesian3;

    private _minimumRadius: number;

    private _maximumRadius: number;

    private _centerToleranceSquared: number;

    private _squaredXOverSquaredZ: number | undefined;

    public get radii () {
        return this._radii;
    }

    public get radiiSquared () {
        return this._radiiSquared;
    }

    public get radiiToTheFourth () {
        return this._radiiToTheFourth;
    }

    public get oneOverRadii () {
        return this._oneOverRadii;
    }

    public get oneOverRadiiSquared () {
        return this._oneOverRadiiSquared;
    }

    public get minimumRadius () {
        return this._minimumRadius;
    }

    public get maximumRadius () {
        return this._maximumRadius;
    }

    public get centerToleranceSquared () {
        return this._centerToleranceSquared;
    }

    public get squaredXOverSquaredZ () {
        return this._squaredXOverSquaredZ;
    }

    constructor (x: number = 0.0, y: number = 0.0, z: number = 0.0) {
        this._x = x;
        this._y = y;
        this._z = z;
        this._radii = new Cartesian3(x, y, z);

        this._radiiSquared = new Cartesian3(x * x, y * y, z * z);

        this._radiiToTheFourth = new Cartesian3(
            x * x * x * x,
            y * y * y * y,
            z * z * z * z
        );

        this._oneOverRadii = new Cartesian3(
            x === 0.0 ? 0.0 : 1.0 / x,
            y === 0.0 ? 0.0 : 1.0 / y,
            z === 0.0 ? 0.0 : 1.0 / z
        );

        this._oneOverRadiiSquared = new Cartesian3(
            x === 0.0 ? 0.0 : 1.0 / (x * x),
            y === 0.0 ? 0.0 : 1.0 / (y * y),
            z === 0.0 ? 0.0 : 1.0 / (z * z)
        );

        this._minimumRadius = Math.min(x, y, z);

        this._maximumRadius = Math.max(x, y, z);

        this._centerToleranceSquared = math.EPSILON1;

        if (this._radiiSquared.z !== 0) {
            this._squaredXOverSquaredZ =
                this._radiiSquared.x / this._radiiSquared.z;
        }
    }

    public clone () {
        return new Ellipsoid(this._x, this._y, this._z);
    }

    public fromCartesian3 (cartesian3: Cartesian3) {
        return new Ellipsoid(cartesian3.x, cartesian3.y, cartesian3.z);
    }

    public scaleToGeodeticSurface (cartesian: Cartesian3, out?: Cartesian3) {
        return scaleToGeodeticSurface(cartesian, this._oneOverRadii, this._oneOverRadiiSquared, this._centerToleranceSquared, out);
    }

    /**
     * 获取沿着地表的法线
     * @param cartesian 
     * @param result 
     * @returns 
     */
    public geodeticSurfaceNormal (cartesian: Cartesian3, result?: Cartesian3) {
        if (
            Cartesian3.equalsEpsilon(cartesian, Cartesian3.ZERO, math.EPSILON14)
        ) {
            return undefined;
        }
        if (!result) {
            result = new Cartesian3();
        }
        result = Cartesian3.multiply(
            result!,
            cartesian,
            this._oneOverRadiiSquared,
        );
        return Cartesian3.normalize(result, result);
    }

    public scaleToGeocentricSurface (cartesian: Cartesian3, result?: Cartesian3) {
        if (!result) {
            result = new Cartesian3();
        }

        let positionX = cartesian.x;
        let positionY = cartesian.y;
        let positionZ = cartesian.z;
        let oneOverRadiiSquared = this._oneOverRadiiSquared;

        let beta =
            1.0 /
            Math.sqrt(
                positionX * positionX * oneOverRadiiSquared.x +
                positionY * positionY * oneOverRadiiSquared.y +
                positionZ * positionZ * oneOverRadiiSquared.z
            );

        return Cartesian3.multiplyScalar(result!, cartesian, beta);
    }

    public geodeticSurfaceNormalCartographic (cartographic: Cartographic, result?: Cartesian3) {
        let longitude = cartographic.longitude;
        let latitude = cartographic.latitude;
        let cosLatitude = Math.cos(latitude);

        let x = cosLatitude * Math.cos(longitude);
        let y = cosLatitude * Math.sin(longitude);
        let z = Math.sin(latitude);

        if (!result) {
            result = new Cartesian3();
        }
        result!.x = x;
        result!.y = y;
        result!.z = z;
        return Cartesian3.normalize(result!, result!);
    }

    public cartesianToCartographic (cartesian: Cartesian3, result?: Cartographic) {
        let p = this.scaleToGeodeticSurface(cartesian, cartesianToCartographicP);
        if (!p) {
            return undefined;
        }
        let n = this.geodeticSurfaceNormal(p!, cartesianToCartographicN);
        let h = Cartesian3.subtract(cartesianToCartographicH, cartesian, p!);
        let longitude = Math.atan2(n!.y, n!.x);
        let latitude = Math.asin(n!.z);
        let height = Math.sign(Cartesian3.dot(h, cartesian)) * Cartesian3.len(h);
        if (!p) {
            return new Cartographic(longitude, latitude, height);
        }
        result!.longitude = longitude;
        result!.latitude = latitude;
        result!.height = height;
        return result;
    }

    public cartographicToCartesian (cartographic: Cartographic, result?: Cartesian3) {
        let n = cartographicToCartesianNormal;
        let k = cartographicToCartesianK;
        this.geodeticSurfaceNormalCartographic(cartographic, n);
        Cartesian3.multiply(k, this._radiiSquared, n);
        let gamma = Math.sqrt(Cartesian3.dot(n, k));
        Cartesian3.multiplyScalar(k, k, 1 / gamma);
        Cartesian3.multiplyScalar(n, n, cartographic.height);

        if (!result) {
            result = new Cartesian3();
        }
        return Cartesian3.add(result!, k, n);
    }

}

export const EllipsoidWGS84 = new Ellipsoid(6378137.0, 6378137.0, 6356752.3142451793);