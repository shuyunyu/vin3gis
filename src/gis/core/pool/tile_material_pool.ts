import { BackSide, MeshBasicMaterial, Texture } from "three";
import { InternalConfig } from "../internal/internal_config";
import { BasePool } from "./pool";

/**
 * 瓦片材质池
 */
class TileMaterialPool extends BasePool<MeshBasicMaterial, Texture>{

    public constructor () {
        super(MeshBasicMaterial, InternalConfig.TILE_TEXTURE_MTL_CACHE_SIZE);
    }

    protected onConstructor (p?: Texture): MeshBasicMaterial {
        const mtl = new MeshBasicMaterial({ map: p, transparent: true, side: BackSide });
        mtl.needsUpdate = true;
        return mtl;
    }

    protected onUpdate (o: MeshBasicMaterial, p?: Texture): void {
        o.map = p;
        o.needsUpdate = true;
    }

    protected onRecycle (o: MeshBasicMaterial): void {

    }

    protected onAbandon (o: MeshBasicMaterial): void {
        o.dispose();
    }

}

export const tileMaterialPool = new TileMaterialPool();