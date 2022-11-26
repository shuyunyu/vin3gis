import { XHRRequestOptions, XHRResponse } from "../../xhr_request";
import { RequestServer } from "../request_server";

//请求任务优先级
export enum RequestTaskPriority {
    LOW = 0,
    MEDIUM = 1000,
    HIGH = 10000
}

//请求类型
export type RequestTaskType = string;

//请求任务状态
export enum RequestTaskStatus {
    SUCCESS,
    ABORT,
    ERROR
}

//请求任务结果
export type RequestTaskResult = {
    response?: XHRResponse;
    error?: any;
    status: RequestTaskStatus;
    taskType: RequestTaskType;
}

export interface RequestTaskOptions extends XHRRequestOptions {
    taskType: RequestTaskType;//任务类型
    priority?: number;//任务优先级
    throttle?: boolean;//是否需要考虑并发限制
    throttleServer?: boolean;//是否需要考虑每个服务器的并发限制
    onComplete: (result: RequestTaskResult) => void; //任务完成时的回调
}

//定义被 RequestSchedulere调度的任务
//主要是为了使得requestTask.execute方法不在RequestScheduler的外部调用
export interface IScheduleRequestTask {
    priority: number;//任务优先级
    readonly taskType: RequestTaskType;//任务类型
    readonly throttle: boolean;//是否需要考虑并发限制
    readonly throttleServer: boolean;//是否需要考虑每个服务器的并发限制
    readonly server: RequestServer;//请求的服务器
    readonly isValid: boolean;//该请求是否有效
    abort: () => void;//终止此任务
}