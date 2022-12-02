import { SystemDefines } from "../../@types/core/system/system";
import { GenericEvent } from "../event/generic_event";
import { FrameRenderer } from "../renderer/frame_renderer";
import { System } from "./system";

/**
 * 渲染系统
 */
export class RendererSystem extends System {

    private static _instance?: RendererSystem;

    public static get instance () {
        if (this._instance) return this._instance;
        this._instance = new RendererSystem();
        return this._instance;
    }

    private _renderers: FrameRenderer[] = [];

    //添加渲染对象时 触发的事件
    public readonly rendererTargetAddEvent = new GenericEvent<FrameRenderer>;

    //移除渲染对象时 触发的事件
    public readonly rendererTargetRemoveEvent = new GenericEvent<FrameRenderer>;

    private constructor () {
        super();
        this.priority = SystemDefines.Priority.HIGH;
    }

    public init (): void {
        global.addEventListener('resize', () => this.onWindowResize());
    }

    private onWindowResize () {
        this._renderers.forEach(r => r.updateRenderSize());
    }

    /**
     * 添加渲染目标
     * @param target 
     */
    public addRenderTarget (target: FrameRenderer) {
        if (this._renderers.indexOf(target) === -1) {
            this._renderers.push(target);
            target.updateRenderSize();
            this.rendererTargetAddEvent.emit(target);
        }
    }

    /**
     * 移除渲染目标
     * @param target 
     */
    public removeRenderTarget (target: FrameRenderer) {
        const index = this._renderers.indexOf(target);
        if (index > -1) {
            this._renderers.splice(index, 1)[0].destroy();
            this.rendererTargetRemoveEvent.emit(target);
        }
    }

    public update (dt: number): void {
        this._renderers.forEach(r => r.update(dt));
    }

}

export const rendererSystem = RendererSystem.instance;