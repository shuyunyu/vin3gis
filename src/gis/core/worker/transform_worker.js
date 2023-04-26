var transform_worker;(()=>{"use strict";var t,e,r,i={d:(t,e)=>{for(var r in e)i.o(e,r)&&!i.o(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:e[r]})},o:(t,e)=>Object.prototype.hasOwnProperty.call(t,e),r:t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})}},s={};i.r(s),i.d(s,{Cartesian3:()=>m,Matrix4:()=>B,WebMercatorProjection:()=>V,WorkerTransform:()=>J,gltfUpAxis:()=>F,webMercatorProjection:()=>Z});class a{static equalsEpsilon(t,e,r,i){r=null!=r?r:0,i=null!=i?i:r;var s=Math.abs(t-e);return s<=i||s<=r*Math.max(Math.abs(t),Math.abs(e))}static toRadian(t){return t*this.RADIANS_PER_DEGREE}static toDegree(t){return t*this.DEGREE_PER_RADIANS}static clamp(t,e,r){var i;return r<e&&(i=e,e=r,r=i),t<e?e:r<t?r:t}static negativePiToPi(t){return t>=-this.PI&&t<=this.PI?t:this.zeroToTwoPi(t+this.PI)-this.PI}static zeroToTwoPi(t){var e;return 0<=t&&t<=this.TWO_PI?t:(e=this.mod(t,this.TWO_PI),Math.abs(e)<this.EPSILON14&&Math.abs(t)>this.EPSILON14?this.TWO_PI:e)}static mod(t,e){return Math.sign(t)===Math.sign(e)&&Math.abs(t)<Math.abs(e)?t:(t%e+e)%e}static fog(t,e){return t*=e,1-Math.exp(-t*t)}static lerp(t,e,r){return(1-r)*t+r*e}static normalize(t,e,r){return 0===(r=Math.max(r-e,0))?0:a.clamp((t-e)/r,0,1)}static cbrt(t){var e=Math.pow(Math.abs(t),1/3);return t<0?-e:e}}a.RADIANS_PER_DEGREE=Math.PI/180,a.DEGREE_PER_RADIANS=180/Math.PI,a.PI=Math.PI,a.TWO_PI=2*Math.PI,a.PI_OVER_TWO=Math.PI/2,a.EPSILON1=.1,a.EPSILON2=.01,a.EPSILON3=.001,a.EPSILON4=1e-4,a.EPSILON5=1e-5,a.EPSILON6=1e-6,a.EPSILON7=1e-7,a.EPSILON8=1e-8,a.EPSILON9=1e-9,a.EPSILON10=1e-9,a.EPSILON11=1e-10,a.EPSILON12=1e-11,a.EPSILON13=1e-12,a.EPSILON14=1e-13,a.EPSILON15=1e-14,a.EPSILON16=1e-15,a.EPSILON17=1e-16,a.EPSILON18=1e-17,a.EPSILON19=1e-18,a.EPSILON20=1e-19,a.EPSILON21=1e-20;const h=new RegExp("^(?:([^:/?#]+):)?(?://([^/?#]*))?([^?#]*)(?:\\?([^#]*))?(?:#(.*))?$"),n=/%[0-9a-z]{2}/gi,o=/[a-zA-Z0-9\-\._~]/,u=/(.*@)?([^@:]*)(:.*)?/;function c(t){var e=unescape(t);return o.test(e)?e:t.toUpperCase()}function y(t,e,r,i){return(e||"")+r.toLowerCase()+(i||"")}class l{get scheme(){return this._scheme}set scheme(t){this._scheme=t}get authority(){return this._authority}set authority(t){this._authority=t}get path(){return this._path}set path(t){this._path=t}get query(){return this._query}set query(t){this._query=t}get fragment(){return this._fragment}set fragment(t){this._fragment=t}constructor(t){t instanceof l?(this._scheme=t.scheme,this._authority=t.authority,this._path=t.path,this._query=t.query,this._fragment=t.fragment):(t=null!=t?h.exec(t):null,this._scheme=null!=t?t[1]:null,this._authority=null!=t?t[2]:null,this._path=null!=t?t[3]:"",this._query=null!=t?t[4]:null,this._fragment=null!=t?t[5]:null)}isAbsolute(){return!!this.scheme&&!this.fragment}isSameDocumentAs(t){return t.scheme==this.scheme&&t.authority==this.authority&&t.path==this.path&&t.query==this.query}equals(t){return this.isSameDocumentAs(t)&&t.fragment==this.fragment}normalize(){this.removeDotSegments(),this.scheme&&(this._scheme=this.scheme.toLowerCase()),this.authority&&(this._authority=this.authority.replace(u,y).replace(n,c)),this.path&&(this._path=this.path.replace(n,c)),this.query&&(this._query=this.query.replace(n,c)),this.fragment&&(this._fragment=this.fragment.replace(n,c))}resolve(t){var e=new l;return this.scheme?(e.scheme=this.scheme,e.authority=this.authority,e.path=this.path,e.query=this.query):(e.scheme=t.scheme,this.authority?(e.authority=this.authority,e.path=this.path,e.query=this.query):(e.authority=t.authority,""==this.path?(e.path=t.path,e.query=this.query||t.query):("/"==this.path.charAt(0)?e.path=this.path:t.authority&&""==t.path?e.path="/"+this.path:e.path=t.path.substring(0,t.path.lastIndexOf("/")+1)+this.path,e.removeDotSegments(),e.query=this.query))),e.fragment=this.fragment,e}removeDotSegments(){let t,e=this.path.split("/"),r=[],i=""==e[0];for(i&&e.shift(),""==e[0]&&e.shift();e.length;)".."==(t=e.shift())?r.pop():"."!=t&&r.push(t);"."!=t&&".."!=t||r.push(""),i&&r.unshift(""),this._path=r.join("/")}toString(){let t="";return this.scheme&&(t+=this.scheme+":"),this.authority&&(t+="//"+this.authority),t+=this.path,this.query&&(t+="?"+this.query),this.fragment&&(t+="#"+this.fragment),t}}class x{static isString(t){return"string"==typeof t}static defaultValue(t,e){return this.defined(t)?t:e}static defined(t){return null!=t}static createGuid(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,(function(t){var e=16*Math.random()|0;return("x"===t?e:3&e|8).toString(16)}))}static base64Encode(t){var e,r,i,s,a,h,n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",o="",u=0;for(t=this.utf8Encode(t);u<t.length;)i=(e=t.charCodeAt(u++))>>2,s=(3&e)<<4|(e=t.charCodeAt(u++))>>4,a=(15&e)<<2|(r=t.charCodeAt(u++))>>6,h=63&r,isNaN(e)?a=h=64:isNaN(r)&&(h=64),o=o+n.charAt(i)+n.charAt(s)+n.charAt(a)+n.charAt(h);return o}static base64Decode(t){var e,r,i,s,a,h,n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",o="",u=0;for(t=t.replace(/[^A-Za-z0-9\+\/\=]/g,"");u<t.length;)i=n.indexOf(t.charAt(u++)),e=(15&(s=n.indexOf(t.charAt(u++))))<<4|(a=n.indexOf(t.charAt(u++)))>>2,r=(3&a)<<6|(h=n.indexOf(t.charAt(u++))),o+=String.fromCharCode(i<<2|s>>4),64!=a&&(o+=String.fromCharCode(e)),64!=h&&(o+=String.fromCharCode(r));return this.utf8Decode(o)}static utf8Encode(t){t=t.replace(/\r\n/g,"\n");for(var e="",r=0;r<t.length;r++){var i=t.charCodeAt(r);i<128?e+=String.fromCharCode(i):e=127<i&&i<2048?(e+=String.fromCharCode(i>>6|192))+String.fromCharCode(63&i|128):(e=(e+=String.fromCharCode(i>>12|224))+String.fromCharCode(i>>6&63|128))+String.fromCharCode(63&i|128)}return e}static utf8Decode(t){for(var e,r,i="",s=0,a=0;s<t.length;)(e=t.charCodeAt(s))<128?(i+=String.fromCharCode(e),s++):191<e&&e<224?(a=t.charCodeAt(s+1),i+=String.fromCharCode((31&e)<<6|63&a),s+=2):(a=t.charCodeAt(s+1),r=t.charCodeAt(s+2),i+=String.fromCharCode((15&e)<<12|(63&a)<<6|63&r),s+=3);return i}static formatBytes(t,e=1){var r;return 0===t?"0 B":(e=e<0?0:e,r=Math.floor(Math.log(t)/Math.log(1024)),parseFloat((t/Math.pow(1024,r)).toFixed(e))+" "+["B","KB","MB"][r])}static createScriptBlob(t){return new Blob([t],{type:"application/javascript"})}static debounce(t,e,r){let i;return r=null!=r?r:300,function(){let s=arguments;x.defined(i)&&clearTimeout(i),i=setTimeout((()=>{i=void 0,t.apply(e,s)}),r)}}static equalsRTS(t,e){return t.position.equals(e.position)&&t.rotation.equals(e.rotation)&&t.scale.equals(e.scale)}static createElementNS(t){return document.createElementNS("http://www.w3.org/1999/xhtml",t)}static getAbsouteUri(t,e){return t=new l(t),new l(e).resolve(t).toString()}static combine(t,e,r){r=this.defaultValue(r,!1);var i,s={},a=this.defined(t),h=this.defined(e);let n,o;if(a)for(n in t)t.hasOwnProperty(n)&&(i=t[n],h&&r&&"object"==typeof i&&e.hasOwnProperty(n)&&"object"==typeof(o=e[n])?s[n]=this.combine(i,o,r):s[n]=i);if(h)for(n in e)e.hasOwnProperty(n)&&!s.hasOwnProperty(n)&&(o=e[n],s[n]=o);return s}static clone(t,e){if(null===t||"object"!=typeof t)return t;e=this.defaultValue(e,!1);var r,i,s=new t.constructor;for(r in t)t.hasOwnProperty(r)&&(i=t[r],e&&(i=this.clone(i,e)),s[r]=i);return s}}(r=t=t||{})[r.Y=1]="Y",r[r.Z=2]="Z",(r=e=e||{})[r.NONE=1]="NONE",r[r.GCJ02=2]="GCJ02",r[r.BD09=3]="BD09";const d=THREE;class m{constructor(t=0,e=0,r=0){this.x=0,this.y=0,this.z=0,this.x=t,this.y=e,this.z=r}clone(t){return t?(t.set(this.x,this.y,this.z),t):new m(this.x,this.y,this.z)}set(t,e,r){return t&&"object"==typeof t?(this.x=t.x,this.y=t.y,this.z=t.z):(this.x=t||0,this.y=e||0,this.z=r||0),this}lerp(t,e){return this.x+=e*(t.x-this.x),this.y+=e*(t.y-this.y),this.z+=e*(t.z-this.z),this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}add3f(t,e,r){return this.x+=t,this.y+=e,this.z+=r,this}subtract(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subtract3f(t,e,r){return this.x-=t,this.y-=e,this.z-=r,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiply3f(t,e,r){return this.x*=t,this.y*=e,this.z*=r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divide3f(t,e,r){return this.x/=t,this.y/=e,this.z/=r,this}negative(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}clampf(t,e){return this.x=a.clamp(this.x,t.x,e.x),this.y=a.clamp(this.y,t.y,e.y),this.z=a.clamp(this.z,t.z,e.z),this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}cross(t){var{x:e,y:r,z:i}=this,{x:t,y:s,z:a}=t;return this.x=r*a-i*s,this.y=i*t-e*a,this.z=e*s-r*t,this}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}lengthSqr(){return this.x*this.x+this.y*this.y+this.z*this.z}normalize(){var t=this.x,e=this.y,r=this.z,i=t*t+e*e+r*r;return 0<i&&(i=1/Math.sqrt(i),this.x=t*i,this.y=e*i,this.z=r*i),this}equals(t){return this.x===t.x&&this.y===t.y&&this.z===t.z}equalsEpsilon(t,e,r){return this===t||a.equalsEpsilon(this.x,t.x,e,r)&&a.equalsEpsilon(this.y,t.y,e,r)&&a.equalsEpsilon(this.z,t.z,e,r)}distance(t){var e=this.x-t.x,r=this.y-t.y;return t=this.z-t.z,Math.sqrt(e*e+r*r+t*t)}midpoint(t,e){return(e=e||new m).x=.5*(this.x+t.x),e.y=.5*(this.y+t.y),e.z=.5*(this.z+t.z),e}max(){return Math.max(this.x,this.y,this.z)}min(){return Math.min(this.x,this.y,this.z)}toArray(t){return t?(t[0]=this.x,t[1]=this.y,t[2]=this.z,t):[this.x,this.y,this.z]}toVec3(t){return(t=t||new d.Vector3).set(this.x,this.y,this.z),t}toString(){return`(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)})`}static zero(t){return t.x=0,t.y=0,t.z=0,t}static clone(t){return new m(t.x,t.y,t.z)}static copy(t,e){return t.x=e.x,t.y=e.y,t.z=e.z,t}static set(t,e,r,i){return t.x=e,t.y=r,t.z=i,t}static add(t,e,r){return t.x=e.x+r.x,t.y=e.y+r.y,t.z=e.z+r.z,t}static subtract(t,e,r){return t.x=e.x-r.x,t.y=e.y-r.y,t.z=e.z-r.z,t}static multiply(t,e,r){return t.x=e.x*r.x,t.y=e.y*r.y,t.z=e.z*r.z,t}static divide(t,e,r){return t.x=e.x/r.x,t.y=e.y/r.y,t.z=e.z/r.z,t}static ceil(t,e){return t.x=Math.ceil(e.x),t.y=Math.ceil(e.y),t.z=Math.ceil(e.z),t}static floor(t,e){return t.x=Math.floor(e.x),t.y=Math.floor(e.y),t.z=Math.floor(e.z),t}static min(t,e,r){return t.x=Math.min(e.x,r.x),t.y=Math.min(e.y,r.y),t.z=Math.min(e.z,r.z),t}static max(t,e,r){return t.x=Math.max(e.x,r.x),t.y=Math.max(e.y,r.y),t.z=Math.max(e.z,r.z),t}static round(t,e){return t.x=Math.round(e.x),t.y=Math.round(e.y),t.z=Math.round(e.z),t}static multiplyScalar(t,e,r){return t.x=e.x*r,t.y=e.y*r,t.z=e.z*r,t}static scaleAndAdd(t,e,r,i){return t.x=e.x+r.x*i,t.y=e.y+r.y*i,t.z=e.z+r.z*i,t}static distance(t,e){var r=e.x-t.x,i=e.y-t.y;return e=e.z-t.z,Math.sqrt(r*r+i*i+e*e)}static squaredDistance(t,e){var r=e.x-t.x,i=e.y-t.y;return r*r+i*i+(e=e.z-t.z)*e}static len(t){var e=t.x,r=t.y;return t=t.z,Math.sqrt(e*e+r*r+t*t)}static lengthSqr(t){var e=t.x,r=t.y;return e*e+r*r+(t=t.z)*t}static negate(t,e){return t.x=-e.x,t.y=-e.y,t.z=-e.z,t}static invert(t,e){return t.x=1/e.x,t.y=1/e.y,t.z=1/e.z,t}static invertSafe(t,e){var r=e.x,i=e.y;return e=e.z,Math.abs(r)<a.EPSILON6?t.x=0:t.x=1/r,Math.abs(i)<a.EPSILON6?t.y=0:t.y=1/i,Math.abs(e)<a.EPSILON6?t.z=0:t.z=1/e,t}static normalize(t,e){var r=e.x,i=e.y,s=r*r+i*i+(e=e.z)*e;return 0<s&&(s=1/Math.sqrt(s),t.x=r*s,t.y=i*s,t.z=e*s),t}static dot(t,e){return t.x*e.x+t.y*e.y+t.z*e.z}static cross(t,e,r){var{x:e,y:i,z:s}=e,{x:r,y:a,z:h}=r;return t.x=i*h-s*a,t.y=s*r-e*h,t.z=e*a-i*r,t}static lerp(t,e,r,i){return t.x=e.x+i*(r.x-e.x),t.y=e.y+i*(r.y-e.y),t.z=e.z+i*(r.z-e.z),t}static random(t,e){e=e||1;var r=2*Math.random()*Math.PI,i=2*Math.random()-1,s=Math.sqrt(1-i*i);return t.x=s*Math.cos(r)*e,t.y=s*Math.sin(r)*e,t.z=i*e,t}static transformQuat(t,e,r){var i=r.w*e.x+r.y*e.z-r.z*e.y,s=r.w*e.y+r.z*e.x-r.x*e.z,a=r.w*e.z+r.x*e.y-r.y*e.x;return e=-r.x*e.x-r.y*e.y-r.z*e.z,t.x=i*r.w+e*-r.x+s*-r.z-a*-r.y,t.y=s*r.w+e*-r.y+a*-r.x-i*-r.z,t.z=a*r.w+e*-r.z+i*-r.y-s*-r.x,t}static rotateX(t,e,r,i){var s=e.x-r.x,a=e.y-r.y,h=(e=e.z-r.z,Math.cos(i)),n=a*h-e*(i=Math.sin(i));return a=a*i+e*h,t.x=s+r.x,t.y=n+r.y,t.z=a+r.z,t}static rotateY(t,e,r,i){var s=e.x-r.x,a=e.y-r.y,h=(e=e.z-r.z,Math.cos(i)),n=e*h-s*(i=Math.sin(i));return t.x=e*i+s*h+r.x,t.y=a+r.y,t.z=n+r.z,t}static rotateZ(t,e,r,i){var s=e.x-r.x,a=e.y-r.y,h=(e=e.z-r.z,Math.cos(i)),n=s*(i=Math.sin(i))+a*h;return t.x=s*h-a*i+r.x,t.y=n+r.y,t.z=e+r.z,t}static angle(t,e){return m.normalize(g,t),m.normalize(z,e),1<(t=m.dot(g,z))?0:t<-1?Math.PI:Math.acos(t)}static projectOnPlane(t,e,r){return m.subtract(t,e,m.project(t,e,r))}static project(t,e,r){var i=m.lengthSqr(r);return i<1e-6?m.set(t,0,0,0):m.multiplyScalar(t,r,m.dot(e,r)/i)}static fromArray(t,e){return(e=e||new m).set(t[0],t[1],t[2]),e}static fromCartesian2(t,e){return(e=e||new m).set(t.x,t.y,0),e}static fromCartesian3(t,e){return(e=e||new m).set(t.x,t.y,t.z),e}static equals(t,e){return t.equals(e)}static equalsEpsilon(t,e,r,i){return t.equalsEpsilon(e,r,i)}static midpoint(t,e,r){return t.midpoint(e,r)}static unpack(t,e=0,r){return(r=r||new m).set(t[e++],t[e++],t[e]),r}static toVec3(t,e){return t.toVec3(e)}static divideComponents(t,e,r){return r.x=t.x/e.x,r.y=t.y/e.y,r.z=t.z/e.z,r}static magnitude(t){return Math.sqrt(this.magnitudeSquared(t))}static magnitudeSquared(t){return t.x*t.x+t.y*t.y+t.z*t.z}static fromElements(t,e,r,i){return i?(i.x=t,i.y=e,i.z=r,i):new m(t,e,r)}}m.UNIT_X=Object.freeze(new m(1,0,0)),m.UNIT_Y=Object.freeze(new m(0,1,0)),m.UNIT_Z=Object.freeze(new m(0,0,1)),m.RIGHT=Object.freeze(new m(1,0,0)),m.UP=Object.freeze(new m(0,1,0)),m.FORWARD=Object.freeze(new m(0,0,-1)),m.ZERO=Object.freeze(new m(0,0,0)),m.ONE=Object.freeze(new m(1,1,1)),m.NEG_ONE=Object.freeze(new m(-1,-1,-1));const g=new m,z=new m;class p{constructor(t=0,e=0,r=0){this.longitude=0,this.latitude=0,this.height=0,this.longitude=t,this.latitude=e,this.height=r}equals(t){return this.longitude===t.longitude&&this.latitude===t.latitude&&this.height===t.height}clone(){return new p(this.longitude,this.latitude,this.height)}static fromDegrees(t,e,r=0){return new p(a.toRadian(t),a.toRadian(e),r)}static fromArray(t,e=0){return new p(t[e+0],t[e+1],t[e+2])}toArray(t){return(t=t||new Array(3))[0]=this.longitude,t[1]=this.latitude,t[2]=this.height,t}static clone(t,e){return(e=e||new p).longitude=t.longitude,e.latitude=t.latitude,e.height=t.height,e}}p.ZERO=Object.freeze(new p(0,0,0));const M=52.35987755982988,_=3.141592653589793,f=6378245,w=.006693421622965943,S=function(t,e){var r=2*(t=+t)-100+3*(e=+e)+.2*e*e+.1*t*e+.2*Math.sqrt(Math.abs(t));return(r+=2*(20*Math.sin(6*t*_)+20*Math.sin(2*t*_))/3)+2*(20*Math.sin(e*_)+40*Math.sin(e/3*_))/3+2*(160*Math.sin(e/12*_)+320*Math.sin(e*_/30))/3},v=function(t,e){return e=300+(t=+t)+2*(e=+e)+.1*t*t+.1*t*e+.1*Math.sqrt(Math.abs(t)),(e+=2*(20*Math.sin(6*t*_)+20*Math.sin(2*t*_))/3)+2*(20*Math.sin(t*_)+40*Math.sin(t/3*_))/3+2*(150*Math.sin(t/12*_)+300*Math.sin(t/30*_))/3},O=function(t,e){return e=+e,!(73.66<(t=+t)&&t<135.05&&3.86<e&&e<53.55)};class q{static bd09togcj02(t,e){t=(t=+t)-.0065,e=(e=+e)-.006;var r=Math.sqrt(t*t+e*e)-2e-5*Math.sin(e*M);return e=Math.atan2(e,t)-3e-6*Math.cos(t*M),[r*Math.cos(e),r*Math.sin(e)]}static gcj02tobd09(t,e){e=+e,t=+t;var r=Math.sqrt(t*t+e*e)+2e-5*Math.sin(e*M);return e=Math.atan2(e,t)+3e-6*Math.cos(t*M),[r*Math.cos(e)+.0065,r*Math.sin(e)+.006]}static wgs84togcj02(t,e){var r,i,s,a,h;return O(t=+t,e=+e)?[t,e]:(a=S(t-105,e-35),h=v(t-105,e-35),r=e/180*_,i=Math.sin(r),i=1-w*i*i,s=Math.sqrt(i),a=180*a/(f*(1-w)/(i*s)*_),[t+(h=180*h/(f/s*Math.cos(r)*_)),e+a])}static gcj02towgs84(t,e){var r,i,s,a,h;return O(t=+t,e=+e)?[t,e]:(a=S(t-105,e-35),h=v(t-105,e-35),r=e/180*_,i=Math.sin(r),i=1-w*i*i,s=Math.sqrt(i),a=180*a/(f*(1-w)/(i*s)*_),[2*t-(t+(h=180*h/(f/s*Math.cos(r)*_))),2*e-(e+a)])}static bd09towgs84(t,e){return t=this.bd09togcj02(t,e),this.gcj02towgs84(t[0],t[1])}static wgs84tobd09(t,e){return t=this.wgs84togcj02(t,e),this.gcj02tobd09(t[0],t[1])}}class E{get width(){return this._width}get height(){return this._height}get south(){return this._south}get north(){return this._north}get east(){return this._east}get west(){return this._west}get southWest(){return this._southWest}get northWest(){return this._northWest}get southEast(){return this._southEast}get northEast(){return this._northEast}get center(){return this._center}constructor(t,e,r,i){this._west=0,this._south=0,this._east=0,this._north=0,this._west=t,this._south=e,this._east=r,this._north=i,this._southWest=new m(this._west,this._south,0),this._northWest=new m(this._west,this._north,0),this._southEast=new m(this._east,this._south,0),this._northEast=new m(this._east,this._north,0),this._width=this.computeWidth(),this._height=this.computeHeight(),t=this._east-this._west,e=this._north-this._south,this._center=new m(this._west+t/2,this._south+e/2,0)}computeWidth(){return Math.abs(this._east-this._west)}computeHeight(){return Math.abs(this._north-this._south)}clone(){return new E(this._west,this._south,this._east,this._north)}containsCartesian2(t){return this._west<=t.x&&this._east>=t.x&&this._south<=t.y&&this._north>=t.y}contains(t){return this.containsCartesian2(t.southWest)&&this.containsCartesian2(t.northEast)}static center(t,e){let r=t.east;var i=(r<(i=t.west)&&(r+=a.TWO_PI),a.negativePiToPi(.5*(i+r)));return t=.5*(t.south+t.north),e?(e.longitude=i,e.latitude=t):e=new p(i,t,0),e}}class P{constructor(t=0,e=0){this.x=0,this.y=0,this.x=t,this.y=e}clone(t){return t?(t.set(this.x,this.y),t):new P(this.x,this.y)}set(t,e){return t&&"object"==typeof t?(this.x=t.x,this.y=t.y):(this.x=t||0,this.y=e||0),this}copy(t){return t.set(this.x,this.y),t}equals(t){return this.x===t.x&&this.y===t.y}toString(){return`(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`}lerp(t,e){var r=this.x,i=this.y;return this.x=r+e*(t.x-r),this.y=i+e*(t.y-i),this}clampf(t,e){return this.x=a.clamp(this.x,t.x,e.x),this.y=a.clamp(this.y,t.y,e.y),this}add(t){return this.x+=t.x,this.y+=t.y,this}add2f(t,e){return this.x+=t,this.y+=e,this}subtract(t){return this.x-=t.x,this.y-=t.y,this}subtract2f(t,e){return this.x-=t,this.y-=e,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiply2f(t,e){return this.x*=t,this.y*=e,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divide2f(t,e){return this.x/=t,this.y/=e,this}negative(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}lengthSqr(){return this.x*this.x+this.y*this.y}normalize(){var t=this.x,e=this.y;return 0<(t=t*t+e*e)&&(t=1/Math.sqrt(t),this.x*=t,this.y*=t),this}angle(t){var e=this.lengthSqr(),r=t.lengthSqr();return 0===e||0===r?(console.warn("Can't get angle between zero vector"),0):(t=this.dot(t)/Math.sqrt(e*r),t=a.clamp(t,-1,1),Math.acos(t))}signAngle(t){var e=this.angle(t);return this.cross(t)<0?-e:e}rotate(t){var e=this.x,r=this.y,i=Math.sin(t);return t=Math.cos(t),this.x=t*e-i*r,this.y=i*e+t*r,this}project(t){var e=this.dot(t)/t.dot(t);return this.x=t.x*e,this.y=t.y*e,this}distance(t){return Math.sqrt(Math.pow(this.x-t.x,2)+Math.pow(this.y-t.y,2))}toVec2(t){return(t=t||new d.Vector2).set(this.x,this.y),t}static fromArray(t,e){return(e=e||new P).set(t[0],t[1]),e}static fromCartesian2(t,e){return(e=e||new P).set(t.x,e.y),e}static fromCartesian3(t,e){return e=e||new P,this.set(e,t.x,t.y)}static clone(t){return new P(t.x,t.y)}static copy(t,e){return t.x=e.x,t.y=e.y,t}static set(t,e,r){return t.x=e,t.y=r,t}static add(t,e,r){return t.x=e.x+r.x,t.y=e.y+r.y,t}static subtract(t,e,r){return t.x=e.x-r.x,t.y=e.y-r.y,t}static multiply(t,e,r){return t.x=e.x*r.x,t.y=e.y*r.y,t}static divide(t,e,r){return t.x=e.x/r.x,t.y=e.y/r.y,t}static ceil(t,e){return t.x=Math.ceil(e.x),t.y=Math.ceil(e.y),t}static floor(t,e){return t.x=Math.floor(e.x),t.y=Math.floor(e.y),t}static min(t,e,r){return t.x=Math.min(e.x,r.x),t.y=Math.min(e.y,r.y),t}static max(t,e,r){return t.x=Math.max(e.x,r.x),t.y=Math.max(e.y,r.y),t}static round(t,e){return t.x=Math.round(e.x),t.y=Math.round(e.y),t}static multiplyScalar(t,e,r){return t.x=e.x*r,t.y=e.y*r,t}static scaleAndAdd(t,e,r,i){return t.x=e.x+r.x*i,t.y=e.y+r.y*i,t}static distance(t,e){var r=e.x-t.x;return e=e.y-t.y,Math.sqrt(r*r+e*e)}static squaredDistance(t,e){var r=e.x-t.x;return r*r+(e=e.y-t.y)*e}static len(t){var e=t.x;return t=t.y,Math.sqrt(e*e+t*t)}static lengthSqr(t){var e=t.x;return e*e+(t=t.y)*t}static negate(t,e){return t.x=-e.x,t.y=-e.y,t}static inverse(t,e){return t.x=1/e.x,t.y=1/e.y,t}static inverseSafe(t,e){var r=e.x;return e=e.y,Math.abs(r)<a.EPSILON6?t.x=0:t.x=1/r,Math.abs(e)<a.EPSILON6?t.y=0:t.y=1/e,t}static normalize(t,e){var r=e.x,i=r*r+(e=e.y)*e;return 0<i&&(i=1/Math.sqrt(i),t.x=r*i,t.y=e*i),t}static dot(t,e){return t.x*e.x+t.y*e.y}static cross(t,e,r){return t instanceof m?(t.x=t.y=0,t.z=e.x*r.y-e.y*r.x,t):t.x*e.y-t.y*e.x}static lerp(t,e,r,i){var s=e.x;return e=e.y,t.x=s+i*(r.x-s),t.y=e+i*(r.y-e),t}static random(t,e){e=e||1;var r=2*Math.random()*Math.PI;return t.x=Math.cos(r)*e,t.y=Math.sin(r)*e,t}static angle(t,e){return P.normalize(b,t),P.normalize(I,e),1<(t=P.dot(b,I))?0:t<-1?Math.PI:Math.acos(t)}static toVec2(t,e){return t.toVec2(e)}}P.ZERO=Object.freeze(new P(0,0)),P.ONE=Object.freeze(new P(1,1)),P.NEG_ONE=Object.freeze(new P(-1,-1)),P.UNIT_X=Object.freeze(new P(1,0)),P.UNIT_Y=Object.freeze(new P(0,1));const b=new P(0,0),I=new P(0,0);let j=new m,N=new m;const A=new m,C=new m,R=new m,T=new m,L=new m;class D{get radii(){return this._radii}get radiiSquared(){return this._radiiSquared}get radiiToTheFourth(){return this._radiiToTheFourth}get oneOverRadii(){return this._oneOverRadii}get oneOverRadiiSquared(){return this._oneOverRadiiSquared}get minimumRadius(){return this._minimumRadius}get maximumRadius(){return this._maximumRadius}get centerToleranceSquared(){return this._centerToleranceSquared}get squaredXOverSquaredZ(){return this._squaredXOverSquaredZ}constructor(t=0,e=0,r=0){this._x=t,this._y=e,this._z=r,this._radii=new m(t,e,r),this._radiiSquared=new m(t*t,e*e,r*r),this._radiiToTheFourth=new m(t*t*t*t,e*e*e*e,r*r*r*r),this._oneOverRadii=new m(0===t?0:1/t,0===e?0:1/e,0===r?0:1/r),this._oneOverRadiiSquared=new m(0===t?0:1/(t*t),0===e?0:1/(e*e),0===r?0:1/(r*r)),this._minimumRadius=Math.min(t,e,r),this._maximumRadius=Math.max(t,e,r),this._centerToleranceSquared=a.EPSILON1,0!==this._radiiSquared.z&&(this._squaredXOverSquaredZ=this._radiiSquared.x/this._radiiSquared.z)}clone(){return new D(this._x,this._y,this._z)}fromCartesian3(t){return new D(t.x,t.y,t.z)}scaleToGeodeticSurface(t,e){{var r=this._oneOverRadii,i=this._oneOverRadiiSquared,s=this._centerToleranceSquared,h=t.x,n=t.y,o=t.z,u=h*h*(l=r.x)*l,c=n*n*(x=r.y)*x,y=o*o*(r=r.z)*r,l=u+c+y,x=Math.sqrt(1/l);if(r=m.multiplyScalar(j,t,x),l<s)return isFinite(x)?r.clone(e):void 0;var d=i.x,g=i.y,z=i.z;(l=N).x=r.x*d*2,l.y=r.y*g*2,l.z=r.z*z*2;let v,O,q,E=(1-x)*m.len(t)/(.5*m.len(l)),P=0;do{E-=P,v=1/(1+E*d),O=1/(1+E*g),q=1/(1+E*z);var p=O*O,M=q*q,_=(S=v*v)*v,f=p*O,w=M*q,S=u*S+c*p+y*M-1}while(P=S/(-2*(u*_*d+c*f*g+y*w*z)),Math.abs(S)>a.EPSILON12);return e?(e.x=h*v,e.y=n*O,e.z=o*q,e):new m(h*v,n*O,o*q)}}geodeticSurfaceNormal(t,e){return m.equalsEpsilon(t,m.ZERO,a.EPSILON14)?void 0:(e=e||new m,e=m.multiply(e,t,this._oneOverRadiiSquared),m.normalize(e,e))}scaleToGeocentricSurface(t,e){e=e||new m;var r=t.x,i=t.y,s=t.z,a=this._oneOverRadiiSquared;return r=1/Math.sqrt(r*r*a.x+i*i*a.y+s*s*a.z),m.multiplyScalar(e,t,r)}geodeticSurfaceNormalCartographic(t,e){var r=t.longitude,i=(t=t.latitude,(s=Math.cos(t))*Math.cos(r)),s=s*Math.sin(r);return r=Math.sin(t),(e=e||new m).x=i,e.y=s,e.z=r,m.normalize(e,e)}cartesianToCartographic(t,e){var r,i,s=this.scaleToGeodeticSurface(t,C);return s?(i=this.geodeticSurfaceNormal(s,A),s=m.subtract(R,t,s),r=Math.atan2(i.y,i.x),i=Math.asin(i.z),t=Math.sign(m.dot(s,t))*m.len(s),e?(e.longitude=r,e.latitude=i,e.height=t,e):new p(r,i,t)):void 0}cartographicToCartesian(t,e){var r=T,i=L,s=(this.geodeticSurfaceNormalCartographic(t,r),m.multiply(i,this._radiiSquared,r),Math.sqrt(m.dot(r,i)));return m.multiplyScalar(i,i,1/s),m.multiplyScalar(r,r,t.height),e=e||new m,m.add(e,i,r)}}const W=new D(6378137,6378137,6356752.314245179);class G{get ellipsoid(){return this._ellipsoid}get center(){return new P(0,0)}get rectangle(){return this._rectangle}constructor(t){this._center=new P(0,0),this._ellipsoid=null!=t?t:W,this._rectangle=null}project(t,e){throw new Error("Method not implemented.")}unproject(t,e){throw new Error("Method not implemented.")}}class V extends G{constructor(t,e){super(t),this.R=6378137,e?this._rectangle=e.clone():(this._semimajorAxis=this.ellipsoid.maximumRadius,this._oneOverSemimajorAxis=1/this._semimajorAxis,this._maximumLatitude=this.mercatorAngleToGeodeticLatitude(Math.PI),t=this.R*Math.PI,this._rectangle=new E(-t,-t,t,t))}project(t,e){return this.doProject(this.center,t,e)}doProject(t,e,r){var i=this._semimajorAxis,s=e.longitude*i;return i=this.geodeticLatitudeToMercatorAngle(e.latitude)*i,e=e.height,s-=t.x,i-=t.y,r?(r.x=s,r.y=i,r.z=e,r):new m(s,i,e)}unproject(t,e){var r=this.center,i=this._oneOverSemimajorAxis,s=(t.x+r.x)*i;return r=this.mercatorAngleToGeodeticLatitude((t.y+r.y)*i),i=t.z,e?(e.longitude=s,e.latitude=r,e.height=i,e):new p(s,r,i)}mercatorAngleToGeodeticLatitude(t){return a.PI_OVER_TWO-2*Math.atan(Math.exp(-t))}geodeticLatitudeToMercatorAngle(t){return t>this._maximumLatitude?t=this._maximumLatitude:t<-this._maximumLatitude&&(t=-this._maximumLatitude),t=Math.sin(t),.5*Math.log((1+t)/(1-t))}}const Z=Object.freeze(new V),F=t;class B{constructor(){this.elements=[],this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]}set(t,e,r,i,s,a,h,n,o,u,c,y,l,x,d,m){var g=this.elements;return g[0]=t,g[4]=e,g[8]=r,g[12]=i,g[1]=s,g[5]=a,g[9]=h,g[13]=n,g[2]=o,g[6]=u,g[10]=c,g[14]=y,g[3]=l,g[7]=x,g[11]=d,g[15]=m,this}fromArray(t,e=0){for(let r=0;r<16;r++)this.elements[r]=t[r+e];return this}makeTranslation(t,e,r){return this.set(1,0,0,t,0,1,0,e,0,0,1,r,0,0,0,1),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){t=t.elements,e=e.elements;var r=this.elements,i=t[0],s=t[4],a=t[8],h=t[12],n=t[1],o=t[5],u=t[9],c=t[13],y=t[2],l=t[6],x=t[10],d=t[14],m=t[3],g=t[7],z=t[11],p=(t=t[15],e[0]),M=e[4],_=e[8],f=e[12],w=e[1],S=e[5],v=e[9],O=e[13],q=e[2],E=e[6],P=e[10],b=e[14],I=e[3],j=e[7],N=e[11];return e=e[15],r[0]=i*p+s*w+a*q+h*I,r[4]=i*M+s*S+a*E+h*j,r[8]=i*_+s*v+a*P+h*N,r[12]=i*f+s*O+a*b+h*e,r[1]=n*p+o*w+u*q+c*I,r[5]=n*M+o*S+u*E+c*j,r[9]=n*_+o*v+u*P+c*N,r[13]=n*f+o*O+u*b+c*e,r[2]=y*p+l*w+x*q+d*I,r[6]=y*M+l*S+x*E+d*j,r[10]=y*_+l*v+x*P+d*N,r[14]=y*f+l*O+x*b+d*e,r[3]=m*p+g*w+z*q+t*I,r[7]=m*M+g*S+z*E+t*j,r[11]=m*_+g*v+z*P+t*N,r[15]=m*f+g*O+z*b+t*e,this}getTranslation(t){return t.x=this.elements[12],t.y=this.elements[13],t.z=this.elements[14],t}}let U=new B,k=new m,X=new class extends G{get ellipsoid(){return this._ellipsoid}constructor(t){super(t),this.R=6378137,this._semimajorAxis=this._ellipsoid.maximumRadius,this._oneOverSemimajorAxis=1/this._semimajorAxis}getRectangle(){var t;return void 0===this.rectangle&&(t=this.R*Math.PI,this._rectangle=new E(-t,-t,t,t)),this.rectangle}project(t,e){var r=this._semimajorAxis,i=t.longitude*r;return r=t.latitude*r,t=t.height,x.defined(e)?(e.x=i,e.y=r,e.z=t,e):new m(i,r,t)}unproject(t,e){var r=this._oneOverSemimajorAxis,i=t.x*r;return r=t.y*r,t=t.z,x.defined(e)?(e.longitude=i,e.latitude=r,e.height=t,e):new p(i,r,t)}},Y=new p,H=new m,$=new m;class J{static projectRtcCartesian3(t,e,r,i,s){return(i=U.makeTranslation(i.x,i.y,i.z)).premultiply(r),r=r.getTranslation(k),r=X.ellipsoid.cartesianToCartographic(r,Y),this.transformWGS84Coordinate(r,e,r),r=t.project(r,H),i=i.getTranslation(k),i=X.ellipsoid.cartesianToCartographic(i,Y),this.transformWGS84Coordinate(i,e,i),e=t.project(i,$),m.subtract(s,e,r)}static transformWGS84Coordinate(t,r,i){if(r===e.NONE)return t;var s,h=a.toDegree(t.longitude),n=a.toDegree(t.latitude);let o,u;return i=x.defined(i)?i:new p,r===e.GCJ02?(o=(s=q.wgs84togcj02(h,n))[0],u=s[1]):r===e.BD09&&(o=(s=q.wgs84tobd09(h,n))[0],u=s[1]),i.longitude=a.toRadian(o),i.latitude=a.toRadian(u),i.height=t.height,i}}transform_worker=s})();