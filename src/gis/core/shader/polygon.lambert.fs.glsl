#define LAMBERT
// uniform vec3 diffuse;
// uniform vec3 emissive;
// uniform float opacity;

varying vec3 v_instanceDiffuseColor;
varying float v_instanceOpacity;
varying vec3 v_instanceEmissive;
varying float v_instanceEffectByLight;

#include<common>
#include<packing>
#include<dithering_pars_fragment>
#include<color_pars_fragment>
#include<uv_pars_fragment>
#include<uv2_pars_fragment>
#include<map_pars_fragment>
#include<alphamap_pars_fragment>
#include<alphatest_pars_fragment>
#include<aomap_pars_fragment>
#include<lightmap_pars_fragment>
#include<emissivemap_pars_fragment>
#include<envmap_common_pars_fragment>
#include<envmap_pars_fragment>
#include<fog_pars_fragment>
#include<bsdfs>
#include<lights_pars_begin>
#include<normal_pars_fragment>
#include<lights_lambert_pars_fragment>
#include<shadowmap_pars_fragment>
#include<bumpmap_pars_fragment>
#include<normalmap_pars_fragment>
#include<specularmap_pars_fragment>
#include<logdepthbuf_pars_fragment>
#include<clipping_planes_pars_fragment>
void main(){
    #include<clipping_planes_fragment>
    
    vec4 diffuseColor=vec4(v_instanceDiffuseColor,v_instanceOpacity);
    ReflectedLight reflectedLight=ReflectedLight(vec3(0.),vec3(0.),vec3(0.),vec3(0.));
    vec3 totalEmissiveRadiance=v_instanceEmissive;
    
    #include<logdepthbuf_fragment>
    #include<map_fragment>
    #include<color_fragment>
    #include<alphamap_fragment>
    #include<alphatest_fragment>
    #include<specularmap_fragment>
    #include<normal_fragment_begin>
    #include<normal_fragment_maps>
    #include<emissivemap_fragment>
    // accumulation
    #include<lights_lambert_fragment>
    #include<lights_fragment_begin>
    #include<lights_fragment_maps>
    #include<lights_fragment_end>
    // modulation
    #include<aomap_fragment>
    // vec3 outgoingLight=reflectedLight.directDiffuse+reflectedLight.indirectDiffuse+totalEmissiveRadiance;
    vec3 outgoingLight;
    if(v_instanceEffectByLight>0.){
        outgoingLight=reflectedLight.directDiffuse+reflectedLight.indirectDiffuse+totalEmissiveRadiance;
    }else{
        outgoingLight=v_instanceDiffuseColor;
    }
    #include<envmap_fragment>
    #include<output_fragment>
    #include<tonemapping_fragment>
    #include<encodings_fragment>
    #include<fog_fragment>
    #include<premultiplied_alpha_fragment>
    #include<dithering_fragment>
}