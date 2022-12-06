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

    protected onUpdate (o: Texture, p?: ImageBitmap): void {
        o.image = p;
        o.needsUpdate = true;
    }

    protected onRecycle (o: Texture): void {
        o.image = null;
        o.needsUpdate = true;
    }

    protected onAbandon (o: Texture): void {
        o.dispose();
    }


}

export const tileTexturePool = new TileTexturePool();