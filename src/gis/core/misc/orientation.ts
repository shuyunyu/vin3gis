import { math } from "../../../core/math/math";
import { ICartesian3Like } from "../../@types/core/gis";
import { Cartesian3 } from "../cartesian/cartesian3";

/**
 * 方位角对象
 */
export class Orientation {

    public yaw: number;

    public pitch: number;

    public roll: number;

    //表示是否为角度单位
    private _degrees: boolean;

    constructor (yaw: number, pitch: number, roll: number, degrees: boolean = true) {
        this.yaw = yaw;
        this.pitch = pitch;
        this.roll = roll;
        this._degrees = degrees;
    }

    public clone () {
        return new Orientation(this.yaw, this.pitch, this.roll, this._degrees);
    }

    public toRadians () {
        if (this._degrees) {
            return new Orientation(math.toRadians(this.yaw), math.toRadians(this.pitch), math.toRadians(this.roll), false);
        } else {
            return new Orientation(this.yaw, this.pitch, this.roll, false);
        }
    }

    /**
     * 转变为欧拉角对象
     * @returns 
     */
    public toEulerAngles (out?: Cartesian3) {
        out = out || new Cartesian3();
        if (this._degrees) {
            return out.set(this.pitch, this.yaw, this.roll);
        } else {
            return out.set(math.toDegree(this.pitch), math.toDegree(this.yaw), math.toDegree(this.roll));
        }
    }

    public static fromEulerAngles (eulerAngles: ICartesian3Like) {
        return new Orientation(eulerAngles.y, eulerAngles.x, eulerAngles.z);
    }

}