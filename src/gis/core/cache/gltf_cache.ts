import { Utils } from "../../../core/utils/utils";

/**
 * 定义 gltf 缓存信息
 */
export interface GltfCacheInfo {
    //gltf json
    gltf?: any;
    //ccmode json
    ccmode?: any;
    //gltf挂载的节点
    nodes?: Node[];
    //材质贴图对应的图片资源
    materialImageAssetRecord: Record<string, ImageBitmap>;
}


/**
 * gltf缓存管理
 */
class GltfCache {

    //当前缓存数量
    private cacheCount: number = 0;


    //缓存信息
    private _cache: Record<string, GltfCacheInfo> = {};

    /**
     * 缓存 gltf
     * @param cacheId 
     * @param cacheInfo 
     */
    public cacheGltf (cacheId: string, cacheInfo: GltfCacheInfo) {
        let oldCache = this.getCache(cacheId);
        if (Utils.defined(oldCache)) {
            return;
        }
        this._cache[cacheId] = cacheInfo;
        this.cacheCount++;
    }

    /**
     * 获取缓存
     * @param cacheId 
     * @returns 
     */
    public getCache (cacheId: string) {
        return this._cache[cacheId];
    }

    //释放缓存
    public release (cacheId: string) {
        let cacheInfo = this.getCache(cacheId);
        if (Utils.defined(cacheInfo)) {
            // let nodes = cacheInfo.nodes;
            // if (Utils.defined(nodes) && nodes!.length > 0) {
            //     for (let i = 0; i < nodes!.length; i++) {
            //         const node = nodes![i];
            //         //销毁节点
            //         node.destroy();
            //     }
            // }
            let imageAssetMap = cacheInfo.materialImageAssetRecord;
            for (const key in imageAssetMap) {
                if (Object.prototype.hasOwnProperty.call(imageAssetMap, key)) {
                    const imageAsset = imageAssetMap[key];
                    imageAsset.close();
                }
            }
            delete this._cache[cacheId];
            this.cacheCount--;
        }
    }

}

export const gltfCache = new GltfCache();