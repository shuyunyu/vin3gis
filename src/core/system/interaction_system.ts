import { SystemDefines } from "../../@types/core/system/system";
import { OrbitControls } from "../controls/obrit_controls";
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

    private _rendererControls: { renderer: FrameRenderer, controls: OrbitControls }[] = [];

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
    public enableInteraction (target: FrameRenderer) {
        const index = this.findControlsIndex(target)
        if (index === -1) {
            const controls = new OrbitControls(target.camera, target.interactionElement);
            this._rendererControls.push({ renderer: target, controls: controls });
        } else {
            //@ts-ignore
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
            //@ts-ignore
            rc.controls.dispose();
        }
    }

    private findControlsIndex (target: FrameRenderer) {
        return this._rendererControls.findIndex(rc => rc.renderer === target);
    }

    public update (dt: number) {
        //@ts-ignore
        this._rendererControls.forEach(rc => rc.controls.update());
    }

}

export const interactionSystem = InteractionSystem.instance;