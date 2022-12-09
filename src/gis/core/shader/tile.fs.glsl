uniform sampler2D texture1;
uniform sampler2D texture2;

varying vec2 vUv;

void main(){
    vec4 color1=texture2D(texture1,vUv);
    vec4 color2=texture2D(texture2,vUv);
    gl_FragColor=mix(color1,color2,.5);
}