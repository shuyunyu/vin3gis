import { RequestTaskType } from "./@types/request";
import { RequestTask } from "./request_task";

/**
 * 请求管理对象
 * 并发请求管理对象
 */
export class RequestScheduler {

    private static _instance?: RequestScheduler;

    public static get instance () {
        if (this._instance) return this._instance;
        this._instance = new RequestScheduler();
        return this._instance;
    }

    private constructor () { }

    //最大并发量
    public static maxConcurrency: number = 20;

    //每台服务器最大并发数
    public static maxServerConcurrency: number = 5;

    //每帧发出的最大请求量
    public static maxFrameRequestCount: number = 10;

    //当前正在进行的请求数量
    private static _curRequestCount: number;

    //记录任务类型对应的任务排序方法
    private _taskTypeCompareFnMap: Map<RequestTaskType, (a: RequestTask, b: RequestTask) => number> = Object.create(null);

    //默认的任务排序方法
    private _defaultTaskCompareFn = (a: RequestTask, b: RequestTask) => a.priority = b.priority;

    //任务类型->任务
    private _taskTypeMap: Map<RequestTaskType, RequestTask[]> = Object.create(null);

    //存放需要重新入队的请求
    private _toReEnqueueTasks: RequestTask[] = [];

    /**
     * 设置任务类型中的任务排序方法
     * @param taskType 
     * @param compare 
     */
    public setTaskTypeCompareFn (taskType: RequestTaskType, compare: (a: RequestTask, b: RequestTask) => number) {
        this._taskTypeCompareFnMap[taskType] = compare;
    }

    /**
     * 需要逐帧调用此方法
     */
    public update () {
        let reqCount = 0;
        this._taskTypeMap.forEach((tasks: RequestTask[], taskType: RequestTaskType) => {
            if (reqCount < RequestScheduler.maxFrameRequestCount) {
                const compareFn = this._taskTypeCompareFnMap[taskType] || this._defaultTaskCompareFn;
                tasks.sort(compareFn);
                while (reqCount < RequestScheduler.maxFrameRequestCount && tasks.length) {
                    const task = tasks.shift();
                    //skip invalid task
                    if (!task.isValid) continue;
                    //不考虑并发
                    if (!task.throttle) {
                        if (this.checkServerThrottle(task)) {
                            this.executeRequestTask(task);
                            reqCount++;
                        } else {
                            this._toReEnqueueTasks.push(task);
                        }
                    } else {
                        //考虑并发
                        if (RequestScheduler._curRequestCount < RequestScheduler.maxConcurrency) {
                            if (this.checkServerThrottle(task)) {
                                this.executeRequestTask(task);
                                reqCount++;
                            } else {
                                this._toReEnqueueTasks.push(task);
                            }
                        } else {
                            this._toReEnqueueTasks.push(task);
                        }
                    }
                }
            }
        });
        //将需要重新入队的请求入队
        while (this._toReEnqueueTasks.length) {
            const task = this._toReEnqueueTasks.shift();
            this._taskTypeMap.get(task.taskType).push(task);
        }
    }

    /**
     * 校验对单个服务器的请求是否满足并发要求
     * @param task 
     */
    private checkServerThrottle (task: RequestTask) {
        if (!task.throttleServer) return true;
        else return task.server.curRequestCount <= RequestScheduler.maxServerConcurrency;
    }

    /**
     * 执行请求任务
     * @param task 
     */
    private executeRequestTask (task: RequestTask) {
        task.server.curRequestCount++;
        RequestScheduler._curRequestCount++;
        //TODO execute task
    }

}