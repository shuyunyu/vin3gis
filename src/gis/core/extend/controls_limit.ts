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

    }

    private onMouseWheel (event: WheelEvent) {
        //滚轮聚集的点
        const focusVec3 = this._scene.camera.pickVec3({ x: event.clientX, y: event.clientY }, new Vector3());
        interactionSystem.setControlsTarget(this._renderer, focusVec3);
    }

}
