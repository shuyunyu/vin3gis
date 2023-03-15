import { Cache, LoadingManager } from "three";
import { SystemDefines } from "../../@types/core/system/system";
import { requestSystem } from "../system/request_system";
import { Utils } from "../utils/utils";
import { RequestTaskResult, RequestTaskStatus } from "../xhr/scheduler/@types/request";
import { XHRResponseType } from "../xhr/xhr_request";
import { BaseLoader } from "./base_loader";

export namespace FileLoaderDefines {
    export type OnLoad = (result: any) => void;

    export type OnProgress = (total: number, loaded: number) => void;

    export type OnError = (err: any) => void;
}

const loading: Record<string, {
    onLoad?: FileLoaderDefines.OnLoad,
    onProgress?: FileLoaderDefines.OnProgress,
    onError?: FileLoaderDefines.OnError
}[]> = {};

/**
 * 接入requestSystem的FileLoader
 */
export class FileLoader extends BaseLoader {

    private _responseType: XHRResponseType;

    public constructor (manager?: LoadingManager) {
        super(manager);
        this._loadInWorker = false;
    }

    public setResponseType (responseType: XHRResponseType) {
        this._responseType = responseType;
    }

    public load (url: string, onLoad?: FileLoaderDefines.OnLoad, onProgress?: FileLoaderDefines.OnProgress, onError?: FileLoaderDefines.OnError) {
        url = Utils.defined(url) ? url : '';
        if (Utils.defined(this.path)) url = this.path + url;
        url = this.manager.resolveURL(url);
        const cached = Cache.get(url);
        if (Utils.defined(cached)) {
            this.manager.itemStart(url);
            setTimeout(() => {
                if (onLoad) onLoad(cached);
                this.manager.itemEnd(url);
            }, 0);
            return cached;
        }

        //检查当前url是否正在load
        if (Utils.defined(loading[url])) {
            loading[url].push({
                onLoad: onLoad,
                onProgress: onProgress,
                onError: onError
            });
            return;
        }

        loading[url] = [];

        loading[url].push({
            onLoad: onLoad,
            onProgress: onProgress,
            onError: onError
        });

        requestSystem.request(Object.assign({
            url: url,
            headers: this.getHeaders(),
            withCredentials: this.withCredentials,
            responseType: this._responseType,
            taskType: SystemDefines.RequestTaskeType.FILE_LOADER,
            requestInWorker: this._loadInWorker,
            onProgress: (totalBytes: number, loadedBytes: number) => {
                if (onProgress) onProgress(totalBytes, loadedBytes);
            },
            onComplete: (res: RequestTaskResult) => {
                const callbacks = loading[url];
                delete loading[url];
                if (res.status === RequestTaskStatus.SUCCESS) {
                    const data = res.response.data;
                    Cache.add(url, data);
                    for (let i = 0; i < callbacks.length; i++) {
                        const cb = callbacks[i];
                        if (cb.onLoad) cb.onLoad(data);
                    }
                } else {
                    for (let i = 0; i < callbacks.length; i++) {
                        const callback = callbacks[i];
                        if (callback.onError) callback.onError(res.response.message);
                    }
                    this.manager.itemError(url);
                }
                this.manager.itemEnd(url);
            }
        }, this._loadParams));

        this.manager.itemStart(url);

    }

    private getHeaders () {
        const headers: Record<string, string> = {};
        if (Utils.defined(this.requestHeader)) {
            for (const header in this.requestHeader) {
                if (Object.prototype.hasOwnProperty.call(this.requestHeader, header)) {
                    const val = this.requestHeader[header];
                    header[header] = val;
                }
            }
        }
        return headers;
    }

}