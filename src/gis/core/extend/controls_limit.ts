import { SystemEventType } from "../../../@types/core/system/system";
import { FrameRenderer } from "../../../core/renderer/frame_renderer";
import { eventSystem } from "../../../core/system/event_system";
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

    }

}
