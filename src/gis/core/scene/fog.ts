import { Color, FogExp2, Scene } from "three";
import { GenericEvent } from "../../../core/event/generic_event";
import { ColorUtils } from "../../../core/utils/color_utils";

export class Fog {

    public readonly changedEvent: GenericEvent<Fog> = new GenericEvent();

    private _scene: Scene;

    private _fog: FogExp2;

    private _enable: boolean;

    public get enable () {
        return this._enable;
    }

    public set enable (val: boolean) {
        this._enable = val;
        this.update();
    }

    private _color: Color;

    public get color () {
        return this._color;
    }

    public set color (val: Color) {
        this._color = val;
        this.update();
    }

    private _density: number;

    public get density () {
        return this._density;
    }

    public set density (val: number) {
        this._density = val;
        this.update();
    }

    public constructor (scene: Scene, color: Color, density?: number) {
        this._scene = scene;
        this._color = color;
        this._density = density;
        this._enable = true;
        this._fog = new FogExp2(ColorUtils.toCSSHexString(this._color), this._density);
        this._scene.fog = this._fog;
    }

    private update () {
        this._fog.color = this._color;
        this._fog.density = this._density;
        if (!this.enable) {
            this._scene.fog = null;
        } else {
            if (this._scene.fog !== this._fog) {
                this._scene.fog = this._fog;
            }
        }
        this.changedEvent.emit(this);
    }

}