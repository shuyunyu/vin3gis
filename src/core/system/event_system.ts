import { SystemDefines } from "../../@types/core/system/system";
import { Input } from "../input/input";
import { FrameRenderer } from "../renderer/frame_renderer";
import { rendererSystem } from "./renderer_system";
import { System } from "./system";

/**
 * 事件系统
 */
export class EventSystem extends System {

    private static _instance?: EventSystem;

    public static get instance () {
        if (this._instance) return this._instance;
        this._instance = new EventSystem();
        return this._instance;
    }

    private _inputs: Input[] = [];

    private constructor () {
        super();
        this.priority = SystemDefines.Priority.EVENT_SYSTEM;
    }

    public init (): void {
        rendererSystem.rendererTargetAddEvent.addEventListener(this.onRendererTargetAdd, this);
        rendererSystem.rendererTargetRemoveEvent.addEventListener(this.onRendererTargetRemove, this);
    }

    /**
     * 根据渲染目标获取输入对象
     * @exapmle eventSystem.getInput(target).on....
     * @param rendererTarget 
     * @returns 
     */
    public getInput (rendererTarget: FrameRenderer): Input | null {
        return this._inputs.find(d => d.dom === rendererTarget.domElement);
    }

    private onRendererTargetAdd (rendererTarget: FrameRenderer) {
        const oldInput = this.getInput(rendererTarget);
        if (!oldInput) {
            const input = new Input(rendererTarget.domElement);
            this._inputs.push(input);
        }
    }

    private onRendererTargetRemove (rendererTarget: FrameRenderer) {
        const index = this._inputs.findIndex(d => d.dom === rendererTarget.domElement);
        if (index > -1) {
            const input = this._inputs.splice(index, 1)[0];
            input.destroy();
        }
    }

}

export const eventSystem = EventSystem.instance;