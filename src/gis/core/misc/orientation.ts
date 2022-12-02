import { math } from "../../../core/math/math";
import { ICartesian3Like } from "../../@types/core/gis";

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
        this.pitch = pitch;
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