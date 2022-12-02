import { Ray, Vector3 } from "three";
import { ICartesian3Like } from "../../gis/@types/core/gis";
import { Cartesian3 } from "../../gis/core/cartesian/cartesian3";

export class RayUtils {

    /**
     * 根据给定距离计算出射线上的一点
     * @param ray 
     * @param distance 
     * @param out 
     * @returns 
     */
    public static computeHit<T extends ICartesian3Like> (ray: Ray, distance: number, out: T) {
        Cartesian3.normalize(out, ray.direction);
        Cartesian3.scaleAndAdd(out, ray.origin, out, distance);
        return out;
    }

}