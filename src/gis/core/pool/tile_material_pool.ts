import { BackSide, ShaderMaterial, Texture } from "three";
import { InternalConfig } from "../internal/internal_config";
import { BasePool } from "./pool";
import tileVtShader from "../shader/tile.vt.glsl";
import tileFsShader from "../shader/tile.fs.glsl";


/**
 * 瓦片材质池
 */
class TileMaterialPool extends BasePool<ShaderMaterial, Texture>{

    //shader里面最底层的texture的名称
    public readonly shaderBaseTextureName = "texture1";

    public constructor () {
        super(ShaderMaterial, InternalConfig.TILE_TEXTURE_MTL_CACHE_SIZE);
    }

    protected onConstructor (p?: Texture): ShaderMaterial {
        const uniforms = Object.create(null);
        uniforms[this.shaderBaseTextureName] = { value: p };
        const mtl = new ShaderMaterial({
            uniforms: uniforms,
            vertexShader: tileVtShader,
            fragmentShader: tileFsShader,
            transparent: true,
            side: BackSide
        });
        mtl.needsUpdate = true;
        return mtl;
    }

    protected onSelect (p?: Texture): ShaderMaterial {
        //先看看原先有没有这个材质 有的话 直接拿出来用
        const index = this._list.findIndex(mtl => mtl.uniforms[this.shaderBaseTextureName].value === p);
        if (index > -1) {
            const mtl = this._list.splice(index, 1)[0];
            return mtl;
        } else {
            return super.onSelect(p);
        }
    }

    protected onUpdate (o: ShaderMaterial, p?: Texture): void {
        //如果当前复用的材质不是原来的材质 则需要更新一下
        if (o.uniforms[this.shaderBaseTextureName].value !== p) {
            o.uniforms[this.shaderBaseTextureName].value = p;
            o.needsUpdate = true;
        }
    }

    protected onRecycle (o: ShaderMaterial): void {

    }

    protected onAbandon (o: ShaderMaterial): void {
        o.dispose();
    }

}

export const tileMaterialPool = new TileMaterialPool();