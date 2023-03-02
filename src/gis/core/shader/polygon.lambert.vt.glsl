#define LAMBERT
varying vec3 vViewPosition;
#include<common>
#include<uv_pars_vertex>
#include<uv2_pars_vertex>
#include<displacementmap_pars_vertex>
#include<envmap_pars_vertex>
#include<color_pars_vertex>
#include<fog_pars_vertex>
#include<normal_pars_vertex>
#include<morphtarget_pars_vertex>
#include<skinning_pars_vertex>
#include<shadowmap_pars_vertex>
#include<logdepthbuf_pars_vertex>
#include<clipping_planes_pars_vertex>

attribute vec3 instanceColor;
varying vec3 v_instanceDiffuseColor;
attribute float instanceOpacity;
varying float v_instanceOpacity;
attribute vec3 instanceEmissive;
varying vec3 v_instanceEmissive;
attribute float instanceEffectByLight;
varying float v_instanceEffectByLight;

void main(){
    
    v_instanceDiffuseColor=instanceColor;
    v_instanceOpacity=instanceOpacity;
    v_instanceEmissive=instanceEmissive;
    v_instanceEffectByLight=instanceEffectByLight;
    
    #include<uv_vertex>
    #include<uv2_vertex>
    #include<color_vertex>
    #include<morphcolor_vertex>
    #include<beginnormal_vertex>
    #include<morphnormal_vertex>
    #include<skinbase_vertex>
    #include<skinnormal_vertex>
    #include<defaultnormal_vertex>
    #include<normal_vertex>
    #include<begin_vertex>
    #include<morphtarget_vertex>
    #include<skinning_vertex>
    #include<displacementmap_vertex>
    #include<project_vertex>
    #include<logdepthbuf_vertex>
    #include<clipping_planes_vertex>
    vViewPosition=-mvPosition.xyz;
    #include<worldpos_vertex>
    #include<envmap_vertex>
    #include<shadowmap_vertex>
    #include<fog_vertex>
}