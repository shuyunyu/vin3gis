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

    //标识是否要叠加多层贴图
    public readonly overlayFalg = "u_overlay";

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
        uniforms[this.baseTexture] = { value: p[0] };
        if (p.length > 1) {
            uniforms[this.overlayTexture] = { value: p[1] };
            uniforms[this.overlayFalg] = { value: 1.0 }
        } else {
            uniforms[this.overlayFalg] = { value: 0.0 };
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