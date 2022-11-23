import { Event } from "./event/event";

export class Director extends Event {

    private static _instance?: Director;

    public static get instance () {
        if (this._instance) return this._instance;
        this._instance = new Director();
        return this._instance;
    }

    //一帧开始时所触发的事件
    public static readonly EVENT_BEGIN_FRAME = "director_begine_frame";

    //一帧结束时所触发的事件
    public static readonly EVENT_END_FRAME = "director_end_frame";

    //绘制一帧
    public static readonly EVENT_DRAW_FRAME = "director_draw_frame";

    private _startTime: number;

    private _deltaTime: number;

    private constructor () {
        super();
        this._startTime = performance.now();
        requestAnimationFrame(() => this.step());
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

}

export const director = Director.instance;