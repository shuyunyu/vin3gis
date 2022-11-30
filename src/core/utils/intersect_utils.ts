import { Box3, Frustum, Sphere } from "three";

/**
 * 相交检测工具类
 */
export class IntersectUtils {

    /**
     * box和视锥体的相交检测
     * @param box 
     * @param frustum 
     * @returns 
     */
    public static intersectBoxFrustum (box: Box3, frustum: Frustum) {
        return frustum.intersectsBox(box);
    }

    /**
     * sphere和视锥体的相交检测
     * @param sphere 
     * @param frustum 
     * @returns 
     */
    public static intersectSphereFrustum (sphere: Sphere, frustum: Frustum) {
        return frustum.intersectsSphere(sphere);
    }

}