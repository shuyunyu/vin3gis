import { XHRRequestOptions, XHRResponse } from "../../xhr_request";

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