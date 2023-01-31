import { Frustum, PerspectiveCamera, Quaternion, Ray, Vector3 } from "three";
import { RTS } from "../../../@types/global/global";
import { VecConstants } from "../../../core/constants/vec_constants";
import { math } from "../../../core/math/math";
import { Size } from "../../../core/msic/size";
import { CameraUtils } from "../../../core/utils/camera_utils";
import { Utils } from "../../../core/utils/utils";
import { Cartesian3 } from "../cartesian/cartesian3";
import { Transform } from "../transform/transform";

const vec3_1 = new Vector3();
const vec3_2 = new Vector3();
const vec3_3 = new Vector3();

const vec3_1_1 = new Vector3();
const vec3_1_2 = new Vector3();

const quat_1 = new Quaternion();

const quat_1_1 = new Quaternion();

const scratchCameraPosWC = new Cartesian3();
const scratchDirectionWC = new Cartesian3();

const tempRay = new Ray();



/**
 * 每帧状态
 */
export class FrameState {

    public camera: PerspectiveCamera;

    public readonly drawContextHeihgt: number;

    /**
     * 上一帧摄像机位置及欧拉角信息
     */
    public static preCameraState: RTS = Object.create(null);

    public static renderedFrameCount: number = 0;

    /**
     * 摄像机的世界RTS
     * 
     */
    public cameraWorldRTS: RTS = Object.create(null);

    /**
     * 摄像机世界笛卡尔坐标
     */
    public cameraPositionWC: Cartesian3;

    /**
     * 摄像机view line
     */
    public cameraDirection: Vector3;

    /**
     * 摄像机view line 
     */
    public cameraDirectionWC: Cartesian3;

    /**
     * 标识摄像机是否改变
     */
    public cameraChanged: boolean;

    public sseDenominator: number;

    public frustum: Frustum;

    constructor (camera: PerspectiveCamera, size: Size) {
        this.camera = camera;
        this.drawContextHeihgt = size.height;
        this.cameraWorldRTS.position = camera.getWorldPosition(vec3_1);
        this.cameraPositionWC = Transform.worldCar3ToGeoCar3(this.cameraWorldRTS.position, scratchCameraPosWC);
        this.cameraWorldRTS.rotation = camera.getWorldQuaternion(quat_1);
        this.cameraWorldRTS.scale = camera.getWorldScale(vec3_3);
        let viewLineRay = CameraUtils.screenPointToRay(VecConstants.ZERO_VEC2, this.camera, tempRay);
        this.cameraDirection = vec3_2.copy(viewLineRay.direction).normalize();
        this.cameraDirectionWC = Transform.worldCar3ToEarthVec3(this.cameraDirection, scratchDirectionWC).normalize();
        this.frustum = CameraUtils.getFrustum(this.camera);
        this.cameraChanged = FrameState.renderedFrameCount === 0 || !Utils.equalsRTS(this.cameraWorldRTS, FrameState.preCameraState);
        const aspectRatio = camera.aspect;
        //仅在fov和aspectRatio改变时计算此值
        const fov = aspectRatio >= 1 ? math.toRadian(camera.fov) : Math.atan(Math.tan(math.toRadian(camera.fov * 0.5)) / aspectRatio) * 2.0;
        this.sseDenominator = 2 * Math.tan(fov * 0.5);
    }

    public endFrame () {
        FrameState.preCameraState.position = vec3_1_1.copy(this.cameraWorldRTS.position);
        FrameState.preCameraState.rotation = quat_1_1.copy(this.cameraWorldRTS.rotation);
        FrameState.preCameraState.scale = vec3_1_2.copy(this.cameraWorldRTS.scale);
        FrameState.renderedFrameCount++;
    }

}

