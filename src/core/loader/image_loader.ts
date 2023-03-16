import { Cache, LoadingManager } from 'three';
import { SystemDefines } from '../../@types/core/system/system';
import { requestSystem } from '../system/request_system';
import { RequestTaskResult, RequestTaskStatus } from '../xhr/scheduler/@types/request';
import { BaseLoader } from './base_loader';

type OnLoad = (image: HTMLImageElement) => void;
type OnProgress = (total: number, loaded: number) => void;
type OnError = (err: any) => void;

export class ImageLoader extends BaseLoader {

    public constructor (manager?: LoadingManager) {

        super(manager);

    }

    public load (url: string, onLoad?: OnLoad, onProgress?: OnProgress, onError?: OnError) {

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
            imageTask: true,
            taskType: SystemDefines.RequestTaskeType.IMAGE,
            onProgress: (totalBytes: number, loadedBytes: number) => {
                if (onProgress) {
                    onProgress(totalBytes, loadedBytes);
                }
            },
            onComplete: (result: RequestTaskResult) => {
                if (result.status === RequestTaskStatus.SUCCESS) {
                    const image = result.image;
                    Cache.add(url, image);
                    if (onLoad) {
                        onLoad(image);
                    }
                    scope.manager.itemEnd(url);
                } else {

                    if (onError) onError(result.error);

                    scope.manager.itemError(url);
                    scope.manager.itemEnd(url);
                }
            }
        }, this._loadParams));

    }

}
