import { Euler, Quaternion, Ray, Vector3 } from "three";
import { FrameRenderer } from "../../../core/renderer/frame_renderer";
import { CameraUtils } from "../../../core/utils/camera_utils";
import { RayUtils } from "../../../core/utils/ray_utils";
import { ICartesian2Like } from "../../@types/core/gis";
import { Cartographic } from "../cartographic";
import { ViewPort } from "../misc/view_port";
import { FrameState } from "../scene/frame_state";
import { ITilingScheme } from "../tilingscheme/tiling_scheme";
import { Transform } from "../transform/transform";

const tempRay = new Ray();

const tempVec3 = new Vector3();

/**
 * 定义地图相机
 */
export class EarthCamera {

    private _renderer: FrameRenderer;

    private _tilingScheme: ITilingScheme;

    public constructor (renderer: FrameRenderer, tilingScheme: ITilingScheme) {
        this._renderer = renderer;
        this._tilingScheme = tilingScheme;
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
        this._renderer.updateCameraRTS({ position, rotation });
    }

    /**
     * 获取pick用的射线
     * @param location 
     * @param out 
     */
    public getPickRay (location: ICartesian2Like, out?: Ray) {
        return CameraUtils.screenPointToRay(location, this._renderer.camera, out);
    }

    /**
     * pick位置
     * @param location 
     */
    public pickPosition (location: ICartesian2Like, out?: Cartographic) {
        const pickRay = this.getPickRay(location, tempRay);
        const distance = pickRay.distanceToPlane(Transform.MAP_PLANE);
        const vec3 = RayUtils.computeHit(pickRay, distance, tempVec3);
        return Transform.worldCar3ToCartographic(vec3, this._tilingScheme, out);
    }

}