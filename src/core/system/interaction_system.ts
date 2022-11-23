import CameraControls from "camera-controls";
import * as THREE from "three";
import { SystemDefines } from "../../@types/core/system/system";
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

    private _rendererControls: { renderer: FrameRenderer, controls: CameraControls }[] = [];

    private constructor () {
        super();
        this.priority = SystemDefines.Priority.INTERACTION;
    }

    public init () {
        CameraControls.install({ THREE: THREE });
    }

    /**
     * 开启交互
     * @param target 
     */
    public enableInteraction (target: FrameRenderer) {
        const index = this.findControlsIndex(target)
        if (index === -1) {
            const controls = new CameraControls(target.camera, target.interactionElement);
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
        this._rendererControls.forEach(rc => rc.controls.update(dt));
    }

}

export const interactionSystem = InteractionSystem.instance;