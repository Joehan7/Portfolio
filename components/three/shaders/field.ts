export const vertexShader = `
uniform float uTime; uniform vec2 uPointer; varying float vSignal; varying float vAlpha;
void main(){
 vec3 p=position;
 p.z=sin(p.x*.65+uTime*.11)*1.2+cos(p.y*.85+p.x*.2+uTime*.09)*.8;
 float distanceToPointer=distance(p.xy,uPointer); float force=smoothstep(2.2,0.0,distanceToPointer);
 p.xy+=normalize(p.xy-uPointer+.001)*force*.5;p.z+=force*.8;
 vSignal=fract(sin(dot(position.xy,vec2(12.9898,78.233)))*43758.5453);
 vAlpha=.22+smoothstep(-1.5,1.5,p.z)*.6;
 vec4 mvPosition=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mvPosition;
 gl_PointSize=(vSignal>.989?3.3:1.5)*(10.0/-mvPosition.z);
}`;
export const fragmentShader = `
uniform vec3 uSlate; uniform vec3 uLow; uniform vec3 uMedium; varying float vSignal; varying float vAlpha;
void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;vec3 color=uSlate;if(vSignal>.995)color=uMedium;else if(vSignal>.989)color=uLow;gl_FragColor=vec4(color,vAlpha*(1.-smoothstep(.25,.5,d)));}
`;
