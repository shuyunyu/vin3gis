import { SystemDefines } from "../system/system";

export namespace AssetDefines {

    /**
     * 加载贴图的参数
     */
    export type LoadTextureParams = {
        url: string;
        taskType?: SystemDefines.RequestTaskeType.IMAGE | SystemDefines.RequestTaskeType.RASTER_TILE,
        params?: any;
    }

}