import { Box3, Frustum, Sphere } from "three";
import { OBB } from "../math/obb";

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
     * obb和是椎体的相交检测 速度快 但是有错误
     * @param obb 
     * @param frustum 
     * @returns 
     */
    public static intersectOBBFrustum (obb: OBB, frustum: Frustum) {
        for (let i = 0; i < frustum.planes.length; i++) {
            // frustum plane normal points to the inside
            if (obb.intersectsPlane(frustum.planes[i])) {
                return true;
            }
        } // completely outside
        return false;
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