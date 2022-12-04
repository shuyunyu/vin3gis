import { Texture } from "three";
import { TextureUtils } from "../../../core/utils/texture_utils";
import { InternalConfig } from "../internal/internal_config";
import { BasePool } from "./pool";

/**
 * 瓦片贴图池
 */
class TileTexturePool extends BasePool<Texture, HTMLImageElement | ImageBitmap>{


    public constructor () {
        super(Texture, InternalConfig.TILE_TEXTURE_MTL_CACHE_SIZE);
    }


    protected onConstructor (p?: HTMLImageElement | ImageBitmap): Texture {
        return TextureUtils.createTextureByImage(p);
    }

    protected onUpdate (o: Texture, p?: HTMLImageElement | ImageBitmap): void {
        o.image = p;
        o.needsUpdate = true;
    }

    protected onRecycle (o: Texture): void {

    }

    protected onAbandon (o: Texture): void {
        o.dispose();
    }


}

export const tileTexturePool = new TileTexturePool();