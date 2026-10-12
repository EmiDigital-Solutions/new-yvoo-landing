import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import { orbitMorph } from "./orbit-morph";

type PixelData = { positions: number[]; brightness: number[]; color: string };

function PixelPart({ data, opacity, build, reducedMotion }: { data: PixelData; opacity: MutableRefObject<number>; build: MutableRefObject<number>; reducedMotion: boolean }) {
  const group = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(data.positions, 3));
    g.setAttribute("brightness", new THREE.Float32BufferAttribute(data.brightness, 1));
    return g;
  }, [data]);
  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    uniforms: { color: { value: new THREE.Color(data.color) }, opacity: { value: 1 }, build: { value: 0 }, time: { value: 0 }, ratio: { value: 1 } },
    vertexShader: `attribute float brightness; varying float light; uniform float time; uniform float ratio; uniform float build;
      void main(){
        float seed=fract(sin(dot(position.xy,vec2(12.9898,78.233)))*43758.5453);
        float threshold=(position.y+.5)*.72+seed*.20;
        float appear=smoothstep(threshold,threshold+.08,build);
        light=brightness*(.96+.04*sin(time*.7+position.y*8.))*appear;
        vec3 settled=position; settled.y-=.012*(1.-appear);
        gl_PointSize=3.2*ratio;gl_Position=projectionMatrix*modelViewMatrix*vec4(settled,1.);
      }`,
    fragmentShader: `uniform vec3 color; uniform float opacity; varying float light;
      void main(){vec2 p=abs(gl_PointCoord-.5)*2.;float edge=1.-smoothstep(.72,1.,max(p.x,p.y));gl_FragColor=vec4(color,edge*light*opacity);}`,
  }), [data]);
  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);
  useFrame(({ camera, clock, gl }) => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const height = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 10;
    const side = height * Math.min(camera.aspect, 1);
    group.current?.scale.setScalar(side);
    const alpha = material.uniforms['opacity']; if (alpha) alpha.value = opacity.current;
    const formation = material.uniforms['build']; if (formation) formation.value = build.current;
    const time = material.uniforms['time']; if (time) time.value = reducedMotion ? 0 : clock.elapsedTime;
    const ratio = material.uniforms['ratio']; if (ratio) ratio.value = gl.getPixelRatio();
  });
  return <points ref={group} position={[0, 0, 3]} geometry={geometry} material={material} />;
}

export function OrbitDna({ src, progress, reducedMotion }: { src: string; progress: number; reducedMotion: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<PixelData | null>(null);
  const opacity = useRef(1);
  const build = useRef(0);
  const morph = orbitMorph(progress, reducedMotion);
  opacity.current = morph.particles;
  build.current = morph.gather;
  useEffect(() => {
    const el = host.current; if (!el) return;
    let disposed = false;
    const image = new Image();
    image.onload = () => {
      if (disposed) return;
      const resolution = 160;
      const canvas = document.createElement("canvas"); canvas.width = resolution; canvas.height = resolution;
      const ctx = canvas.getContext("2d"); if (!ctx) return;
      ctx.fillStyle = getComputedStyle(el).getPropertyValue("--primary").trim(); ctx.fillRect(0, 0, 1, 1);
      const rgb = ctx.getImageData(0, 0, 1, 1).data;
      const color = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
      ctx.clearRect(0, 0, resolution, resolution); ctx.drawImage(image, 0, 0, resolution, resolution);
      const pixels = ctx.getImageData(0, 0, resolution, resolution).data;
      const positions: number[] = [], brightness: number[] = [];
      for (let y = 0; y < resolution; y += 2) for (let x = 0; x < resolution; x += 2) {
        const i = (y * resolution + x) * 4;
        if ((pixels[i + 3] ?? 0) < 120) continue;
        const lum = ((pixels[i] ?? 0) + (pixels[i + 1] ?? 0) + (pixels[i + 2] ?? 0)) / 765;
        positions.push(x / resolution - .5, .5 - y / resolution, 0);
        brightness.push(.58 + lum * .42);
      }
      setData({ positions, brightness, color });
    };
    image.src = src;
    return () => { disposed = true; };
  }, [src]);
  return <div className="v-orbit-dna" ref={host} aria-hidden="true">{data && <Canvas dpr={[1, 1.35]} camera={{ position: [0, 0, 13], fov: 43 }} gl={{ alpha: true, antialias: false }}>
    <PixelPart data={data} opacity={opacity} build={build} reducedMotion={reducedMotion} />
  </Canvas>}</div>;
}
