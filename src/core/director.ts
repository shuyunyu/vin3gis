import { Event } from "./event/event";

export class Director extends Event {

    private static _instance?: Director;

    public static get instance () {
        if (this._instance) return this._instance;
        this._instance = new Director();
        return this._instance;
    }

    private constructor () {
        super();
        requestAnimationFrame(() => this.step());
    }

    //一帧开始时所触发的事件
    public static readonly EVENT_BEGIN_FRAME = "director_begine_frame";

    //一帧结束时所触发的事件
    public static readonly EVENT_END_FRAME = "director_end_frame";

    //绘制一帧
    public static readonly EVENT_DRAW_FRAME = "director_draw_frame";

    private step () {
        this.tick(0);
        requestAnimationFrame(() => this.step());
    }

    public tick (dt: number) {
        this.dispatchEvent(Director.EVENT_BEGIN_FRAME);
        this.dispatchEvent(Director.EVENT_DRAW_FRAME);
        this.dispatchEvent(Director.EVENT_END_FRAME);
    }

}

export const director = Director.instance;