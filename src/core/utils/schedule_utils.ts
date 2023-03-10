import { ISchedulable } from "../../@types/global/global";
import { scheduleSystem } from "../system/schedule_system";

class Scheduler implements ISchedulable {

    private static schedulerCount: number = 0;

    private static schedulers: Scheduler[] = [];

    public readonly uuid: string;

    public readonly scheduleId: number;

    public readonly priority: number;

    private _handler: Function;

    private _once: boolean;

    private _context?: any;

    private _args: any[];

    private _timeout: number;

    private _delayTime: number;

    private _deltaTime: number;

    public constructor (hnadler: Function, timeout: number, once: boolean = false, priority: number = 0, context?: any, args?: any[]) {
        Scheduler.schedulerCount++;
        this.uuid = "u_schedule_" + Scheduler.schedulerCount;
        this.scheduleId = Scheduler.schedulerCount;
        this.priority = priority;
        this._handler = hnadler;
        this._once = once;
        this._context = context;
        this._args = args ? [].concat(args) : [];
        //deltaTime arg
        this._args.push(0);
        this._timeout = timeout;
        this._delayTime = timeout / 1000;
        this.initScheduler();
        Scheduler.schedulers.push(this);
    }

    public update (dt: number) {
        if (this._once) {
            this.clearScheduler();
        } else {
            // calculate delay time
            if (this._delayTime > 0.0) {
                this._delayTime -= dt;
                this._deltaTime += dt;
                if (this._delayTime > 0.0) {
                    //still waiting
                    return;
                }
            }
            this._delayTime = this._timeout / 1000;
            this._args[this._args.length - 1] = this._deltaTime;
            this._deltaTime = 0;
            this._handler.apply(this._context, this._args);
        }
    }

    private initScheduler () {
        scheduleSystem.scheduleUpdate(this, false);
    }

    private clearScheduler () {
        scheduleSystem.unschedule(this);
    }

    public static removescheduler (scheduleId: number) {
        const index = Scheduler.schedulers.findIndex(t => t.scheduleId === scheduleId);
        if (index > -1) {
            const schedule = Scheduler.schedulers.splice(index, 1)[0];
            schedule.clearScheduler();
        }
    }

}

/**??????schedule??????????????????,??????setInterval?????????????????? */
export const createScheduler = (handler: Function, timeout: number, context?: any, args?: any[]) => {
    return new Scheduler(handler, timeout, false, 0, context, args).scheduleId;
}

/**???????????????,???createScheduler??????????????? */
export const removeScheduler = (schedulerId: number) => {
    Scheduler.removescheduler(schedulerId);
}

/**??????schedule??????????????????,??????setTimeout?????????????????? */
export const createSchedulerOnce = (handler: Function, timeout: number, context?: any, args?: any[]) => {
    return new Scheduler(handler, timeout, true, 0, context, args).scheduleId;
}

/**???????????????,???createSchedulerOnce??????????????? */
export const removeSchedulerOnce = (schedulerId: number) => {
    Scheduler.removescheduler(schedulerId);
}
