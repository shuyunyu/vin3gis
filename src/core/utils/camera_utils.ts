import { Camera, Frustum, Matrix4, OrthographicCamera, PerspectiveCamera, Ray, Vector2 } from "three";
import { ICartesian2Like } from "../../gis/@types/core/gis";
import { VecConstants } from "../constants/vec_constants";

const mat4_1 = new Matrix4();

export class CameraUtils {

    /**
     * 获取指定相机的当前视锥体
     * @param camera 
     * @param updateCamera 是否需要更新相机的矩阵
     * @param out 
     */
    public static getFrustum (camera: Camera, updateCamera: boolean = false, out?: Frustum) {
        if (updateCamera) {
            camera.updateMatrix();
            camera.updateMatrixWorld();
            camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
        }
        out = out || new Frustum();
        out.setFromProjectionMatrix(mat4_1.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
        return out;
    }

    /**
     * 将屏幕坐标点转换为穿过该点的射线
     * @param sp NDC coord
     * @param camera 
     */
    public static screenPointToRay (coords: ICartesian2Like, camera: Camera, out?: Ray) {
        let ray = out || new Ray();
        if (camera instanceof PerspectiveCamera) {

            ray.origin.setFromMatrixPosition(camera.matrixWorld);
            ray.direction.set(coords.x, coords.y, 0.5).unproject(camera).sub(ray.origin).normalize();

        } else if (camera instanceof OrthographicCamera) {

            ray.origin.set(coords.x, coords.y, (camera.near + camera.far) / (camera.near - camera.far)).unproject(camera); // set origin in plane of camera
            ray.direction.set(0, 0, - 1).transformDirection(camera.matrixWorld);

        } else {
            console.error('CameraUtils: Unsupported camera type: ' + camera.type);
        }
        return ray;
    }

    /**
     * 将屏幕中心点转为穿过该点的射线
     * @param camera 
     * @param out 
     */
    public static screenCenterToRay (camera: Camera, out?: Ray) {
        return this.screenPointToRay(VecConstants.ZERO_VEC2, camera, out);
    }

}