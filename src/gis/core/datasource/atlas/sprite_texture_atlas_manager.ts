import { MathUtils } from "three";
import { Log } from "../../../log/log";
import { InternalConfig } from "../../internal/internal_config";
import { SpriteTextureAtlas } from "./sprite_texture_atlas";

class SpriteTextureAtlasManager {

    private _atlasList: SpriteTextureAtlas[] = [];

    public constructor () {
        let min = InternalConfig.SPRITE_TEXTURE_ATLAS_MIN_TILE_SIZE;
        const max = InternalConfig.SPRITE_TEXTURE_ATLAS_MAX_TILE_SIZE;
        while (min <= max) {
            this._atlasList.push(new SpriteTextureAtlas(InternalConfig.SPRITE_TEXTURE_ATLAS_SIZE, min));
            min *= 2;
        }
    }

    /**
     * 根据尺寸获取图集
     * @param size 
     * @returns 
     */
    public getAltas (size: number) {
        size = MathUtils.ceilPowerOfTwo(size);
        if (size <= InternalConfig.SPRITE_TEXTURE_ATLAS_MIN_TILE_SIZE) {
            return this._atlasList[0];
        }
        const max = InternalConfig.SPRITE_TEXTURE_ATLAS_MAX_TILE_SIZE;
        if (size >= max) {
            if (size > max) {
                Log.warn(SpriteTextureAtlasManager, `sprite size is too big. max: ${max}, size: ${size}`);
            }
            return this._atlasList[this._atlasList.length - 1];
        }
        return this._atlasList.find(a => a.tileSize === size);
    }

}

export const spriteTextureAtlasManager = new SpriteTextureAtlasManager();