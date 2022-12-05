import { GenericEvent } from "../event/generic_event";
import { Utils } from "../utils/utils";
import { TransferTypedArrayTestScriptBase64 } from "./transfer_typed_array_test";

let testing: boolean = false;
let testAwiters: Record<string, Function>[] = [];

const callTestAwiterResolve = function (result: boolean) {
    for (let i = 0; i < testAwiters.length; i++) {
        const awiter = testAwiters[i];
        awiter.resolve(result);
    }
    testAwiters.length = 0;
}

const canTransferArrayBuffer = function () {
    return new Promise<boolean>((resolve, reject) => {
        if (Utils.defined(TaskProcessor.canTransferArrayBuffer)) {
            resolve(TaskProcessor.canTransferArrayBuffer!);
        } else {
            testAwiters.push({
                resolve: resolve,
                reject: reject
            });
            if (!testing) {
                testing = true;
                createWorker(TransferTypedArrayTestScriptBase64).then((worker: Worker) => {
                    let value = 99;
                    let array = new Int8Array([value]);
                    try {
                        worker.postMessage({
                            array: array,
                        },
                            [array.buffer]);
                    } catch (err) {
                        TaskProcessor.canTransferArrayBuffer = false;
                        callTestAwiterResolve(false);
                    }
                    worker.onmessage = (event) => {
                        var array = event.data.array;

                        // some versions of Firefox silently fail to transfer typed arrays.
                        // https://bugzilla.mozilla.org/show_bug.cgi?id=841904
                        // Check to make sure the value round-trips successfully.
                        var result = Utils.defined(array) && array[0] === value;

                        TaskProcessor.canTransferArrayBuffer = result;
                        worker.terminate();
                        callTestAwiterResolve(result);
                    }
                }).catch((err: any) => {
                    console.error("test canTransferArrayBuffer failed: ", err);
                    TaskProcessor.canTransferArrayBuffer = false;
                    callTestAwiterResolve(false);
                });
            }
        }
    });
}

/**
 * 创建worker
 * @param workerBase64str worker脚本的base64字符串
 * @param processor 
 * @returns 
 */
const createWorker = <P, R> (workerBase64str: string, processor?: TaskProcessor<P, R>) => {
    return new Promise<Worker>((resolve, reject) => {
        const workerScriptSrt = Utils.base64Decode(workerBase64str);
        const jsBlob = Utils.createScriptBlob(workerScriptSrt);
        let worker = new Worker(URL.createObjectURL(jsBlob));
        if (Utils.defined(processor)) {
            worker.onmessage = function (event) {
                completeTask(processor, event.data);
            }
        }
        resolve(worker);
    });

}

const completeTask = <P, R> (processor: TaskProcessor<P, R>, data: any) => {
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
    } else {
        processor.taskCompletedEvent.emit(null);
        pMap.resolve(data.result as R);
    }

    delete processor.promiseMap[id];

}



/**
 * 任务处理对象
 */
export class TaskProcessor<P, R> {

    private workerBase64str: string;

    private _maxmiumActiveTasks: number;

    public activeTasks = 0;

    public promiseMap: Record<string, Record<string, Function>> = {};

    public taskCompletedEvent = new GenericEvent<any>;

    private _nextId: number = 0;

    private _worker: Worker | undefined;

    private _workerWaiters: Record<string, Function>[] = [];

    private _creatingWorker: boolean = false;

    public static canTransferArrayBuffer: boolean | undefined;

    constructor (workerBase64str: string, maxmiumActiveTasks?: number) {
        this.workerBase64str = workerBase64str;
        this._maxmiumActiveTasks = Utils.defaultValue(maxmiumActiveTasks, Number.POSITIVE_INFINITY);
    }

    private callAwiters (err: string | undefined, worker: Worker | undefined) {
        for (let i = 0; i < this._workerWaiters.length; i++) {
            const awiter = this._workerWaiters[i];
            if (err) {
                awiter.reject(err, null);
            } else {
                awiter.resolve(null, worker);
            }
        }
        this._workerWaiters.length = 0;
    }

    private ready () {
        return new Promise<Worker>((resolve, reject) => {
            if (Utils.defined(this._worker)) {
                resolve(this._worker!);
            } else {
                this._workerWaiters.push({
                    resolve: resolve,
                    reject: reject
                })
                if (!this._creatingWorker) {
                    this._creatingWorker = true;
                    canTransferArrayBuffer().then(() => {
                        createWorker(this.workerBase64str, this).then((w: Worker) => {
                            this._worker = w;
                            this.callAwiters(undefined, this._worker);
                        }).catch((err: any) => {
                            this.callAwiters(err, undefined);
                        });
                    }).catch((err: any) => {
                        this.callAwiters(err, undefined);
                    });
                }
            }

        });
    }

    public scheduleTask (params: P, transferableObjects: Transferable[]) {
        return new Promise<R>((resolve, reject) => {
            this.ready().then(() => {
                if (this.activeTasks >= this._maxmiumActiveTasks) {
                    reject("too much tasks.");
                } else {
                    if (!Utils.defined(transferableObjects)) {
                        transferableObjects = [];
                    } else if (!TaskProcessor.canTransferArrayBuffer) {
                        transferableObjects.length = 0;
                    }
                    let id = this._nextId++;
                    this.promiseMap[id] = {
                        resolve: resolve,
                        reject: reject
                    }
                    this._worker.postMessage({
                        id: id,
                        params: params,
                        canTransferArrayBuffer: TaskProcessor.canTransferArrayBuffer,
                    }, transferableObjects);
                }
            }).catch((err: any) => {
                reject(err);
            });
        });
    }

}