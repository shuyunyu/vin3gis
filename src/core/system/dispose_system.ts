import { SystemDefines } from "../../@types/core/system/system";
import { Engine } from "../engine";
import { System } from "./system";

/**
 * 对象销毁系统
 * - 延时销毁
 */
export class DisposeSystem extends System {

    private static _instance?: DisposeSystem;

    public static get instance () {
        if (this._instance) return this._instance
        this._instance = new DisposeSystem();
        return this._instance;
    }

    private _stack: SystemDefines.Disposable[] = [];

    //每帧销毁对象的最大个数
    public static MAX_DISPOSE_COUNT_PER_FRAME = 50;

    private _disposeCount = 0;

    private constructor () {
        super();
        this.priority = SystemDefines.Priority.DISPOSE_SYSTEM;
    }

    public init () {

    }

    public disposeObj (disposableObj: SystemDefines.Disposable) {
        this._stack.push(disposableObj);
    }

    public update () {
        this._disposeCount = 0;
        while (this._stack.length && this._disposeCount < DisposeSystem.MAX_DISPOSE_COUNT_PER_FRAME) {
            this._disposeCount++;
            const d = this._stack.shift();
            d.dispose();
        }
        if (Engine.DEBUG && this._disposeCount > 0) {
            console.log(`[${DisposeSystem.name}]: dispose obj count: ${this._disposeCount}`);
        }
    }

}

export const disposeSystem = DisposeSystem.instance;