import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import * as THREE from 'three';
import digitalHead from '@/assets/auditor-digital-head.jpg';
import { auditorDigitalFrame } from './auditor-journey';

type Samples = { head: number[]; dna: number[]; network: number[]; payment: number[]; globe: number[]; strength: number[] };
const vertex = `
attribute vec3 dnaPosition; attribute vec3 networkPosition; attribute vec3 paymentPosition; attribute vec3 globePosition;
attribute float strength;
uniform float uDna; uniform float uNetwork; uniform float uPayment; uniform float uGlobe; uniform float uTime; uniform float uRatio;
varying float vLight;
void main(){
  vec3 head=position;
  float angle=sin(uTime*.19)*.1;
  head.xz=mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*head.xz;
  vec3 dna=dnaPosition;
  dna.x+=sin(dna.y*.55-uTime*.85)*.09; dna.z+=cos(dna.y*.55-uTime*.85)*.12;
  vec3 p=mix(head,dna,uDna);
  p=mix(p,networkPosition,uNetwork);
  vec3 flow=paymentPosition; flow.z+=sin(flow.y*.35-uTime*.4)*.18;
  p=mix(p,flow,uPayment);
  vec3 globe=globePosition;
  float spin=uTime*.055; globe.xz=mat2(cos(spin),-sin(spin),sin(spin),cos(spin))*globe.xz;
  p=mix(p,globe,uGlobe);
  float pulse=pow(.5+.5*sin(p.y*.75-uTime*.8+strength*5.),12.);
  vLight= strength*(.7+.65*pulse);
  vec4 mv=modelViewMatrix*vec4(p,1.);
  gl_PointSize=clamp((1.2+strength*.6)*uRatio*18./max(2.,-mv.z),1.,5.);
  gl_Position=projectionMatrix*mv;
}`;
const fragment = `uniform vec3 uColor; uniform vec3 uPaper; varying float vLight;
void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;
float glow=exp(-r*r*4.5);gl_FragColor=vec4(mix(uColor,uPaper,.18)*(.85+vLight*.45),glow*vLight*.85);}`;

function readColor(name: string) {
  const c=document.createElement('canvas'); c.width=c.height=1;
  const ctx=c.getContext('2d');
  if(!ctx) return new THREE.Color();
  ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue(name).trim();ctx.fillRect(0,0,1,1);
  const v=ctx.getImageData(0,0,1,1).data;
  return new THREE.Color(`rgb(${v[0]},${v[1]},${v[2]})`);
}

