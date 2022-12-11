import { BackSide, ShaderMaterial, Texture } from "three";
import { InternalConfig } from "../internal/internal_config";
import { BasePool } from "./pool";
import tileVtShader from "../shader/tile.vt.glsl";
import tileFsShader from "../shader/tile.fs.glsl";


/**
 * 瓦片材质池
 */
class TileMaterialPool extends BasePool<ShaderMaterial, Texture[]>{

    //底层贴图
    public readonly baseTexture = "u_texture1";

    //上层贴图
    public readonly overlayTexture = "u_texture2";

    //标识是否要叠加底层贴图
    public readonly baseFlag = "u_base";

    //标识是否要叠加上层贴图
    public readonly overlayFlag = "u_overlay";

    public constructor () {
        super(ShaderMaterial, InternalConfig.TILE_TEXTURE_MTL_CACHE_SIZE);
    }

    protected onConstructor (p?: Texture[]): ShaderMaterial {
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

    private setUniforms (uniforms: Record<string, any>, p?: Texture[]) {
        const baseTexture = p[0];
        const overTexture = p[1];
        if (baseTexture) {
            uniforms[this.baseTexture] = { value: baseTexture };
            uniforms[this.baseFlag] = { value: 1.0 };
        } else {
            uniforms[this.baseTexture] = { value: null };
            uniforms[this.baseFlag] = { value: 0.0 };
        }
        if (overTexture) {
            uniforms[this.overlayTexture] = { value: p[1] };
            uniforms[this.overlayFlag] = { value: 1.0 };
        } else {
            uniforms[this.overlayTexture] = { value: null }
            uniforms[this.overlayFlag] = { value: 0.0 };
        }
    }

    protected onUpdate (o: ShaderMaterial, p?: Texture[]): void {
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