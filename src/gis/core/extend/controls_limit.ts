import { Vector3 } from "three";
import { SystemEventType } from "../../../@types/core/system/system";
import { FrameRenderer } from "../../../core/renderer/frame_renderer";
import { eventSystem } from "../../../core/system/event_system";
import { interactionSystem } from "../../../core/system/interaction_system";
import { EarthScene } from "../scene/earth_scene";

/**
 * 对MapControls做一些限制
 */
export class ControlsLimit {

    private _renderer: FrameRenderer;

    private _scene: EarthScene;

    public constructor (renderer: FrameRenderer, scene: EarthScene) {
        this._renderer = renderer;
        this._scene = scene;
    }

    public limit () {
        const input = eventSystem.getInput(this._renderer);
        input.on(SystemEventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(SystemEventType.MOUSE_WHEEL, this.onMouseWheel, this);
    }

    private onMouseDown (event: MouseEvent) {
        interactionSystem.updateControlsTarget(this._renderer);
        //开启相机的lookAt
        interactionSystem.updateControlsProps(this._renderer, { shouldLookAt: true });
    }

    private onMouseWheel (event: WheelEvent) {
        //禁用相机的lookAt 使其能够沿着当前鼠标位置的中心点缩放
        interactionSystem.updateControlsProps(this._renderer, { shouldLookAt: false });
        //滚轮聚焦的点
        interactionSystem.updateControlsTarget(this._renderer, { x: event.clientX, y: event.clientY });
    }

}
