import { ShaderMaterial, ShaderMaterialParameters, Vector2 } from "three";
import { LineShaderExt } from "../line_shader_ext";

export type LineMaterialOptions = {
    color?: number,
    linewidth?: number,
    dashed?: boolean,
    dashScale?: number,
    dashSize?: number,
    dashOffset?: number,
    gapSize?: number,
    resolution?: Vector2, // to be set by renderer
} & ShaderMaterialParameters;

export class LineMaterial extends ShaderMaterial {

    public readonly isLineMaterial: boolean;

    public get color () {
        return this.uniforms.diffuse.value;
    }

    public set color (val) {
        this.uniforms.diffuse.value = val;
    }

    public get worldUnits () {
        return 'WORLD_UNITS' in this.defines;
    }

    public set worldUnits (val: boolean) {
        if (val === true) {
            this.defines.WORLD_UNITS = '';
        } else {
            delete this.defines.WORLD_UNITS;
        }
    }

    public get lineWidth () {
        return this.uniforms.linewidth.value;
    }

    //@ts-ignore
    public set linewidth (val) {
        if (this.uniforms && this.uniforms.lineWidth) this.uniforms.linewidth.value = val;
    }

    public get dashed () {
        return Boolean('USE_DASH' in this.defines);
    }

    public set dashed (val) {
        if (Boolean(val) !== Boolean('USE_DASH' in this.defines)) {
            this.needsUpdate = true;
        }
        if (val === true) {
            this.defines.USE_DASH = '';
        } else {
            delete this.defines.USE_DASH;
        }
    }

    public get dashScale () {
        return this.uniforms.dashScale.value;
    }

    public set dashScale (val) {
        this.uniforms.dashScale.value = val;
    }

    public get dashSize () {
        return this.uniforms.dashSize.value;
    }

    public set dashSize (val) {
        this.uniforms.dashSize.value = val;
    }

    public get dashOffset () {
        return this.uniforms.dashOffset.value;
    }

    public set dashOffset (val) {
        this.uniforms.dashOffset.value = val;
    }

    public get gapSize () {
        return this.uniforms.gapSize.value;
    }

    public set gapSize (val) {
        this.uniforms.gapSize.value = val;
    }

    //@ts-ignore
    public get opacity () {
        return this.uniforms.opacity.value;
    }

    public set opacity (val) {
        if (this.uniforms) this.uniforms.opacity.value = val;
    }

    public get resolution () {
        return this.uniforms.resolution.value;
    }

    public set resolution (val) {
        this.uniforms.resolution.value.copy(val);
    }

    //@ts-ignore
    public get alphaToCoverage () {
        return Boolean('USE_ALPHA_TO_COVERAGE' in this.defines);
    }

    public set alphaToCoverage (val) {
        if (this.defines) {
            if (Boolean(val) !== Boolean('USE_ALPHA_TO_COVERAGE' in this.defines)) {
                this.needsUpdate = true;
            }
            if (val === true) {
                this.defines.USE_ALPHA_TO_COVERAGE = '';
                this.extensions.derivatives = true;
            } else {
                delete this.defines.USE_ALPHA_TO_COVERAGE;
                this.extensions.derivatives = false;
            }
        }
    }

    public constructor (options?: LineMaterialOptions) {
        options = options || {};
        const ext = LineShaderExt.extShader();
        super({
            //@ts-ignore
            type: "LineMaterial",
            uniforms: ext.uniforms,
            vertexShader: ext.vertexShader,
            fragmentShader: ext.fragmentShader,
            clipping: true
        });
        this.isLineMaterial = true;
        this.setValues(options);
    }

}