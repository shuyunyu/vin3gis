#include<common>
#include<color_pars_vertex>
#include<fog_pars_vertex>
#include<logdepthbuf_pars_vertex>
#include<clipping_planes_pars_vertex>

uniform vec2 resolution;

attribute float instanceLinewidth;
attribute vec4 instanceDashArgs;

attribute vec3 instanceStart;
attribute vec3 instanceEnd;

attribute vec3 instanceColorStart;
attribute vec3 instanceColorEnd;

varying vec4 worldPos;
varying vec3 worldStart;
varying vec3 worldEnd;
varying vec2 vUv;

// #ifdef USE_DASH

// uniform float dashScale;
// attribute float instanceDistanceStart;
// attribute float instanceDistanceEnd;
// varying float vLineDistance;

// #endif

attribute float instanceDistanceStart;
attribute float instanceDistanceEnd;
varying float vLineDistance;

varying float v_linewidth;
varying vec4 v_dashArgs;

void trimSegment(const in vec4 start,inout vec4 end){
    
    // trim end segment so it terminates between the camera plane and the near plane
    
    // conservative estimate of the near plane
    float a=projectionMatrix[2][2];// 3nd entry in 3th column
    float b=projectionMatrix[3][2];// 3nd entry in 4th column
    float nearEstimate=-.5*b/a;
    
    float alpha=(nearEstimate-start.z)/(end.z-start.z);
    
    end.xyz=mix(start.xyz,end.xyz,alpha);
    
}

void main(){
    
    v_linewidth=instanceLinewidth;
    v_dashArgs=instanceDashArgs;
    
    float a_dashScale=instanceDashArgs.z;
    
    bool useDash=instanceDashArgs.x==1.;
    
    #ifdef USE_COLOR
    
    vColor.xyz=(position.y<.5)?instanceColorStart:instanceColorEnd;
    
    #endif
    
    if(useDash){
        vLineDistance=(position.y<.5)?a_dashScale*instanceDistanceStart:a_dashScale*instanceDistanceEnd;
        vUv=uv;
    }
    
    float aspect=resolution.x/resolution.y;
    
    // camera space
    vec4 start=modelViewMatrix*vec4(instanceStart,1.);
    vec4 end=modelViewMatrix*vec4(instanceEnd,1.);
    
    #ifdef WORLD_UNITS
    
    worldStart=start.xyz;
    worldEnd=end.xyz;
    
    #else
    
    vUv=uv;
    
    #endif
    
    // special case for perspective projection, and segments that terminate either in, or behind, the camera plane
    // clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
    // but we need to perform ndc-space calculations in the shader, so we must address this issue directly
    // perhaps there is a more elegant solution -- WestLangley
    
    bool perspective=(projectionMatrix[2][3]==-1.);// 4th entry in the 3rd column
    
    if(perspective){
        
        if(start.z<0.&&end.z>=0.){
            
            trimSegment(start,end);
            
        }else if(end.z<0.&&start.z>=0.){
            
            trimSegment(end,start);
            
        }
        
    }
    
    // clip space
    vec4 clipStart=projectionMatrix*start;
    vec4 clipEnd=projectionMatrix*end;
    
    // ndc space
    vec3 ndcStart=clipStart.xyz/clipStart.w;
    vec3 ndcEnd=clipEnd.xyz/clipEnd.w;
    
    // direction
    vec2 dir=ndcEnd.xy-ndcStart.xy;
    
    // account for clip-space aspect ratio
    dir.x*=aspect;
    dir=normalize(dir);
    
    #ifdef WORLD_UNITS
    
    // get the offset direction as perpendicular to the view vector
    vec3 worldDir=normalize(end.xyz-start.xyz);
    vec3 offset;
    if(position.y<.5){
        
        offset=normalize(cross(start.xyz,worldDir));
        
    }else{
        
        offset=normalize(cross(end.xyz,worldDir));
        
    }
    
    // sign flip
    if(position.x<0.)offset*=-1.;
    
    float forwardOffset=dot(worldDir,vec3(0.,0.,1.));
    
    // don't extend the line if we're rendering dashes because we
    // won't be rendering the endcaps
    if(!useDash){
        // extend the line bounds to encompass  endcaps
        start.xyz+=-worldDir*instanceLinewidth*.5;
        end.xyz+=worldDir*instanceLinewidth*.5;
        
        // shift the position of the quad so it hugs the forward edge of the line
        offset.xy-=dir*forwardOffset;
        offset.z+=.5;
    }
    
    // endcaps
    if(position.y>1.||position.y<0.){
        
        offset.xy+=dir*2.*forwardOffset;
        
    }
    
    // adjust for instanceLinewidth
    offset*=instanceLinewidth*.5;
    
    // set the world position
    worldPos=(position.y<.5)?start:end;
    worldPos.xyz+=offset;
    
    // project the worldpos
    vec4 clip=projectionMatrix*worldPos;
    
    // shift the depth of the projected points so the line
    // segments overlap neatly
    vec3 clipPose=(position.y<.5)?ndcStart:ndcEnd;
    clip.z=clipPose.z*clip.w;
    
    #else
    
    vec2 offset=vec2(dir.y,-dir.x);
    // undo aspect ratio adjustment
    dir.x/=aspect;
    offset.x/=aspect;
    
    // sign flip
    if(position.x<0.)offset*=-1.;
    
    // endcaps
    if(position.y<0.){
        
        offset+=-dir;
        
    }else if(position.y>1.){
        
        offset+=dir;
        
    }
    
    // adjust for instanceLinewidth
    offset*=instanceLinewidth;
    
    // adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
    offset/=resolution.y;
    
    // select end
    vec4 clip=(position.y<.5)?clipStart:clipEnd;
    
    // back to clip space
    offset*=clip.w;
    
    clip.xy+=offset;
    
    #endif
    
    gl_Position=clip;
    
    vec4 mvPosition=(position.y<.5)?start:end;// this is an approximation
    
    #include<logdepthbuf_vertex>
    #include<clipping_planes_vertex>
    #include<fog_vertex>
    
}