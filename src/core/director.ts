import { Event } from "./event/event";
import { math } from "./math/math";
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

    private _frameRate = 60;

    private _frameTime = 0;

    private _delayTime = 0;

    private _startTime: number;

    private _deltaTime: number;

    private _systems: System[] = [];

    private _aniLoopFunc: () => void;

    private constructor () {
        super();
        this.setFrameRate(60);
        this._aniLoopFunc = () => {
            this.step();
        }
    }

    /**
     * 初始化
     */
    public init () {
        this._systems.forEach(sys => sys.init());
        this._startTime = performance.now();
        requestAnimationFrame(this._aniLoopFunc);
        this.dispatchEvent(Director.EVENT_INIT);
    }

    /**
     * 单步调用
     */
    private step () {
        const dt = this.calcDeltaTime();
        if (this._delayTime > 0.0) {
            this._delayTime -= dt * 1000;
        }
        if (this._delayTime <= 0.0) {
            this.tick(dt);
            this._delayTime += this._frameTime;
        }
        requestAnimationFrame(this._aniLoopFunc);
    }

    /**
     * 设置帧率
     * @param frameRate 
     */
    public setFrameRate (frameRate: number) {
        this._frameRate = math.clamp(frameRate, 1, 60);
        this._frameTime = 1000 / this._frameRate;
    }

    /**
     * 执行主逻辑
     * @param dt 
     */
    private tick (dt: number) {
        this.dispatchEvent(Director.EVENT_BEGIN_FRAME, dt);
        this._systems.forEach(sys => sys.update(dt));
        this._systems.forEach(sys => sys.postUpdate(dt));
        this.dispatchEvent(Director.EVENT_DRAW_FRAME, dt);
        this.dispatchEvent(Director.EVENT_END_FRAME, dt);
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