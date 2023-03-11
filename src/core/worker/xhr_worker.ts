import { Utils } from "../utils/utils";
import { XHRCancelable, XHRRequestOptions, XHRResponse } from "../xhr/xhr_request";
import { BaseWorker } from "./base_worker";
import { TaskProcessor } from "./task_processor";
import XHRRequestWorkerScriptStr from "./xhr_request_worker.js";

export interface XHRWorkerRequestOptions extends XHRRequestOptions {
    //当responseType为blob时 是否在worker中返回ImageBitMap
    createImageBitMap?: boolean;
    //构建imagebitmap用的参数
    imageBitMapOptions?: ImageBitmapOptions;
}

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

    private _xhrWorker: XHRWorker;

    private _requestId: number;

    private _options: XHRRequestOptions;

    public constructor (xhrWorker: XHRWorker, requestId: number, options: XHRRequestOptions) {
        this._xhrWorker = xhrWorker;
        this._requestId = requestId;
        this._options = options;
    }

    public abort () {
        this._xhrWorker.abort(this._requestId, this._options);
    }

}

const taskMessageHandler = <P, R> (processor: TaskProcessor<P, R>, data: any) => {
    processor.activeTasks = processor.activeTasks - 1;

    let id = data.id;
    if (!Utils.defined(id)) {
        return;
    }

    let pMap = processor.promiseMap[id];

    if (Utils.defined(data.error)) {
        console.error("worker executed failed: ", data.error);
        processor.taskCompletedEvent.emit(data.error);
        pMap.reject(data.error);
    } else if (data.result.stats === "onprogress") {
        const onProgress = processor.userDataMap[id];
        onProgress && onProgress(data.result.response.total, data.result.response.loaded);
    } else {
        processor.taskCompletedEvent.emit(null);
        pMap.resolve(data.result as R);
        delete processor.promiseMap[id];
        delete processor.userDataMap[id];
    }

}

/**
 * 在worker中运行的XMLHttpRequest
 */
export class XHRWorker extends BaseWorker {

    private _init: boolean = false;

    protected _taskProcessor: TaskProcessor<InputParams, OutputParams>;

    private _requestId: number = 0;

    private _requestTaskMap: Record<number, { resolve: Function, reject: Function }> = Object.create(null);

    private init () {
        if (this._init) return;
        this._init = true;
        this._taskProcessor = new TaskProcessor(XHRRequestWorkerScriptStr, taskMessageHandler);
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
    public create (options: XHRWorkerRequestOptions) {
        options = this.handleOptions(options, ["cancelToken", "onProgress"]);
        this.init();
        return new Promise<XHRResponse>((resolve, reject) => {
            const requestId = ++this._requestId;
            let canceled = false;
            if (options.cancelToken) {
                options.cancelToken.httpRequest = new XHRWorkerCancelToken(this, requestId, options);
                canceled = options.cancelToken.canceled;
            }
            if (!canceled) {
                this._requestTaskMap[requestId] = { resolve: resolve, reject: reject };
                const sendOpt = Object.assign(Object.create(null), options);
                delete sendOpt.cancelToken;
                delete sendOpt.onProgress;
                this._taskProcessor.scheduleTask({
                    requestId: requestId,
                    taskType: TaskType.EXECUTE,
                    options: sendOpt
                }, null, options.onProgress).then(res => {
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
                    abort: true,
                    config: options
                }
                resolve(response);
            }

        });
    }

    /**
     * 终止请求
     * @param requestId 
     */
    public abort (requestId: number, options?: XHRRequestOptions) {
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
                    abort: true,
                    //@ts-ignore
                    config: options || {}
                }
                item.resolve(response);
            }
        }).catch(err => {
            console.error(`abort xhr worker failed.`, err);
        });
    }

}
