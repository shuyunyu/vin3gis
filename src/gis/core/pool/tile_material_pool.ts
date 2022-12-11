import { BackSide, ShaderMaterial, Texture } from "three";
import { InternalConfig } from "../internal/internal_config";
import { BasePool } from "./pool";
import tileVtShader from "../shader/tile.vt.glsl";
import tileFsShader from "../shader/tile.fs.glsl";

type MtlParams = {
    texture: Texture,
    opacity: number
}

/**
 * 瓦片材质池
 */
class TileMaterialPool extends BasePool<ShaderMaterial, MtlParams[]>{

    //底层贴图
    public readonly baseTexture = "u_texture1";

    //上层贴图
    public readonly overlayTexture = "u_texture2";

    //标识是否要叠加底层贴图
    public readonly baseFlag = "u_base";

    //标识是否要叠加上层贴图
    public readonly overlayFlag = "u_overlay";

    //底层贴图透明度
    public readonly baseOpacity = "u_base_opactiy";

    //上层贴图透明度
    public readonly overlayOpacity = "u_overlay_opacity";

    //淡出效果
    public readonly fadeout = "u_fadeout";

    public constructor () {
        super(ShaderMaterial, InternalConfig.TILE_TEXTURE_MTL_CACHE_SIZE);
    }

    protected onConstructor (p?: MtlParams[]): ShaderMaterial {
        const uniforms = Object.create(null);
        this.setUniforms(uniforms, p);
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

    private setUniforms (uniforms: Record<string, any>, p?: MtlParams[]) {
        const baseTextureParam = p[0];
        const overTextureParam = p[1];
        uniforms[this.fadeout] = { value: 1.0 };
        if (baseTextureParam) {
            uniforms[this.baseTexture] = { value: baseTextureParam.texture };
            uniforms[this.baseFlag] = { value: 1.0 };
            uniforms[this.baseOpacity] = { value: baseTextureParam.opacity };
        } else {
            uniforms[this.baseTexture] = { value: null };
            uniforms[this.baseFlag] = { value: 0.0 };
            uniforms[this.baseOpacity] = { value: 1.0 };
        }
        if (overTextureParam) {
            uniforms[this.overlayTexture] = { value: overTextureParam.texture };
            uniforms[this.overlayFlag] = { value: 1.0 };
            uniforms[this.overlayOpacity] = { value: overTextureParam.opacity };
        } else {
            uniforms[this.overlayTexture] = { value: null }
            uniforms[this.overlayFlag] = { value: 0.0 };
            uniforms[this.overlayOpacity] = { value: 1.0 };
        }
    }

    protected onUpdate (o: ShaderMaterial, p?: MtlParams[]): void {
        this.setUniforms(o.uniforms, p);
        o.needsUpdate = true;
    }

    protected onRecycle (o: ShaderMaterial): void {

    }

    protected onAbandon (o: ShaderMaterial): void {
        o.dispose();
    }

}

export const tileMaterialPool = new TileMaterialPool();