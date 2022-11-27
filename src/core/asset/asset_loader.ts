import { Texture } from "three";
import { AssetDefines } from "../../@types/core/asset/asset";
import { SystemDefines } from "../../@types/core/system/system";
import { requestSystem } from "../system/request_system";
import { RequestTaskResult, RequestTaskStatus } from "../xhr/scheduler/@types/request";

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
                taskType: params.taskType || SystemDefines.RequestTaskeType.IMAGE,
                imageTask: true,
                params: params.params,
                onComplete: (result: RequestTaskResult) => {
                    if (result.status === RequestTaskStatus.SUCCESS) {
                        result.image.onload = () => {
                            result.image.onload = null;
                            resolve(result.image);
                        }
                    } else {
                        reject("load image failed.");
                    }
                }
            });
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

}