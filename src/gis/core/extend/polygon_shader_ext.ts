import polygonBasicVtShader from "../shader/polygon.basic.vt.glsl";
import polygonBasicFsShader from "../shader/polygon.basic.fs.glsl";
import polygonLambertVtShader from "../shader/polygon.lambert.vt.glsl";
import polygonLamberFsShader from "../shader/polygon.lambert.fs.glsl";
import { Shaderhandler } from "./shader_handler";
import { Utils } from "../../../core/utils/utils";
import { Color, UniformsLib, UniformsUtils } from "three";

const basicVtShader = Shaderhandler.handleShaderChunk(Utils.base64Decode(polygonBasicVtShader));
const basicFsShader = Shaderhandler.handleShaderChunk(Utils.base64Decode(polygonBasicFsShader));
const lambertVtShader = Shaderhandler.handleShaderChunk(Utils.base64Decode(polygonLambertVtShader));
const lambertFsShader = Shaderhandler.handleShaderChunk(Utils.base64Decode(polygonLamberFsShader));

export class PolygonShaderExt {

    public static extShader (lambert: boolean = true) {

        const uniforms = lambert ? UniformsUtils.merge([
            UniformsLib.common, UniformsLib.fog, {
                diffuse: { value: new Color("#FF0000") }
            }
        ]) : UniformsUtils.merge([
            UniformsLib.common,
            UniformsLib.specularmap,
            UniformsLib.envmap,
            UniformsLib.aomap,
            UniformsLib.lightmap,
            UniformsLib.emissivemap,
            UniformsLib.bumpmap,
            UniformsLib.normalmap,
            UniformsLib.displacementmap,
            UniformsLib.fog,
            UniformsLib.lights,
            {
                emissive: { value: new Color(0x000000) }
            }
        ]);
        return {
            uniforms: uniforms,
            vertexShader: lambertVtShader,
            fragmentShader: lambertFsShader
        }

    }

}