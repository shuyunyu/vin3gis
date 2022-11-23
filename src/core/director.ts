import { Event } from "./event/event";
import { System } from "./system/system";

export class Director extends Event {

    private static _instance?: Director;

    public static get instance () {
        if (this._instance) return this._instance;
        this._instance = new Director();
        return this._instance;
    }

    //初始化事件
    public static readonly EVENT_INIT = "director_init";

    //一帧开始时所触发的事件
    public static readonly EVENT_BEGIN_FRAME = "director_begine_frame";

    //一帧结束时所触发的事件
    public static readonly EVENT_END_FRAME = "director_end_frame";

    //绘制一帧
    public static readonly EVENT_DRAW_FRAME = "director_draw_frame";

    private _startTime: number;

    private _deltaTime: number;

    private _systems: System[] = [];

    private constructor () {
        super();
    }

    /**
     * 初始化
     */
    public init () {
        this._systems.forEach(sys => sys.init());
        this._startTime = performance.now();
        requestAnimationFrame(() => this.step());
        this.dispatchEvent(Director.EVENT_INIT);
    }

    /**
     * 单步调用
     */
    private step () {
        this.tick(this.calcDeltaTime());
        requestAnimationFrame(() => this.step());
    }

    /**
     * 执行主逻辑
     * @param dt 
     */
    private tick (dt: number) {
        this.dispatchEvent(Director.EVENT_BEGIN_FRAME);
        this._systems.forEach(sys => sys.update(dt));
        this._systems.forEach(sys => sys.postUpdate(dt));
        this.dispatchEvent(Director.EVENT_DRAW_FRAME);
        this.dispatchEvent(Director.EVENT_END_FRAME);
    }

    /**
     * 计算两帧之间的时间差
     * @returns 
     */
    private calcDeltaTime () {
        const now = performance.now();
        this._deltaTime = now > this._startTime ? (now - this._startTime) / 1000 : 0;
        this._startTime = now;
        return this._deltaTime;
    }

    /**
     * 注册系统
     * @param system 
     */
    public registerSystem (system: System) {
        if (this._systems.indexOf(system) === -1) {
            this._systems.push(system);
            this._systems.sort((s1, s2) => s2.priority - s1.priority);
        }
    }

}

export const director = Director.instance;