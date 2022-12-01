import { Euler, Quaternion } from "three";
import { FrameRenderer } from "../../../core/renderer/frame_renderer";
import { ViewPort } from "../misc/view_port";
import { FrameState } from "../scene/frame_state";
import { ITilingScheme } from "../tilingscheme/tiling_scheme";
import { Transform } from "../transform/transform";

export class EarthCamera {

    private _renderer: FrameRenderer;

    private _tilingScheme: ITilingScheme;

    public constructor (renderer: FrameRenderer, tilingScheme: ITilingScheme) {
        this._renderer = renderer;
        this._tilingScheme = tilingScheme;
    }

    public postRender (dt: number, frameState: FrameState) {

    }

    /**
     * 设置观察点
     * @param viewPort 
     */
    public setViewPort (viewPort: ViewPort) {
        let destination = viewPort.cartogarphic;
        let orientation = viewPort.orientation;
        const position = Transform.cartographicToWorldVec3(destination, this._tilingScheme);
        const rotation = new Quaternion().setFromEuler(new Euler(orientation.pitch, orientation.yaw, orientation.roll));
        this._renderer.updateCameraRTS({ position, rotation });
    }

}