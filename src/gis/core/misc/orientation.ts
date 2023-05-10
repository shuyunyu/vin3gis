import { Euler, Quaternion } from "three";
import { math } from "../../../core/math/math";
import { ICartesian3Like } from "../../@types/core/gis";
import { Log } from "../../log/log";
import { InternalConfig } from "../internal/internal_config";

/**
 * 方位角对象
 * 单位 弧度
 */
export class Orientation {

    public yaw: number;

    public pitch: number;

    public roll: number;

    /**
     * 构造函数 弧度单位
     * @param yaw 
     * @param pitch 
     * @param roll 
     */
    public constructor (yaw: number = 0, pitch: number = InternalConfig.MIN_PITCH, roll: number = 0) {
        this.yaw = yaw;
        if (!InternalConfig.checkCameraPitch(pitch)) {
            Log.warn(Orientation, `pitch value must between ${InternalConfig.MIN_PITCH} and ${InternalConfig.MAX_PITCH}, current value is : ${pitch}`);
            this.pitch = InternalConfig.clampCameraPitch(pitch);
        } else {
            this.pitch = pitch;
        }
        this.roll = roll;
    }

    public clone () {
        return new Orientation(this.yaw, this.pitch, this.roll);
    }

    /**
     * 从由角度单位标识的欧拉角构建此对象
     * @param eulerAngles 
     * @returns 
     */
    public static fromDegreeEulerAngles (eulerAngles: ICartesian3Like) {
        return new Orientation(math.toRadian(eulerAngles.x), math.toRadian(eulerAngles.y), math.toRadian(eulerAngles.z));
    }

    /**
     * 由数组构建orientation
     * @param radiansArray 
     * @param offset 偏移量
     */
    public static fromArray (radiansArray: number[], offset: number = 0) {
        return new Orientation(radiansArray[offset + 0], radiansArray[offset + 1], radiansArray[offset + 2]);
    }

    public toQuaternion (out?: Quaternion) {
        out = out || new Quaternion();
        out.setFromEuler(new Euler(this.pitch, this.yaw, this.roll));
        return out;
    }

    /**
     * 将orientation转换为数组
     * @param out 
     * @returns 
     */
    public toArray (out?: number[]) {
        out = out || new Array(3);
        out[0] = this.yaw;
        out[1] = this.pitch;
        out[2] = this.roll;
        return out;
    }

}