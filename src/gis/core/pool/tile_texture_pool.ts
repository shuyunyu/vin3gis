import { Texture } from "three";
import { TextureUtils } from "../../../core/utils/texture_utils";
import { InternalConfig } from "../internal/internal_config";
import { BasePool } from "./pool";

/**
 * 瓦片贴图池
 */
class TileTexturePool extends BasePool<Texture, ImageBitmap>{


    public constructor () {
        super(Texture, InternalConfig.TILE_TEXTURE_MTL_CACHE_SIZE);
    }


    protected onConstructor (p?: ImageBitmap): Texture {
        return TextureUtils.createTextureByImage(p);
    }

    protected onSelect (p?: ImageBitmap): Texture {
        //先看看原先有没有这个贴图 有的话 直接拿出来用
        const index = this._list.findIndex(t => t.image === p);
        if (index > -1) {
            const t = this._list.splice(index, 1)[0];
            return t;
        } else {
            return super.onSelect(p);
        }
    }

    protected onUpdate (o: Texture, p?: ImageBitmap): void {
        //如果当前复用的贴图不是原来的贴图 则需要更新一下
        if (o.image !== p) {
            o.image = p;
            o.needsUpdate = true;
        }
    }

    protected onRecycle (o: Texture): void {

    }

    protected onAbandon (o: Texture): void {
        o.dispose();
    }


}

export const tileTexturePool = new TileTexturePool();