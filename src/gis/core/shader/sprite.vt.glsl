uniform float rotation;
uniform vec2 center;

#include<common>
#include<uv_pars_vertex>
#include<fog_pars_vertex>
#include<logdepthbuf_pars_vertex>
#include<clipping_planes_pars_vertex>

void main(){
    
    #include<uv_vertex>
    
    vec3 curPosition=position;
    
    #ifdef USE_INSTANCING
    mat4 curInstanceMatrix=instanceMatrix;
    vec4 col1=vec4(instanceMatrix[0].x,0.,0.,0.);
    vec4 col2=vec4(0.,instanceMatrix[0].y,0.,0.);
    vec4 col3=vec4(0.,0.,instanceMatrix[0].z,0.);
    vec4 col4=vec4(instanceMatrix[3].x,instanceMatrix[3].y,instanceMatrix[3].z,1.);curInstanceMatrix=mat4(col1,col2,col3,col4);
    vec2 anchor=vec2(instanceMatrix[2].x,instanceMatrix[2].y);
    if(vUv.x==0.){
        vUv.x=instanceMatrix[1].x;
    }if(vUv.x==1.){
        vUv.x=instanceMatrix[1].y;
    }if(vUv.y==0.){
        vUv.y=instanceMatrix[1].z;
    }if(vUv.y==1.){
        vUv.y=instanceMatrix[1].w;
    }if(position.x<0.){
        curPosition.x=-1.+anchor.x;
    }if(position.x>0.){
        curPosition.x=anchor.x;
    }if(position.y<0.){
        curPosition.y=-anchor.y;
    }if(position.y>0.){
        curPosition.y=1.-anchor.y;
    }
    #endif
    
    #ifdef USE_INSTANCING
    vec4 mvPosition=modelViewMatrix*curInstanceMatrix*vec4(0.,0.,0.,1.);
    mat4 curModelMatrix=modelMatrix*curInstanceMatrix;
    float curRotation=instanceMatrix[0].z;
    #endif
    
    #ifndef USE_INSTANCING
    vec4 mvPosition=modelViewMatrix*vec4(0.,0.,0.,1.);
    mat4 curModelMatrix=modelMatrix;
    float curRotation=rotation;
    #endif
    
    vec2 scale;
    scale.x=length(vec3(curModelMatrix[0].x,curModelMatrix[0].y,curModelMatrix[0].z));
    scale.y=length(vec3(curModelMatrix[1].x,curModelMatrix[1].y,curModelMatrix[1].z));
    
    #ifndef USE_SIZEATTENUATION
    bool isPerspective=isPerspectiveMatrix(projectionMatrix);
    if(isPerspective)scale*=-mvPosition.z;
    #endif
    
    vec2 alignedPosition=(curPosition.xy-(center-vec2(.5)))*scale;
    vec2 rotatedPosition;
    rotatedPosition.x=cos(curRotation)*alignedPosition.x-sin(curRotation)*alignedPosition.y;rotatedPosition.y=sin(curRotation)*alignedPosition.x+cos(curRotation)*alignedPosition.y;mvPosition.xy+=rotatedPosition;
    gl_Position=projectionMatrix*mvPosition;
    
    #include<logdepthbuf_vertex>
    #include<clipping_planes_vertex>
    #include<fog_vertex>
}