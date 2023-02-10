import { ShaderChunk, UniformsLib, UniformsUtils, Vector2 } from "three";
import lineVtShader from "../shader/line.vt.glsl";
import lineFsShader from "../shader/line.fs.glsl";
import { Utils } from "../../../core/utils/utils";
import { Shaderhandler } from "./shader_handler";

const UniformsOfLine = {

    worldUnits: { value: 1 },
    linewidth: { value: 1 },
    resolution: { value: new Vector2(1, 1) },
    dashOffset: { value: 0 },
    dashScale: { value: 1 },
    dashSize: { value: 1 },
    gapSize: { value: 1 } // todo FIX - maybe change to totalSize

}

const vtShader = Shaderhandler.handleShaderChunk(Utils.base64Decode(lineVtShader));
const fsShader = Shaderhandler.handleShaderChunk(Utils.base64Decode(lineFsShader));

export class LineShaderExt {

    public static extShader () {
        const uniforms = UniformsUtils.merge([UniformsLib.common, UniformsLib.fog, UniformsOfLine]);
        ShaderChunk
        return {
            uniforms: uniforms,
            vertexShader: vtShader,
            fragmentShader: fsShader
        }

    }

}