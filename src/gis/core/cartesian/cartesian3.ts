import { math } from "../../../core/math/math";
import { ICartesian2Like, ICartesian3Like } from "../../@types/core/gis";

/**
 * 三维笛卡尔坐标
 */
export class Cartesian3 implements ICartesian2Like, ICartesian3Like {

    public x: number = 0;

    public y: number = 0;

    public z: number = 0;

    public constructor (x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public set (x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    public copy (out: Cartesian3) {
        out.set(this.x, this.y, this.z);
        return out;
    }

    public clone () {
        return new Cartesian3(this.x, this.y, this.z);
    }

    public equals (car3: Cartesian3) {
        return this.x === car3.x && this.y === car3.y && this.z === car3.z;
    }

    public equalsEpsilon (car3: Cartesian3, relativeEpsilon?: number, absoluteEpsilon?: number) {
        return this === car3 || (
            math.equalsEpsilon(this.x, car3.x, relativeEpsilon, absoluteEpsilon)
            && math.equalsEpsilon(this.y, car3.y, relativeEpsilon, absoluteEpsilon)
            && math.equalsEpsilon(this.z, car3.z, relativeEpsilon, absoluteEpsilon)
        )
    }

    public distanceTo (car3: Cartesian3) {
        const x = this.x - car3.x;
        const y = this.y - car3.y;
        const z = this.z - car3.z;
        return Math.sqrt(x * x + y * y + z * z);
    }

    public midpoint (car: Cartesian3, out?: Cartesian3) {
        out = out || new Cartesian3();
        out.x = (this.x + car.x) * 0.5;
        out.y = (this.y + car.y) * 0.5;
        out.z = (this.z + car.z) * 0.5;
        return out;
    }

    public max () {
        return Math.max(this.x, this.y, this.z);
    }

    public divide (car3: Cartesian3, out?: Cartesian3) {
        out = out || new Cartesian3();
        out.set(this.x / car3.x, this.y / car3.y, this.z / car3.z);
        return out;
    }

    public static fromArray (arr: number[], out?: Cartesian3) {
        out = out || new Cartesian3();
        out.set(arr[0], arr[1], arr[2]);
        return out;
    }

    public static fromCartesian2 (car2: ICartesian2Like, out?: Cartesian3) {
        out = out || new Cartesian3();
        out.set(car2.x, car2.y, 0);
        return out;
    }

    public static fromCartesian3 (car3: ICartesian3Like, out?: Cartesian3) {
        out = out || new Cartesian3();
        out.set(car3.x, car3.y, car3.z);
        return out;
    }

    public static set (car3: Cartesian3, x: number, y: number, z: number) {
        car3.set(x, y, z);
        return car3;
    }

    public static copy (car3: Cartesian3, out: Cartesian3) {
        out.set(car3.x, car3.y, car3.z);
        return out;
    }

    public static clone (car3: Cartesian3, out?: Cartesian3) {
        out = out || new Cartesian3();
        out.set(car3.x, car3.y, car3.z);
        return out;
    }

    public static equals (left: Cartesian3, right: Cartesian3) {
        return left.equals(right);
    }

    public static equalsEpsilon (left: Cartesian3, right: Cartesian3, relativeEpsilon?: number, absoluteEpsilon?: number) {
        return left.equalsEpsilon(right, relativeEpsilon, absoluteEpsilon);
    }

    public static distanceTo (left: Cartesian3, right: Cartesian3) {
        return left.distanceTo(right);
    }

    public static midpoint (left: Cartesian3, right: Cartesian3, out?: Cartesian3) {
        return left.midpoint(right, out);
    }

    public static unpack (arr: number[], startIndex: number = 0, out?: Cartesian3) {
        out = out || new Cartesian3();
        out.set(arr[startIndex++], arr[startIndex++], arr[startIndex]);
        return out;
    }

    public static max (car3: Cartesian3) {
        return car3.max();
    }

    public static divide (left: Cartesian3, right: Cartesian3, out?: Cartesian3) {
        return left.divide(right, out);
    }

}

export const Cartesian3_ZERO = new Cartesian3(0.0, 0.0, 0.0);
export const Cartesian3_UNIT_X = new Cartesian3(1.0, 0.0, 0.0);
export const Cartesian3_UNIT_Y = new Cartesian3(0.0, 1.0, 0.0);
export const Cartesian3_UNIT_Z = new Cartesian3(0.0, 0.0, 1.0);