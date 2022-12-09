uniform sampler2D u_texture1;
uniform sampler2D u_texture2;

uniform float u_base;
uniform float u_overlay;

varying vec2 vUv;

void main(){
    
    if(u_base==1. && u_overlay==1.){
         vec4 back_color=texture2D(u_texture1,vUv);
         vec4 overlay_color=texture2D(u_texture2,vUv);
        
        back_color.rgb*=back_color.a;
        overlay_color.rgb*=overlay_color.a;
        
        vec4 final_color=vec4(1.);
        final_color.rgb=overlay_color.rgb+(back_color.rgb*(1.-overlay_color.a));
        final_color.a=overlay_color.a+(back_color.a*(1.-overlay_color.a));
        
        gl_FragColor=final_color;
    }else if(u_base==1.){
        gl_FragColor=texture2D(u_texture1,vUv);
    }else {
        gl_FragColor=texture2D(u_texture2,vUv);
    }
    
}