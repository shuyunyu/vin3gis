import { Camera, Frustum, Quaternion, Ray, Vector3 } from "three";
import { Partial, RTS } from "../../../@types/global/global";
import { Cartesian3 } from "../cartesian/cartesian3";
import { Transform } from "../transform/transform";

const vec3_1 = new Vector3();

const vec3_1_1 = new Vector3();

const quat_1 = new Quaternion();

const quat_1_1 = new Quaternion();

const scratchCameraPosWC = new Cartesian3();
const scratchDirectionWC = new Cartesian3();

const tempRay = new Ray();



/**
 * 每帧状态
 */
export class FrameState {

    public camera: Camera;

    public domEle: HTMLElement;

    /**
     * 上一帧摄像机位置及欧拉角信息
     */
    public static preCameraState: Partial<RTS> = Object.create(null);

    public static renderedFrameCount: number = 0;

    /**
     * 摄像机的世界坐标
     * 
     */
    public cameraWorldPosition: Vector3;

    /**
     * 摄像机世界笛卡尔坐标
     */
    public cameraPositionWC: Cartesian3;

    /**
     * 摄像机的欧拉角
     */
    public cameraWorldQuat: Quaternion;

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

    constructor (camera: Camera, domEle: HTMLElement) {
        this.camera = camera;
        this.domEle = domEle;
        this.cameraWorldPosition = camera.getWorldPosition(vec3_1);
        this.cameraPositionWC = Transform.worldCar3ToGeoCar3(this.cameraWorldPosition, scratchCameraPosWC);
        this.cameraWorldQuat = camera.getWorldQuaternion(quat_1);
        this.canvasSize = { width: domEle.clientWidth, height: domEle.clientHeight };
        let viewLineRay = this.camera.screenPointToRay(ResourceCenter.containerWidth / 2, ResourceCenter.containerHeight / 2, tempRay);
        this.cameraDirection = viewLineRay.d.clone().normalize();
        this.cameraDirectionWC = Vec3.normalize(new Cartesian3(), Transform.worldVec3ToCartesian3(this.cameraDirection, scratchDirectionWC));
        this.frustum = camera.camera.frustum;
        this.cameraChanged = FrameState.renderedFrameCount === 0 || !this.cameraWorldPosition.equals(FrameState.preCameraState.position) || !this.cameraWorldQuat.equals(FrameState.preCameraState.rotation!);
        this.sseDenominator = 2 * Math.tan(Util.toRadians(camera.fov * 0.5));
    }

    public endFrame () {
        FrameState.preCameraState.position = vec3_1_1.copy(this.cameraWorldPosition);
        FrameState.preCameraState.rotation = quat_1_1.copy(this.cameraWorldQuat);
        FrameState.renderedFrameCount++;
    }

}

