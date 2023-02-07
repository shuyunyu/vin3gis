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

                vec3 curPosition = position;

                #ifdef USE_INSTANCING

                    mat4 curInstanceMatrix = instanceMatrix;

                    vec4 col1 = vec4(instanceMatrix[0].x, 0.0, 0.0, 0.0);
                    vec4 col2 = vec4(0.0, instanceMatrix[0].y, 0.0, 0.0);
                    vec4 col3 = vec4(0.0, 0.0, instanceMatrix[0].z, 0.0);
                    vec4 col4 = vec4(instanceMatrix[3].x, instanceMatrix[3].y, instanceMatrix[3].z, 1.0);

                    curInstanceMatrix = mat4(col1, col2, col3, col4);

                    vec2 anchor = vec2(instanceMatrix[2].x, instanceMatrix[2].y);

                    if (vUv.x == 0.0) {
                        vUv.x = instanceMatrix[1].x;
                    }
                    if (vUv.x == 1.0) {
                        vUv.x = instanceMatrix[1].y;
                    }
                    if (vUv.y == 0.0) {
                        vUv.y = instanceMatrix[1].z;
                    }
                    if (vUv.y == 1.0) {
                        vUv.y = instanceMatrix[1].w;
                    }

                    if (position.x < 0.0){
                        curPosition.x = -1.0 + anchor.x;
                    }
                    if (position.x > 0.0){
                        curPosition.x = anchor.x;
                    }
                    if (position.y < 0.0){
                        curPosition.y = -anchor.y;
                    }
                    if (position.y > 0.0){
                        curPosition.y = 1.0 - anchor.y;
                    }

                #endif
                `)
            .replace(
                `vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );`,
                `#ifdef USE_INSTANCING
                    vec4 mvPosition = modelViewMatrix * curInstanceMatrix * vec4(0.0, 0.0, 0.0, 1.0 );
                    mat4 curModelMatrix = modelMatrix * curInstanceMatrix;

                    float curRotation = instanceMatrix[0].z;

                 #endif
                 #ifndef USE_INSTANCING
                    vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
                    mat4 curModelMatrix = modelMatrix;

                    float curRotation = rotation;

                 #endif
            `)
            .replace(
                `vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;`,
                `vec2 alignedPosition = ( curPosition.xy - ( center - vec2( 0.5 ) ) ) * scale;`
            );
    }

}
