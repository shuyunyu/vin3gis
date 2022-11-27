import { ICartesian2Like, ICartesian3Like, ICartesian4Like } from "../../@types/core/gis";

/**
 * 四维笛卡尔坐标
 */
export class Cartesian4 implements ICartesian2Like, ICartesian3Like, ICartesian4Like {

    public x: number = 0;

    public y: number = 0;

    public z: number = 0;

    public w: number = 0;

    public constructor (x: number = 0, y: number = 0, z: number = 0, w: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    public set (x: number, y: number, z: number, w: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        return this;
    }

    public copy (out: Cartesian4) {
        out.set(this.x, this.y, this.z, this.w);
        return out;
    }

    public clone () {
        return new Cartesian4(this.x, this.y, this.z, this.w);
    }

    public equals (car4: Cartesian4) {
        return this.x === car4.x && this.y === car4.y && this.z === car4.z && this.w === car4.w;
    }

    public static set (car4: Cartesian4, x: number, y: number, z: number, w: number) {
        car4.set(x, y, z, w);
        return car4;
    }

    public static copy (car4: Cartesian4, out: Cartesian4) {
        car4.copy(out);
        return out;
    }

    public static equals (left: Cartesian4, right: Cartesian4) {
        return left.equals(right);
    }

    public static unpack (arr: number[], startIndex: number = 0, out?: Cartesian4) {
        out = out || new Cartesian4();
        out.set(arr[startIndex++], arr[startIndex++], arr[startIndex++], arr[startIndex]);
        return out;
    }

}

export const Cartesian4_UNIT_W = new Cartesian4(0.0, 0.0, 0.0, 1.0);