#include<common>
#include<fog_pars_fragment>
#include<clipping_planes_pars_vertex>

attribute vec2 a_overlay_uv;

varying vec2 v_base_uv;
varying vec2 v_overlay_uv;

void main(){
    v_base_uv=uv;
    v_overlay_uv=a_overlay_uv;
    
    #include<begin_vertex>
    #include<project_vertex>
    #include<clipping_planes_vertex>
    
    #include<fog_vertex>
}