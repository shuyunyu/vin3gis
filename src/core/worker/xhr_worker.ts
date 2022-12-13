import { XHRCancelable, XHRRequestOptions, XHRResponse } from "../xhr/xhr_request";
import { TaskProcessor } from "./task_processor";
import XHRRequestWorkerScriptStr from "./xhr_request_worker.worker";

enum TaskType {
    EXECUTE = "execute",
    ABORT = "abort"
}

type InputParams = {
    requestId: number;
    options?: XHRRequestOptions;
    taskType: TaskType;
}

enum ResponseStats {
    SUCCESS = "success",
    ABORT = "abort",
    ERROR = "error"
}

type OutputParams = {
    stats: ResponseStats;
    requestId: number;
    response?: XHRResponse
}

class XHRWorkerCancelToken implements XHRCancelable {

    private _requestId: number;

    public constructor (requestId: number) {
        this._requestId = requestId;
    }

    public abort () {
        xhrWorker.abort(this._requestId);
    }

}

/**
 * 在worker中运行的XMLHttpRequest
 */
class XHRWorker {

    private _init: boolean = false;

    private _taskProcessor: TaskProcessor<InputParams, OutputParams>;

    private _requestId: number = 0;

    private _requestTaskMap: Record<number, { resolve: Function, reject: Function }> = Object.create(null);

    private init () {
        if (this._init) return;
        this._init = true;
        this._taskProcessor = new TaskProcessor(XHRRequestWorkerScriptStr);
    }

    private handleOptions (options: XHRRequestOptions, ignoreKeys: string[]) {
        const res = Object.assign(Object.create(null), options);
        const toDelKeys = [];
        for (const key in options) {
            const element = options[key];
            if (typeof element === "function") {
                if (ignoreKeys.indexOf(key) === -1) toDelKeys.push(key);
            }
        }
        toDelKeys.forEach(key => delete res[key]);
        return res;
    }

    /**
     * 创建请求
     * @param options 
     * @returns 
     */
    public create (options: XHRRequestOptions) {
        options = this.handleOptions(options, ["cancelToken"]);
        this.init();
        return new Promise<XHRResponse>((resolve, reject) => {
            const requestId = ++this._requestId;
            let canceled = false;
            if (options.cancelToken) {
                options.cancelToken.httpRequest = new XHRWorkerCancelToken(requestId);
                canceled = options.cancelToken.canceled;
            }
            if (!canceled) {
                this._requestTaskMap[requestId] = { resolve: resolve, reject: reject };
                const sendOpt = Object.assign(Object.create(null), options);
                delete sendOpt.cancelToken;
                this._taskProcessor.scheduleTask({
                    requestId: requestId,
                    taskType: TaskType.EXECUTE,
                    options: sendOpt
                }, null).then(res => {
                    if (res.stats === ResponseStats.SUCCESS) {
                        resolve(res.response);
                    } else if (res.stats === ResponseStats.ERROR) {
                        reject(res.response);
                    } else if (res.stats === ResponseStats.ABORT) {
                        //不用处理 abort 不会被回调
                    }
                    delete this._requestTaskMap[requestId];
                }).catch(err => {
                    reject(err);
                });
            } else {
                //可能已经取消了
                //@ts-ignore
                const response: XHRResponse = {
                    data: null,
                    status: null,
                    abort: true
                }
                resolve(response);
            }

        });
    }

    /**
     * 终止请求
     * @param requestId 
     */
    public abort (requestId: number) {
        this.init();
        this._taskProcessor.scheduleTask({
            requestId: requestId,
            taskType: TaskType.ABORT
        }, null).then(res => {
            const item = this._requestTaskMap[requestId];
            delete this._requestTaskMap[requestId];
            if (item) {
                //@ts-ignore
                const response: XHRResponse = {
                    data: null,
                    status: null,
                    abort: true
                }
                item.resolve(response);
            }
        }).catch(err => {
            console.error(`abort xhr worker failed.`, err);
        });
    }

}

export const xhrWorker = new XHRWorker();