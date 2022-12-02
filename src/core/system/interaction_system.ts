import { IOrbitControls } from "../../@types/core/controls/controls";
import { SystemDefines } from "../../@types/core/system/system";
import { MapControls, OrbitControls } from "../controls/orbit_controls";
import { FrameRenderer } from "../renderer/frame_renderer";
import { System } from "./system";

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
            }
        }
    }

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
        const index = this.findControlsIndex(target)
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

            //set controls's prop
            if (interactionConfig.prop) {
                for (let key in interactionConfig.prop) {
                    const val = interactionConfig.prop[key];
                    //if prop val is object like mouseButtons
                    if (typeof val === "object") {
                        for (let k in val) {
                            controls[key][k] = val[k];
                        }
                    } else {
                        controls[key] = val;
                    }
                }
            }

            this._rendererControls.push({ renderer: target, controls: controls });
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

    private findControlsIndex (target: FrameRenderer) {
        return this._rendererControls.findIndex(rc => rc.renderer === target);
    }

    public update (dt: number) {
        this._rendererControls.forEach(rc => rc.controls.update());
    }

}

export const interactionSystem = InteractionSystem.instance;