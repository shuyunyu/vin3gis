import { xhrWorkerPool } from "../../worker/pool/xhr_worker_pool";
import { XHRCancelToken, XHRRequest, XHRResponse, XHRResponseType } from "../xhr_request";
import { RequestTaskOptions, RequestTaskPriority, RequestTaskStatus, RequestTaskType } from "./@types/request";
import { RequestServer } from "./request_server";

/**
 * 单个请求任务
 */
export class RequestTask {

    public static DEBUG = true;

    //单个请求任务完成时的回调
    public static onTaskComplete?: (task: RequestTask) => void;

    public requestInWorker: boolean;

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

    private _isValid: boolean = true;

    //标识 是否是有效的请求
    //没有被取消
    public get isValid () {
        return this._isValid;
    }

    //标识是否是图片请求任务
    private _imageTask: boolean;

    public get imageTask () {
        return this._imageTask;
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
        return new RequestTask(options);
    }

    /**
     * 初始化
     * @param options 
     */
    private init (options: RequestTaskOptions) {
        this.requestInWorker = options.requestInWorker ?? false;
        this._taskType = options.taskType;
        this.priority = options.priority ?? RequestTaskPriority.LOW;
        this._imageTask = options.imageTask ?? false;
        this._options = Object.assign({}, options);
        //@ts-ignore
        this._url = XHRRequest.getRequestUrl(options);
        this._server = RequestServer.getServer(this._url);
        this._isValid = true;
        this._options.cancelToken = new XHRCancelToken((cancelFunc: Function) => {
            this._cancelFunc = cancelFunc;
        });
    }

    /**
     * 执行图片请求
     */
    private executeImageTask () {
        const img = document.createElementNS('http://www.w3.org/1999/xhtml', "img") as HTMLImageElement;

        if (global.location.protocol !== 'file:') {
            img.crossOrigin = 'anonymous';
        }

        const _this = this;

        function loadCallback () {
            img.onload = null;
            img.onerror = null;
            if (_this._isValid) {
                _this._options.onComplete({
                    image: img,
                    status: RequestTaskStatus.SUCCESS,
                    taskType: _this._taskType
                });
                _this.onTaskComplete();
            } else {
                //abrot
                _this._options.onComplete({
                    status: RequestTaskStatus.ABORT,
                    taskType: _this._taskType
                });
                //abrot 的完成回调 在abort()调用时进行
                _this.onTaskComplete(false);
            }
        }

        function errorCallback () {
            img.onload = null;
            img.onerror = null;
            _this._options.onComplete({
                status: RequestTaskStatus.ERROR,
                taskType: _this._taskType
            });
            _this.onTaskComplete();
        }

        img.onload = loadCallback;
        img.onerror = errorCallback;
        img.src = this._url;
        //如果图片是从缓存中加载的 不会触发onload事件
        if (img.complete) {
            loadCallback();
        }
    }

    /**
     * 执行一般请求
     */
    private executeNormalTask () {
        (this._options.requestInWorker ? xhrWorkerPool.getInstance() : XHRRequest).create(this._options).then((response: XHRResponse) => {
            if (!response.abort) {
                //@ts-ignore
                const shouldCreateImageBitMap = this._options.responseType === XHRResponseType.BLOB && this._options.createImageBitMap && !this._options.requestInWorker;
                if (shouldCreateImageBitMap) {
                    //@ts-ignore
                    createImageBitmap(response.data, this._options.imageBitMapOptions || {}).then(imageBitMap => {
                        response.data = imageBitMap;
                        this._options.onComplete({
                            response: response,
                            status: RequestTaskStatus.SUCCESS,
                            taskType: this.taskType
                        });
                        this.onTaskComplete();
                    }).catch(err => {
                        console.log(`[${RequestTask.name}] [error]: `, err);
                        this._options.onComplete({
                            error: err,
                            status: RequestTaskStatus.ERROR,
                            taskType: this.taskType
                        });
                        this.onTaskComplete();
                    });
                } else {
                    this._options.onComplete({
                        response: response,
                        status: RequestTaskStatus.SUCCESS,
                        taskType: this.taskType
                    });
                    this.onTaskComplete();
                }
            } else {
                if (RequestTask.DEBUG) {
                    console.log(`[${RequestTask.name}] [abort]: `, response.config.url);
                }
                this._options.onComplete({
                    response: response,
                    status: RequestTaskStatus.ABORT,
                    taskType: this.taskType
                });
                this.onTaskComplete();
            }
        }).catch(err => {
            console.log(`[${RequestTask.name}] [error]: `, err);
            this._options.onComplete({
                error: err,
                status: RequestTaskStatus.ERROR,
                taskType: this.taskType
            });
            this.onTaskComplete();
        });
    }

    /**
     * 执行此任务
     */
    public execute () {
        if (this._imageTask) {
            this.executeImageTask();
        } else {
            this.executeNormalTask();
        }
        return this;
    }

    /**
     * 终止任务
     */
    public abort () {
        if (!this._isValid) return;
        this._isValid = false;
        if (this._imageTask) {
            //如果是图片请求 立即回调 以减少请求次数限制
            RequestTask.onTaskComplete && RequestTask.onTaskComplete(this);
        }
        if (this._cancelFunc) {
            this._cancelFunc();
            this._cancelFunc = null;
        }
    }

    /**
     * 请求任务完成
     */
    private onTaskComplete (callOnComplete: boolean = true) {
        if (callOnComplete) RequestTask.onTaskComplete && RequestTask.onTaskComplete(this);
        this.destroy();
    }

    /**
     * 销毁任务
     */
    private destroy () {
        this._cancelFunc = null;
        this._server = null;
        this._url = null;
        this._options = null;
        this._taskType = null;
        this.priority = null;
        this._isValid = null;
        this._imageTask = null;
    }

}