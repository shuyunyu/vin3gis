import { math } from "../../../core/math/math";
import { ICartesian3Like } from "../../@types/core/gis";
import { Cartesian3 } from "../cartesian/cartesian3";

export class Transform {
    //每一个threejs单位 代表实际的多少米
    //100 => 1 threejs单位 表示实际的1米
    public static THREEJS_UNIT_PER_METERS: number = 100;

    /**
     * 获取 每单位 threejs距离 代表的实际地理距离
     */
    public static getMetersPerUnit () {
        return this.THREEJS_UNIT_PER_METERS;
    }

    /**
     * 转换地球上的Cartesian3为世界坐标中的Cartesian3。
     * 由于取Y平面作为地图平面，而实际上地图平面为Z平面 所以需要转换一下
     * @param aabb 
     */
    public static earthCar3ToWorldCar3 (vec3: ICartesian3Like, out?: Cartesian3) {
        out = out || new Cartesian3();
        Cartesian3.rotateX(out, vec3, Cartesian3.ZERO, -math.PI_OVER_TWO);
        return out;
    }

}