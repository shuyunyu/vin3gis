import { XHRCancelToken, XHRRequest, XHRResponse } from "../xhr_request";
import { RequestTaskOptions, RequestTaskPriority, RequestTaskStatus, RequestTaskType } from "./@types/request";
import { RequestServer } from "./request_server";

/**
 * 单个请求任务
 */
export class RequestTask {

    public static DEBUG = true;

    //任务池
    private static _taskPool: RequestTask[] = [];

    //任务池大小
    public static MAX_POOL_SIZE = 100;

    //单个请求任务完成时的回调
    public static onTaskComplete?: (task: RequestTask) => void;

    //任务类型
    private _taskType: RequestTaskType;

    public get taskType () {
        return this._taskType;
    }

    //优先级
    public priority: number;

    private _options: RequestTaskOptions;

    //是否需要考虑并发限制
    public get throttle () {
        return this._options.throttle;
    }

    //是否需要考虑每个服务器的并发限制
    public get throttleServer () {
        return this._options.throttleServer;
    }

    private _url: string;

    //请求的服务器
    private _server?: RequestServer;

    public get server () {
        return this._server;
    }

    //取消此任务的执行方法
    private _cancelFunc?: Function;

    //标识 是否是有效的请求
    //没有被取消
    public get isValid () {
        return !!this._cancelFunc;
    }

    private constructor (options: RequestTaskOptions) {
        this.init(options);
    }

    /**
     * 创建一个任务
     * @param options 
     * @returns 
     */
    public static cerate (options: RequestTaskOptions) {
        if (this._taskPool.length) {
            const rt = this._taskPool.shift();
            rt.init(options);
            return rt;
        } else {
            return new RequestTask(options);
        }
    }

    /**
     * 初始化
     * @param options 
     */
    private init (options: RequestTaskOptions) {
        this._taskType = options.taskType;
        this.priority = options.priority ?? RequestTaskPriority.LOW;
        this._options = Object.assign({}, options);
        //@ts-ignore
        this._url = XHRRequest.getRequestUrl(options);
        this._server = RequestServer.getServer(this._url);
        this._options.cancelToken = new XHRCancelToken((cancelFunc: Function) => {
            this._cancelFunc = cancelFunc;
        });
    }

    /**
     * 执行此任务
     */
    public execute () {
        XHRRequest.create(this._options).then((response: XHRResponse) => {
            if (!response.abort) {
                this._options.onComplete({
                    response: response,
                    status: RequestTaskStatus.SUCCESS,
                    taskType: this.taskType
                });
                RequestTask.onTaskComplete && RequestTask.onTaskComplete(this);
            } else {
                if (RequestTask.DEBUG) {
                    console.log(`[${RequestTask.name}] [abort]: `, response.config.url);
                }
                this._options.onComplete({
                    response: response,
                    status: RequestTaskStatus.ABORT,
                    taskType: this.taskType
                });
                RequestTask.onTaskComplete && RequestTask.onTaskComplete(this);
            }
            this.recycle();
        }).catch(err => {
            console.log(`[${RequestTask.name}] [error]: `, err);
            this._options.onComplete({
                error: err,
                status: RequestTaskStatus.ERROR,
                taskType: this.taskType
            });
            RequestTask.onTaskComplete && RequestTask.onTaskComplete(this);
        });
        return this;
    }

    /**
     * 终止任务
     */
    public abort () {
        if (this._cancelFunc) {
            this._cancelFunc();
            this._cancelFunc = null;
            this.recycle();
        }
    }

    /**
     * 回收任务
     */
    private recycle () {
        if (RequestTask._taskPool.length < RequestTask.MAX_POOL_SIZE) {
            RequestTask._taskPool.push(this);
        }
        this._cancelFunc = null;
        this._server = null;
        this._url = null;
        this._options = null;
        this._taskType = null;
        this.priority = null;
    }

}