import { XHRRequestOnProgress } from "../../../core/xhr/xhr_request";
import { SystemDefines } from "../system/system";

export namespace AssetDefines {

    /**
     * 加载资源的参数
     */
    export interface LoadAssetParams {
        url: string;
        requestInWorker?: boolean;
        taskType?: SystemDefines.RequestTaskeType,
        params?: any;
        priority?: number;
        throttle?: boolean;
        throttleServer?: boolean;
        onProgress?: XHRRequestOnProgress;
    }

    /**
     * 加载ImageBitMap资源的参数
     */
    export interface LoadImageBitMapAssetParams extends LoadAssetParams {
        imageBitMapOptions?: ImageBitmapOptions;
    }

}