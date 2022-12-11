import { SystemDefines } from "../../@types/core/system/system";
import { TWEEN } from "../tween/Index";
import { System } from "./system";

/**
 * 缓动系统
 */
export class TweenSystem extends System {

    private static _instance?: TweenSystem;

    public static get instance () {
        if (this._instance) return this._instance;
        this._instance = new TweenSystem();
        return this._instance;
    }

    private constructor () {
        super();
        this.priority = SystemDefines.Priority.TWEEN;
    }

    public init () {

    }

    public update (dt: number) {
        TWEEN.update();
    }

}

export const tweenSystem = TweenSystem.instance;