function sampleHead(image: HTMLImageElement): Samples | null {
  const canvas=document.createElement('canvas');const size=320;canvas.width=canvas.height=size;
  const ctx=canvas.getContext('2d');if(!ctx)return null;
  ctx.drawImage(image,0,0,size,size);const pixels=ctx.getImageData(0,0,size,size).data;
  const data:Samples={head:[],dna:[],network:[],payment:[],globe:[],strength:[]};
  for(let y=3;y<size-3;y++)for(let x=3;x<size-3;x++){
    const i=(y*size+x)*4;const lum=((pixels[i]??0)*.21+(pixels[i+1]??0)*.72+(pixels[i+2]??0)*.07)/255;
    if(lum<.12 || ((x+y)%2===0 && lum<.4))continue;
    const nx=(x/size-.5)*2,ny=(.5-y/size)*2;
    const depth=Math.sqrt(Math.max(0,1-nx*nx-ny*ny))*.9+lum*.38;
    data.head.push(nx*5.8,ny*5.8,depth*2);
    const strand=x%2,filament=Math.floor(x/2)%48;
    const dy=ny*9,phase=strand*Math.PI+(filament-23.5)*.022;
    const radius=1.45+Math.sin(filament*2.399)*.24;
    const a=dy*.44+phase+Math.sin(dy*1.1+filament*.8)*.085;
    // Exactly the homepage's 48-filament woven helix, including fine cross-links.
    const rung=y%24===0;const t=x/size;
    data.dna.push(rung?Math.cos(a)*radius*(1-2*t):Math.cos(a)*radius,dy,rung?Math.sin(a)*radius*(1-2*t):Math.sin(a)*radius);
    const edge=Math.floor(x/40),lane=edge%8,along=y/size;
    const start=new THREE.Vector3(Math.cos(lane*2.399)*6,Math.sin(lane*2.399)*6,-(lane%3)*2);
    const end=new THREE.Vector3(Math.cos((lane+3)*2.399)*6,Math.sin((lane+3)*2.399)*6,-((lane+3)%3)*2);
    const p=start.lerp(end,along);data.network.push(p.x,p.y,p.z);
    const arc=along*Math.PI*2;const r=3.4+(lane%3)*.32;
    data.payment.push(Math.cos(arc)*r,Math.sin(arc)*r+(lane-3.5)*.18,-lane*.7);
    const lat=ny*Math.PI/2,lon=(x/size)*Math.PI*2;
    data.globe.push(4.5*Math.cos(lat)*Math.cos(lon),4.5*Math.sin(lat),4.5*Math.cos(lat)*Math.sin(lon));
    data.strength.push(.25+Math.pow(lum,.65)*.9);
  }
  return data;
}
function FibreJourney({ samples, journey }: {samples:Samples;journey:MutableRefObject<number>}) {
  const group=useRef<THREE.Group>(null);
  const reduced=useRef(false);
  useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>{reduced.current=media.matches;};update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
  const data=useMemo(()=>{
    const geometry=new THREE.BufferGeometry();
    for(const [name,values] of Object.entries({position:samples.head,dnaPosition:samples.dna,networkPosition:samples.network,paymentPosition:samples.payment,globePosition:samples.globe}))geometry.setAttribute(name,new THREE.Float32BufferAttribute(values,3));
    geometry.setAttribute('strength',new THREE.Float32BufferAttribute(samples.strength,1));
    const material=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,uniforms:{uDna:{value:0},uNetwork:{value:0},uPayment:{value:0},uGlobe:{value:0},uTime:{value:0},uRatio:{value:1},uColor:{value:readColor('--primary')},uPaper:{value:readColor('--foreground')}}});
    return {geometry,material};
  },[samples]);
  useEffect(()=>()=>{data.geometry.dispose();data.material.dispose();},[data]);
  const constellation=useMemo(()=>{
    const nodes:number[]=[];const pts:THREE.Vector3[]=[];
    for(let i=0;i<34;i++){const a=i*2.399,r=1.5+((i*37)%11)/11*5;const v=new THREE.Vector3(Math.cos(a)*r,Math.sin(a*1.3)*r*.75,-(i%4)*1.2);pts.push(v);nodes.push(v.x,v.y,v.z);}
    const lines:number[]=[];pts.forEach((p,i)=>{pts.map((q,j)=>({j,d:p.distanceTo(q)})).filter(o=>o.j>i).sort((x,y)=>x.d-y.d).slice(0,2).forEach(o=>{const q=pts[o.j]!;lines.push(p.x,p.y,p.z,q.x,q.y,q.z);});});
    const ng=new THREE.BufferGeometry();ng.setAttribute('position',new THREE.Float32BufferAttribute(nodes,3));
    const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(lines,3));
    const color=readColor('--primary');
    const nm=new THREE.PointsMaterial({color,size:.32,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,map:(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d')!;const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'#fff');g.addColorStop(.25,'rgba(255,255,255,.85)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})()});
    const lm=new THREE.LineBasicMaterial({color,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
    return {ng,lg,nm,lm};
  },[]);
  useEffect(()=>()=>{constellation.ng.dispose();constellation.lg.dispose();constellation.nm.dispose();constellation.lm.dispose();},[constellation]);
  const elapsed=useRef(0);
  useFrame(({camera,size,gl},delta)=>{
    if(!(camera instanceof THREE.PerspectiveCamera)||!group.current)return;
    elapsed.current+=reduced.current?0:Math.min(delta,.05);
    const score=auditorDigitalFrame(journey.current,reduced.current);
    const uniforms=data.material.uniforms as Record<string,{value:unknown}> as any;
    uniforms.uDna.value=score.dna;uniforms.uNetwork.value=score.network;uniforms.uPayment.value=score.payment;uniforms.uGlobe.value=score.globe;
    uniforms.uTime.value=elapsed.current;uniforms.uRatio.value=gl.getPixelRatio();
    const link=score.network*(1-score.payment);
    constellation.nm.opacity=link*.95;constellation.lm.opacity=link*.28;
    const mobile=size.width<700;
    camera.position.set(score.cameraX,Math.sin(journey.current*.7)*.5,score.cameraZ);
    camera.lookAt(0,0,0);
    const h=2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*score.cameraZ;
    const headScale=mobile?Math.min(h*.42/11,h*camera.aspect*.85/11):h*.7/11;
    const dnaScale=h*(mobile?.72:.94)/18;
    group.current.scale.setScalar(THREE.MathUtils.lerp(headScale,dnaScale,score.dna)*(1+score.network*.24));
    group.current.position.set(mobile?0:h*camera.aspect*.21*(1-score.dna),mobile?h*.21:h*.08,0);
    group.current.rotation.y=reduced.current?0:Math.sin(elapsed.current*.15)*.035;
    gl.domElement.dataset['morph']=score.dna.toFixed(3);gl.domElement.dataset['journey']=journey.current.toFixed(3);
  });
  return <group ref={group}><points geometry={data.geometry} material={data.material} frustumCulled={false}/><points geometry={constellation.ng} material={constellation.nm}/><lineSegments geometry={constellation.lg} material={constellation.lm}/></group>;
}
export function AuditorDigitalWorld({journey}:{journey:MutableRefObject<number>}){
  const [samples,setSamples]=useState<Samples|null>(null);
  useEffect(()=>{let alive=true;const image=new Image();image.onload=()=>{if(alive)setSamples(sampleHead(image));};image.src=digitalHead;return()=>{alive=false;};},[]);
  return <div className="aj-backdrop aj-digital" aria-hidden="true"><div className="aj-tints">{[0,1,2,3,4,5].map(i=><i key={i} className={`aj-tint aj-tint-${i}`}/>)}</div><Canvas camera={{position:[0,0,18],fov:43,near:.1,far:150}} dpr={[1,1.5]} gl={{antialias:true,alpha:true}}>{samples&&<FibreJourney samples={samples} journey={journey}/>}</Canvas><div className="aj-digital-shade"/></div>;
}
