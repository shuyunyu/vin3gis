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
     * 加载贴图资源
     * @returns 
     */
    public static loadTexture (params: AssetDefines.LoadTextureParams) {
        return new Promise<Texture>((resolve, reject) => {
            requestSystem.request({
                url: params.url,
                taskType: params.taskType || SystemDefines.RequestTaskeType.IMAGE,
                imageTask: true,
                params: params.params,
                onComplete: (result: RequestTaskResult) => {
                    if (result.status === RequestTaskStatus.SUCCESS) {
                        const texture = new Texture();
                        texture.image = result.image;
                        texture.needsUpdate = true;
                        resolve(texture);
                    } else {
                        reject("load texture failed.");
                    }
                }
            })
        });
    }

    /**
     * 加载栅格切片贴图资源
     * @param params 
     * @returns 
     */
    public static loadRasterTileTexture (params: AssetDefines.LoadTextureParams) {
        return this.loadTexture(Object.assign(params, { taskType: SystemDefines.RequestTaskeType.RASTER_TILE }));
    }

}