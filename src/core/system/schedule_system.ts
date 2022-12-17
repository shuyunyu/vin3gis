import { SystemDefines } from "../../@types/core/system/system";
import { ISchedulable } from "../../@types/global/global";
import { System } from "./system";

type Scheduler = {
    pause: boolean;
    scheduler: ISchedulable;
}

/**
 * 调度系统
 * - 调度各种动态创建的定时器 延时器
 */
export class ScheduleSystem extends System {

    private static _instance?: ScheduleSystem;

    public static get instance () {
        if (this._instance) return this._instance;
        this._instance = new ScheduleSystem();
        return this._instance;
    }

    /**
     * 所有调度器对象
     */
    private _schedulerList: Scheduler[] = [];

    private constructor () {
        super();
        this.priority = SystemDefines.Priority.SCHEDULE;
    }

    public init () {

    }

    public update (dt: number) {
        this._schedulerList.forEach(s => !s.pause && s.scheduler.update(dt));
    }

    /**
     * 为指定对象设置update定时器
     * @param scheduler 
     * @param pause 是否一开始处于暂停状态
     */
    public scheduleUpdate (scheduler: ISchedulable, pause: boolean = false) {
        this.unschedule(scheduler);
        this._schedulerList.push({ pause: pause, scheduler: scheduler });
        this._schedulerList.sort((s1, s2) => s1.scheduler.priority - s2.scheduler.priority);
    }

    /**
     * 取消指定对象的update定时器
     * @param scheduler 
     */
    public unschedule (scheduler: ISchedulable) {
        const index = this._schedulerList.findIndex(item => item.scheduler === scheduler);
        if (index > -1) {
            this._schedulerList.splice(index, 1);
        }
    }

}

export const scheduleSystem = ScheduleSystem.instance;