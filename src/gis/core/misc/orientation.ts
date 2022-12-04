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
    constructor (yaw: number, pitch: number, roll: number) {
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
        return new Orientation(math.toRadians(eulerAngles.x), math.toRadians(eulerAngles.y), math.toRadians(eulerAngles.z));
    }

}