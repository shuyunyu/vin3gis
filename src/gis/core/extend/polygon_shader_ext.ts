import polygonVtShader from "../shader/polygon.vt.glsl";
import polygonFsShader from "../shader/polygon.fs.glsl";
import { Shaderhandler } from "./shader_handler";
import { Utils } from "../../../core/utils/utils";
import { Color, UniformsLib, UniformsUtils } from "three";

const vtShader = Shaderhandler.handleShaderChunk(Utils.base64Decode(polygonVtShader));
const fsShader = Shaderhandler.handleShaderChunk(Utils.base64Decode(polygonFsShader));

export class PolygonShaderExt {

    public static extShader () {

        const uniforms = UniformsUtils.merge([UniformsLib.common, UniformsLib.fog, {
            diffuse: { value: new Color("#FF0000") }
        }]);
        return {
            uniforms: uniforms,
            vertexShader: vtShader,
            fragmentShader: fsShader
        }

    }

}