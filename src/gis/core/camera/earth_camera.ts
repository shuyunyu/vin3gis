import { Euler, PerspectiveCamera, Quaternion, Ray, Scene, Vector3 } from "three";
import { FrameRenderer } from "../../../core/renderer/frame_renderer";
import { interactionSystem } from "../../../core/system/interaction_system";
import { CameraUtils } from "../../../core/utils/camera_utils";
import { DeviceCoordUtils } from "../../../core/utils/device_coord_util";
import { RayUtils } from "../../../core/utils/ray_utils";
import { EarthCameraOptions, ICartesian2Like } from "../../@types/core/gis";
import { Cartesian2 } from "../cartesian/cartesian2";
import { Cartographic } from "../cartographic";
import { ViewPort } from "../misc/view_port";
import { FrameState } from "../scene/frame_state";
import { ITilingScheme } from "../tilingscheme/tiling_scheme";
import { Transform } from "../transform/transform";
import { Utils } from "../../../core/utils/utils";
import { rendererSystem } from "../../../core/system/renderer_system";
import { InternalConfig } from "../internal/internal_config";

const tempRay = new Ray();

const tempVec3 = new Vector3();

const tempCar2 = new Cartesian2();

/**
 * 定义地图相机
 */
export class EarthCamera {

    private _renderer: FrameRenderer;

    public get renderer () {
        return this._renderer;
    }

    private _tilingScheme: ITilingScheme;

    private _fov: number;

    public get fov () {
        return this._fov;
    }

    public set fov (val: number) {
        this._fov = val;
        this.updateRenderer();
    }

    private _near: number;

    public get near () {
        return this._near;
    }

    public set near (val: number) {
        this._near = val;
        this.updateRenderer();
    }

    private _far: number;

    public get far () {
        return this._far;
    }

    public set far (val: number) {
        this._far = val;
        this.updateRenderer();
    }

    public constructor (tilingScheme: ITilingScheme, target: string | HTMLElement, options?: EarthCameraOptions) {
        options = options || {};
        this._tilingScheme = tilingScheme;
        this._fov = Utils.defaultValue(options.far, InternalConfig.DEFAULT_CAMERA_FOV);
        this._near = Utils.defaultValue(options.near, 0.00000001);
        this._far = Utils.defaultValue(options.far, Transform.THREEJS_UNIT_PER_METERS * 100);
        this._renderer = this.createRenderer(target);
    }

    /**
     * 创建渲染对象
     * @param target 
     */
    private createRenderer (target: string | HTMLElement) {
        const ele = (Utils.isString(target) ? document.getElementById(target as string) : target) as HTMLElement;
        const scene = new Scene();
        const camera = new PerspectiveCamera(this._fov, ele.clientWidth / ele.clientHeight, this._near, this._far);
        const renderer = new FrameRenderer(scene, camera, ele);
        rendererSystem.addRenderTarget(renderer)
        interactionSystem.enableInteraction(renderer);
        return renderer;
    }

    private updateRenderer () {
        this._renderer.updateCameraProps({ fov: this._fov, near: this._near, far: this._far });
    }

    public postRender (dt: number, frameState: FrameState) {

    }

    /**
     * 设置观察点
     * @param viewPort 
     */
    public setViewPort (viewPort: ViewPort) {
        let destination = viewPort.cartogarphic;
        let orientation = viewPort.orientation;
        const position = Transform.cartographicToWorldVec3(destination, this._tilingScheme);
        const rotation = new Quaternion().setFromEuler(new Euler(orientation.pitch, orientation.yaw, orientation.roll));
        interactionSystem.updateCameraRTS(this._renderer, { position, rotation });
    }

    /**
     * 获取pick用的射线
     * @param location 屏幕坐标
     * @param out 
     */
    public getPickRay (location: ICartesian2Like, out?: Ray) {
        const coord = DeviceCoordUtils.coordToNDCCoord(location, this._renderer.domElement, tempCar2);
        return CameraUtils.screenPointToRay(coord, this._renderer.camera, out);
    }

    /**
     * pick位置，返回和地图平面相交的vec3
     * @param location 屏幕坐标
     * @param out 
     */
    public pickVec3 (location: ICartesian2Like, out?: Vector3) {
        out = out || new Vector3();
        const pickRay = this.getPickRay(location, tempRay);
        pickRay.intersectPlane(Transform.MAP_PLANE, out);
        return out;
    }

    /**
     * pick位置,返回经纬度坐标
     * @param location 屏幕坐标
     */
    public pickCartographic (location: ICartesian2Like, out?: Cartographic) {
        const vec3 = this.pickVec3(location, tempVec3);
        return Transform.worldCar3ToCartographic(vec3, this._tilingScheme, out);
    }

}