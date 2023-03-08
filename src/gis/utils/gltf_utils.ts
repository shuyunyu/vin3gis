import { MatConstants } from "../../core/constants/mat_constants";
import { Utils } from "../../core/utils/utils";
import { Cartesian3 } from "../core/cartesian/cartesian3";

export class GltfUtils {

    /**
     * 获取gltf 中附带的 rctCenter 信息
     * @param gltf 
     * @returns 
     */
    public static getRtcCenter (gltf: any) {
        let extensions = gltf && gltf.extensions ? gltf.extensions : undefined;
        if (!Utils.defined(extensions) || !Utils.defined(extensions.CESIUM_RTC)) {
            return undefined;
        }
        let center = Cartesian3.unpack(extensions.CESIUM_RTC);
        if (!center.equals(Cartesian3.ZERO)) {
            return center;
        } else {
            return undefined;
        }
    }

    /**
     * 获取gltf节点的变换矩阵
     * @param json 
     * @param index 
     * @param parentMatrix 
     * @returns 
     */
    public static getNodeMatrix (json: any, index: number) {
        return MatConstants.Mat4_IDENTITY;
    }

}