import { ICartesian2Like, ICartesian3Like } from "../../@types/core/gis";

/**
 * 二维笛卡尔坐标
 */
export class Cartesian2 implements ICartesian2Like {

    public x: number = 0;

    public y: number = 0;

    public constructor (x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    public set (x: number, y: number) {
        this.x = x;
        this.y = y;
        return this;
    }

    public copy (out: Cartesian2) {
        out.set(this.x, this.y);
        return out;
    }

    public clone () {
        return new Cartesian2(this.x, this.y);
    }

    public equals (car2: Cartesian2) {
        return this.x === car2.x && this.y === car2.y;
    }

    public distanceTo (car2: Cartesian2) {
        return Math.sqrt(Math.pow(this.x - car2.x, 2) + Math.pow(this.y - car2.y, 2));
    }

    public static fromArray (arr: number[], out?: Cartesian2) {
        out = out || new Cartesian2();
        out.set(arr[0], arr[1]);
        return out;
    }

    public static fromCartesian2 (car2: ICartesian2Like, out?: Cartesian2) {
        out = out || new Cartesian2();
        out.set(car2.x, out.y);
        return out;
    }

    public static fromCartesian3 (car3: ICartesian3Like, out?: Cartesian2) {
        out = out || new Cartesian2();
        return this.set(out, car3.x, car3.y);
    }

    public static set (origin: Cartesian2, x: number, y: number) {
        origin.set(x, y);
        return origin;
    }

    public static copy (origin: ICartesian2Like, out: Cartesian2) {
        out.set(origin.x, origin.y);
        return out;
    }

    public static clone (origin: ICartesian2Like, out?: Cartesian2) {
        out = out || new Cartesian2();
        out.set(origin.x, origin.y);
        return out;
    }

    public static equals (left: Cartesian2, right: Cartesian2) {
        return left.equals(right);
    }

    public static distance (left: Cartesian2, right: Cartesian2) {
        return left.distanceTo(right);
    }

}