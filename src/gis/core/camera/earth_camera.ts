import { FrameRenderer } from "../../../core/renderer/frame_renderer";
import { ViewPort } from "../misc/view_port";
import { FrameState } from "../scene/frame_state";

export class EarthCamera {

    private _renderer: FrameRenderer;

    public constructor (renderer: FrameRenderer) {
        this._renderer = renderer;
    }

    public postRender (dt: number, frameState: FrameState) {

    }

    /**
     * 设置观察点
     * @param viewPort 
     */
    public setViewPort (viewPort: ViewPort) {

    }

}