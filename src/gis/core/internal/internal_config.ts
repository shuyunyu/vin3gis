import { math } from "../../../core/math/math";

/**
 * 存放一些内部公用的配置
 */
export class InternalConfig {

    /**
     * 相机的最大倾角
     */
    public static MAX_PITCH = 0;

    /**
     * 相机的最小倾角
     */
    public static MIN_PITCH = -math.PI_OVER_TWO;

    /**
     * 校验相机的pitch是否有效
     * @param pitch 
     * @returns 
     */
    public static checkCameraPitch (pitch: number) {
        return pitch >= this.MIN_PITCH && pitch <= this.MAX_PITCH;
    }

    /**
     * 夹紧相机的倾角
     * @param pitch 
     * @returns 
     */
    public static clampCameraPitch (pitch: number) {
        return math.clamp(pitch, this.MIN_PITCH, this.MAX_PITCH);
    }

}