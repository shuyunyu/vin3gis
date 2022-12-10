attribute vec2 a_overlay_uv;

varying vec2 v_base_uv;
varying vec2 v_overlay_uv;

void main(){
    v_base_uv=uv;
    v_overlay_uv = a_overlay_uv;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
}