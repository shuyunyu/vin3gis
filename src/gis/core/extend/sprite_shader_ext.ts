import { Shader } from "three";

export class SpriteShaderExt {

    public static extShader (shader: Shader) {
        return shader.vertexShader.replace(
            /modelMatrix/g,
            `curModelMatrix`)
            .replace(/\( rotation \)/g, '( curRotation )')
            .replace(
                `#include <uv_vertex>`,
                `
                #include <uv_vertex>

                #ifdef USE_INSTANCING_COLOR

                    if (vUv.x == 0.0) {
                        vUv.x = instanceColor.x;
                    }
                    if (vUv.x == 1.0) {
                        vUv.x = instanceColor.y;
                    }
                    if (vUv.y == 0.0) {
                        vUv.y = instanceColor.z;
                    }
                    if (vUv.y == 1.0) {
                        vUv.y = instanceMatrix[2].z;
                    }
                #endif
                `)
            .replace(
                `vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );`,
                `#ifdef USE_INSTANCING
                    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0 );
                    mat4 curModelMatrix = modelMatrix * instanceMatrix;

                    float curRotation = curModelMatrix[2].z;

                    #ifdef USE_INSTANCING_COLOR

                       curRotation = 0.0;

                    #endif

                 #endif
                 #ifndef USE_INSTANCING
                    vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
                    mat4 curModelMatrix = modelMatrix;

                    float curRotation = rotation;

                 #endif
            `);
    }

}
