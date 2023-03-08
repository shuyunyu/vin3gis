import { Texture } from "three";
import { AssetDefines } from "../../@types/core/asset/asset";
import { SystemDefines } from "../../@types/core/system/system";
import { requestSystem } from "../system/request_system";
import { RequestTaskResult, RequestTaskStatus } from "../xhr/scheduler/@types/request";
import { XHRResponseType } from "../xhr/xhr_request";

/**
 * 资源加载器
 */
export class AssetLoader {

    /**
     * 加载图片资源
     * @param params 
     * @returns 
     */
    public static loadImage (params: AssetDefines.LoadAssetParams) {
        return new Promise<HTMLImageElement>((resolve, reject) => {
            requestSystem.request({
                url: params.url,
                requestInWorker: params.requestInWorker,
                taskType: params.taskType || SystemDefines.RequestTaskeType.IMAGE,
                imageTask: true,
                params: params.params,
                priority: params.priority,
                throttle: params.throttle,
                throttleServer: params.throttleServer,
                onComplete: (result: RequestTaskResult) => {
                    if (result.status === RequestTaskStatus.SUCCESS) {
                        resolve(result.image);
                    } else {
                        reject("load image failed.");
                    }
                }
            });
        });
    }

    /**
     * 请求图片资源
     * @param params 
     */
    public static requestImage (params: AssetDefines.LoadAssetParams) {
        return new Promise<{ image?: HTMLImageElement, result: RequestTaskResult }>((resolve, reject) => {
            requestSystem.request({
                url: params.url,
                requestInWorker: params.requestInWorker,
                taskType: params.taskType || SystemDefines.RequestTaskeType.IMAGE,
                imageTask: true,
                params: params.params,
                priority: params.priority,
                throttle: params.throttle,
                throttleServer: params.throttleServer,
                onComplete: (result: RequestTaskResult) => {
                    if (result.status === RequestTaskStatus.SUCCESS) {
                        resolve({
                            image: result.image,
                            result: result
                        });
                    } else {
                        resolve({
                            image: null,
                            result: result
                        });
                    }
                }
            });
        });
    }

    /**
     * 请求图片的blob资源
     * @param params 
     * @returns 
     */
    public static requestImageBlob (params: AssetDefines.LoadAssetParams) {
        return new Promise<{ image?: Blob, result: RequestTaskResult }>((resolve, reject) => {
            this.requestImageBlobAsync(params, (res) => {
                resolve(res);
            })
        });
    }

    public static requestImageBlobAsync (params: AssetDefines.LoadAssetParams, cb: (res: { image?: Blob, result: RequestTaskResult }) => void) {
        return requestSystem.request({
            url: params.url,
            requestInWorker: params.requestInWorker,
            taskType: params.taskType || SystemDefines.RequestTaskeType.IMAGE,
            imageTask: false,
            params: params.params,
            priority: params.priority,
            responseType: XHRResponseType.BLOB,
            throttle: params.throttle,
            throttleServer: params.throttleServer,
            onComplete: (result: RequestTaskResult) => {
                if (result.status === RequestTaskStatus.SUCCESS) {
                    cb({
                        image: result.response.data,
                        result: result
                    });
                } else {
                    cb({
                        image: null,
                        result: result
                    });
                }
            }
        });
    }

    /**
     * 从worker中请求ImageBitMap
     * @param params 
     * @param cb 
     * @returns 
     */
    public static requestImageBitMapInWorkerAsync (params: AssetDefines.LoadImageBitMapAssetParams, cb: (res: { image?: ImageBitmap, result: RequestTaskResult }) => void) {
        return requestSystem.request({
            url: params.url,
            requestInWorker: true,
            //@ts-ignore
            imageBitMapOptions: params.imageBitMapOptions || {},
            //@ts-ignore
            createImageBitMap: true,
            taskType: params.taskType || SystemDefines.RequestTaskeType.IMAGE,
            imageTask: false,
            params: params.params,
            priority: params.priority,
            responseType: XHRResponseType.BLOB,
            throttle: params.throttle,
            throttleServer: params.throttleServer,
            onComplete: (result: RequestTaskResult) => {
                if (result.status === RequestTaskStatus.SUCCESS) {
                    cb({
                        image: result.response.data,
                        result: result
                    });
                } else {
                    cb({
                        image: null,
                        result: result
                    });
                }
            }
        });
    }

    /**
     * 加载贴图资源
     * @returns 
     */
    public static loadTexture (params: AssetDefines.LoadAssetParams) {
        return new Promise<Texture>((resolve, reject) => {
            this.loadImage(params).then((image: HTMLImageElement) => {
                const texture = new Texture();
                texture.image = image;
                texture.needsUpdate = true;
                resolve(texture);
            }).catch(err => {
                reject("load texture failed.");
            })
        });
    }

    /**
     * 加载栅格切片贴图资源
     * @param params 
     * @returns 
     */
    public static loadRasterTileTexture (params: AssetDefines.LoadAssetParams) {
        return this.loadTexture(Object.assign(params, { taskType: SystemDefines.RequestTaskeType.RASTER_TILE }));
    }

    /**
     * 加载json数据
     * @param params 
     * @returns 
     */
    public static loadJSON<T> (params: AssetDefines.LoadAssetParams) {
        return new Promise<T>((resolve, reject) => {
            requestSystem.request({
                url: params.url,
                taskType: SystemDefines.RequestTaskeType.JSON,
                imageTask: false,
                requestInWorker: params.requestInWorker,
                params: params.params,
                priority: params.priority,
                throttle: params.throttle,
                throttleServer: params.throttleServer,
                onComplete: function (result: RequestTaskResult): void {
                    if (result.status === RequestTaskStatus.SUCCESS) {
                        resolve(result.response.data as T);
                    } else {
                        reject(result.error);
                    }
                }
            })
        });
    }

    /**
     * 请求ArrayBuffer数据
     * @param params 
     */
    public static requestArrayBuffer (params: AssetDefines.LoadAssetParams, cb: (res: { buffer: ArrayBuffer, result: RequestTaskResult }) => void) {
        return requestSystem.request({
            url: params.url,
            imageTask: false,
            taskType: SystemDefines.RequestTaskeType.ARRAYBUFFER,
            params: params.params,
            priority: params.priority,
            responseType: XHRResponseType.ARRAYBUFFER,
            throttle: params.throttle,
            throttleServer: params.throttleServer,
            onComplete: (result: RequestTaskResult) => {
                if (result.status === RequestTaskStatus.SUCCESS) {
                    cb({
                        buffer: result.response.data,
                        result: result
                    });
                } else {
                    cb({
                        buffer: null,
                        result: result
                    });
                }
            }
        })
    }

    /**
     * 加载ArrayBuffer数据
     * @param params 
     */
    public static loadArrayBuffer (params: AssetDefines.LoadAssetParams) {
        return new Promise<ArrayBuffer>((resolve, reject) => {
            requestSystem.request({
                url: params.url,
                imageTask: false,
                taskType: SystemDefines.RequestTaskeType.ARRAYBUFFER,
                params: params.params,
                priority: params.priority,
                responseType: XHRResponseType.ARRAYBUFFER,
                throttle: params.throttle,
                throttleServer: params.throttleServer,
                onComplete: (result: RequestTaskResult) => {
                    if (result.status === RequestTaskStatus.SUCCESS) {
                        resolve(result.response.data as ArrayBuffer);
                    } else {
                        reject(result.error);
                    }
                }
            })
        });
    }

}