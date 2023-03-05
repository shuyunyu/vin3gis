#include<common>
#include<fog_pars_fragment>
#include<clipping_planes_pars_fragment>

uniform sampler2D u_texture1;
uniform sampler2D u_texture2;

uniform float u_base;
uniform float u_overlay;

uniform float u_fadeout;

uniform float u_base_opactiy;
uniform float u_overlay_opacity;

varying vec2 v_base_uv;
varying vec2 v_overlay_uv;

void main(){
    #include<clipping_planes_fragment>
    
    vec4 final_color=vec4(1.);
    if(u_base==1.&&u_overlay==1.){
        vec4 back_color=texture2D(u_texture1,v_base_uv);
        vec4 overlay_color=texture2D(u_texture2,v_overlay_uv);
        
        back_color.a*=u_base_opactiy;
        overlay_color.a*=u_overlay_opacity;
        
        back_color.rgb*=back_color.a;
        overlay_color.rgb*=overlay_color.a;
        
        final_color.rgb=overlay_color.rgb+(back_color.rgb*(1.-overlay_color.a));
        final_color.a=overlay_color.a+(back_color.a*(1.-overlay_color.a));
        
    }else if(u_base==1.){
        vec4 back_color=texture2D(u_texture1,v_base_uv);
        back_color.a*=u_base_opactiy;
        final_color=back_color;
    }else if(u_overlay==1.){
        vec4 overlay_color=texture2D(u_texture2,v_overlay_uv);
        overlay_color.a*=u_overlay_opacity;
        final_color=overlay_color;
    }else{
        final_color=vec4(0.,0.,0.,0.);
    }
    final_color.a*=u_fadeout;
    gl_FragColor=final_color;
    
    #include<fog_fragment>
    
}