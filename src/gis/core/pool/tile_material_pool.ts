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

    protected onSelect (p?: Texture): MeshBasicMaterial {
        //先看看原先有没有这个材质 有的话 直接拿出来用
        const index = this._list.findIndex(mtl => mtl.map === p);
        if (index > -1) {
            const mtl = this._list.splice(index, 1)[0];
            return mtl;
        } else {
            return super.onSelect(p);
        }
    }

    protected onUpdate (o: MeshBasicMaterial, p?: Texture): void {
        //如果当前复用的材质不是原来的材质 则需要更新一下
        if (o.map !== p) {
            o.map = p;
            o.needsUpdate = true;
        }
    }

    protected onRecycle (o: MeshBasicMaterial): void {

    }

    protected onAbandon (o: MeshBasicMaterial): void {
        o.dispose();
    }

}

export const tileMaterialPool = new TileMaterialPool();