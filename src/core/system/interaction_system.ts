import { Plane, Ray, Vector3 } from "three";
import { ControlsProperty, IOrbitControls } from "../../@types/core/controls/controls";
import { SystemDefines } from "../../@types/core/system/system";
import { Partial, RTS } from "../../@types/global/global";
import { ICartesian2Like } from "../../gis/@types/core/gis";
import { Cartesian2 } from "../../gis/core/cartesian/cartesian2";
import { VecConstants } from "../constants/vec_constants";
import { MapControls, OrbitControls } from "../controls/orbit_controls";
import { math } from "../math/math";
import { FrameRenderer } from "../renderer/frame_renderer";
import { CameraUtils } from "../utils/camera_utils";
import { DeviceCoordUtils } from "../utils/device_coord_util";
import { System } from "./system";

const tempRay = new Ray();
const tempCar2 = new Cartesian2();

/**
 * 交互系统
 */
export class InteractionSystem extends System {

    private static _instance?: InteractionSystem;

    public static get instance () {
        if (this._instance) return;
        this._instance = new InteractionSystem();
        return this._instance;
    }

    //默认交互配置
    private _config: SystemDefines.InteractionConfig = {
        type: SystemDefines.InteractionType.MAP,
        prop: {
            enableDamping: true,
            mouseButtons: {
                MIDDLE: undefined
            },
            minPolarAngle: math.toRadians(0),
            maxPolarAngle: math.toRadians(89.8)
        }
    }

    //y(xz)平面
    private _planeY = new Plane(VecConstants.UNIT_Y_VEC3);

    private _rendererControls: { renderer: FrameRenderer, controls: IOrbitControls }[] = [];

    private constructor () {
        super();
        this.priority = SystemDefines.Priority.INTERACTION;
    }

    public init () {

    }

    /**
     * 开启交互
     * @param target 
     */
    public enableInteraction (target: FrameRenderer, interactionConfig?: SystemDefines.InteractionConfig) {
        const index = this.findControlsIndex(target);
        if (index === -1) {
            interactionConfig = interactionConfig ?? this._config;
            let controls: IOrbitControls;
            if (interactionConfig.type === SystemDefines.InteractionType.ORBIT) {
                //@ts-ignore
                controls = new OrbitControls(target.camera, target.interactionElement) as IOrbitControls
            } else {
                //@ts-ignore
                controls = new MapControls(target.camera, target.interactionElement) as IOrbitControls;
            }

            this._rendererControls.push({ renderer: target, controls: controls });

            //set controls's prop
            if (interactionConfig.prop) {
                this.updateControlsProps(target, interactionConfig.prop);
            }

        } else {
            this._rendererControls[index].controls.enabled = true;
        }
    }

    /**
     * 禁用交互
     * @param target 
     */
    public disableInteraction (target: FrameRenderer) {
        const index = this.findControlsIndex(target);
        if (index > -1) {
            const rc = this._rendererControls.splice(index, 1)[0];
            rc.controls.dispose();
        }
    }

    /**
     * 更新相机的rts
     * @param rts 
     */
    public updateCameraRTS (target: FrameRenderer, rts: Partial<RTS>) {
        let needUpdate = false;
        if (rts.position) {
            target.camera.position.copy(rts.position);
            needUpdate = true;
        }
        if (rts.rotation) {
            target.camera.quaternion.copy(rts.rotation);
            needUpdate = true;
        }
        if (rts.scale) {
            needUpdate = true;
            target.camera.scale.copy(rts.scale);
        }
        if (needUpdate) {
            target.camera.matrixWorldNeedsUpdate = true;
            target.camera.updateMatrixWorld();
            this.updateControlsTarget(target);
        }
    }

    /**
     * 更新controls的目标点
     * @param target 
     */
    public updateControlsTarget (target: FrameRenderer, screenCoord?: ICartesian2Like) {
        const c = this.findControls(target);
        if (c) {
            const ray = screenCoord ? CameraUtils.screenPointToRay(DeviceCoordUtils.coordToNDCCoord(screenCoord, target.domElement, tempCar2), target.camera, tempRay) : CameraUtils.screenCenterToRay(target.camera, tempRay);
            const intersectVec = ray.intersectPlane(this._planeY, new Vector3());
            if (intersectVec) {
                c.controls.target = intersectVec;
                c.controls.saveState();
            }
        }
    }

    /**
     * 更新控制器的属性
     * @param target 
     * @param props 
     */
    public updateControlsProps (target: FrameRenderer, prop: ControlsProperty) {
        const c = this.findControls(target);
        if (!c) return;
        for (let key in prop) {
            const val = prop[key];
            //if prop val is object like mouseButtons
            if (typeof val === "object") {
                for (let k in val) {
                    c.controls[key][k] = val[k];
                }
            } else {
                c.controls[key] = val;
            }
        }
    }

    /**
     * 查找controls
     * @param target 
     * @returns 
     */
    private findControls (target: FrameRenderer) {
        return this._rendererControls.find(rc => rc.renderer === target);
    }

    /**
     * 查找controls的索引
     * @param target 
     * @returns 
     */
    private findControlsIndex (target: FrameRenderer) {
        return this._rendererControls.findIndex(rc => rc.renderer === target);
    }

    public update (dt: number) {
        this._rendererControls.forEach(rc => rc.controls.update());
    }

}

export const interactionSystem = InteractionSystem.instance;