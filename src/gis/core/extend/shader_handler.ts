import { ShaderChunk } from "three";

export class Shaderhandler {

    /**
     * 处理ShaderChunk
     * @param shader 
     * @returns 
     */
    public static handleShaderChunk (shader: string) {
        const keys = Object.keys(ShaderChunk);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const regex = new RegExp("#include<" + key + ">", "g");
            shader = shader.replace(regex, ShaderChunk[key]);
        }
        return shader;
    }

}