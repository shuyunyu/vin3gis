import { SystemDefines } from "../../@types/core/system/system";
import { RequestTaskOptions } from "../xhr/scheduler/@types/request";
import { RequestScheduler } from "../xhr/scheduler/request_scheduler";
import { RequestTask } from "../xhr/scheduler/request_task";
import { System } from "./system";

/**
 * 资源请求系统
 */
export class RequestSystem extends System {

    private static _instance?: RequestSystem;

    public static get instance () {
        if (this._instance) return this._instance;
        this._instance = new RequestSystem();
        return this._instance;
    }

    //降序 任务排序方法
    public static descCompareFn = (a: RequestTask, b: RequestTask) => b.priority - a.priority;

    //升序 任务排序方法
    public static ascCompareFn = (a: RequestTask, b: RequestTask) => a.priority - b.priority;

    private constructor () {
        super();
        this.priority = SystemDefines.Priority.REQUEST;
    }

    public init () {
        RequestScheduler.setTaskTypeCompareFn(SystemDefines.RequestTaskeType.RASTER_TILE, RequestSystem.descCompareFn);
        RequestScheduler.setTaskTypeCompareFn(SystemDefines.RequestTaskeType.JSON, RequestSystem.descCompareFn);
    }

    public update (dt: number) {
        RequestScheduler.update();
    }

    /**
     * 发送xhr请求
     * @param options 
     * @returns 
     */
    public request (options: RequestTaskOptions) {
        return RequestScheduler.createRequestTask(options);
    }

}

export const requestSystem = RequestSystem.instance;