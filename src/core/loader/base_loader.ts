import { Loader, LoadingManager } from "three";

export type LoadParams = {
    params?: any;
    priority?: number;//任务优先级
    throttle?: boolean;//是否需要考虑并发限制
    throttleServer?: boolean;//是否需要考虑每个服务器的并发限制
}

export class BaseLoader extends Loader {

    protected _loadParams: LoadParams = {};

    protected _loadInWorker: boolean;

    public constructor (manager?: LoadingManager) {
        super(manager);
        this._loadInWorker = false;
    }

    public setLoadParams (params: LoadParams) {
        this._loadParams = params;
    }

    public setLoadInWorker (val: boolean) {
        this._loadInWorker = val;
    }

}