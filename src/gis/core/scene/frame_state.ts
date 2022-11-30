import { Frustum, PerspectiveCamera, Quaternion, Ray, Vector3 } from "three";
import { Partial, RTS } from "../../../@types/global/global";
import { VecConstants } from "../../../core/constants/vec_constants";
import { math } from "../../../core/math/math";
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

    public domEle: HTMLElement;

    /**
     * 上一帧摄像机位置及欧拉角信息
     */
    public static preCameraState: Partial<RTS> = Object.create(null);

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
     * canvas的尺寸
     */
    public canvasSize: { width: number, height: number };

    /**
     * 标识摄像机是否改变
     */
    public cameraChanged: boolean;

    public sseDenominator: number;

    public frustum: Frustum;

    constructor (camera: PerspectiveCamera, domEle: HTMLElement) {
        this.camera = camera;
        this.domEle = domEle;
        this.cameraWorldRTS.position = camera.getWorldPosition(vec3_1);
        this.cameraPositionWC = Transform.worldCar3ToGeoCar3(this.cameraWorldRTS.position, scratchCameraPosWC);
        this.cameraWorldRTS.rotation = camera.getWorldQuaternion(quat_1);
        this.cameraWorldRTS.scale = camera.getWorldScale(vec3_3);
        this.canvasSize = { width: domEle.clientWidth, height: domEle.clientHeight };
        let viewLineRay = CameraUtils.screenPointToRay(VecConstants.ZERO_VEC2, this.camera, tempRay);
        this.cameraDirection = vec3_2.copy(viewLineRay.direction).normalize();
        this.cameraDirectionWC = Transform.worldCar3ToEarthVec3(this.cameraDirection, scratchDirectionWC).normalize();
        this.frustum = CameraUtils.getFrustum(this.camera);
        this.cameraChanged = FrameState.renderedFrameCount === 0 || !Utils.equalRTS(this.cameraWorldRTS, FrameState.preCameraState);
        this.sseDenominator = 2 * Math.tan(math.toRadians(camera.fov * 0.5));
    }

    public endFrame () {
        FrameState.preCameraState.position = vec3_1_1.copy(this.cameraWorldRTS.position);
        FrameState.preCameraState.rotation = quat_1_1.copy(this.cameraWorldRTS.rotation);
        FrameState.preCameraState.scale = vec3_1_2.copy(this.cameraWorldRTS.scale);
        FrameState.renderedFrameCount++;
    }

}

