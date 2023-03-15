import { Cache, LoadingManager } from "three";
import { SystemDefines } from "../../@types/core/system/system";
import { requestSystem } from "../system/request_system";
import { RequestTaskResult, RequestTaskStatus } from "../xhr/scheduler/@types/request";
import { XHRResponseType } from "../xhr/xhr_request";
import { BaseLoader } from "./base_loader";

type OnLoad = (imageBitmap: ImageBitmap) => void;

type OnProgress = (total: number, loaded: number) => void;

type OnError = (err: any) => void;

export class ImageBitmapLoader extends BaseLoader {

    public isImageBitmapLoader = true;

    private _options?: ImageBitmapOptions;

    public constructor (manager?: LoadingManager) {

        super(manager);

        if (typeof createImageBitmap === 'undefined') {

            console.warn('THREE.ImageBitmapLoader: createImageBitmap() not supported.');

        }

        this._options = { premultiplyAlpha: 'none' };

    }

    public setOptions (options?: ImageBitmapOptions) {

        this._options = options;

        return this;

    }

    public load (url: string, onLoad?: OnLoad, onProgress?: OnProgress, onError?: OnError) {

        if (url === undefined) url = '';

        if (this.path !== undefined) url = this.path + url;

        url = this.manager.resolveURL(url);

        const scope = this;

        const cached = Cache.get(url);

        if (cached !== undefined) {

            scope.manager.itemStart(url);

            setTimeout(function () {

                if (onLoad) onLoad(cached);

                scope.manager.itemEnd(url);

            }, 0);

            return cached;

        }

        scope.manager.itemStart(url);
        requestSystem.request(Object.assign({
            url: url,
            requestInWorker: this._loadInWorker,
            //@ts-ignore
            imageBitMapOptions: this._options,
            //@ts-ignore
            createImageBitMap: true,
            taskType: SystemDefines.RequestTaskeType.IMAGE,
            imageTask: false,
            responseType: XHRResponseType.BLOB,
            onProgress: (total: number, loaded: number) => {
                if (onProgress) {
                    onProgress(total, loaded);
                }
            },
            onComplete: (result: RequestTaskResult) => {
                if (result.status === RequestTaskStatus.SUCCESS) {
                    const image = result.response.data as ImageBitmap;
                    Cache.add(url, image);
                    if (onLoad) onLoad(image);
                    scope.manager.itemEnd(url);
                } else {
                    if (onError) {
                        onError(result.error);
                    }
                    scope.manager.itemError(result.error);
                    scope.manager.itemEnd(url);
                }
            }
        }, this._loadParams));

    }

}
