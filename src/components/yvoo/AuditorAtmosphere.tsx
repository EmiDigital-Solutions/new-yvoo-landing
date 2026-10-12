import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import type { InspectionPalette } from "./AuditorInspection";

export function AuditorAtmosphere({ progress, reduced, palette }: { progress: MutableRefObject<number>; reduced: boolean; palette: InspectionPalette }) {
  const dna = useRef<THREE.Group>(null);
  const tunnel = useRef<THREE.Group>(null);
  const data = useMemo(() => {
    const points: number[] = [], targets: number[] = [], phases: number[] = [];
    for (let strand = 0; strand < 2; strand++) for (let fibre = 0; fibre < 32; fibre++) for (let segment = 0; segment < 280; segment++) {
      for (const t of [segment / 280, (segment + 1) / 280]) {
        const y = (t - .5) * 8.8;
        const a = t * Math.PI * 5 + strand * Math.PI + (fibre - 16) * .019;
        const radius = 1.22 + Math.sin(fibre * .61) * .085;
        points.push(Math.cos(a) * radius, y, Math.sin(a) * radius);
        const row = Math.floor(segment / 40), fraction = (segment % 40 + (t * 280 - segment)) / 40;
        const side = strand === 0 ? -1 : 1;
        targets.push(side * (1.1 + Math.sin(row * 1.7) * .7) + fraction * Math.cos(row * 2) * 1.5, (row - 3) * 1.15 + fraction * .8, Math.sin(row * 2.1) * 1.2 + fibre * .009);
        phases.push(t + fibre * .035);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    geometry.setAttribute("target", new THREE.Float32BufferAttribute(targets, 3));
    geometry.setAttribute("phase", new THREE.Float32BufferAttribute(phases, 1));
    const material = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { time: { value: 0 }, opacity: { value: 0 }, morph: { value: 0 }, lime: { value: new THREE.Color(palette.lime) } },
      vertexShader: `attribute vec3 target; attribute float phase; uniform float time; uniform float morph; varying float vPulse; void main(){vec3 p=mix(position,target,morph);p.x+=sin(position.y*.7+time*.4)*.035*(1.-morph);vPulse=.28+.72*pow(max(0.,sin(phase*19.-time*1.2)),8.);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
      fragmentShader: `uniform vec3 lime; uniform float opacity; varying float vPulse; void main(){gl_FragColor=vec4(lime*(.8+vPulse*.7),opacity*(.2+vPulse*.55));}`,
    });
    return { geometry, material };
  }, [palette.lime]);
  const tunnelGeometry = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(17, 11, .05)), []);
  useFrame(({ clock, size }) => {
    const p = progress.current;
    const active = THREE.MathUtils.smoothstep(p, .08, .12) * (1 - THREE.MathUtils.smoothstep(p, .295, .33)) + THREE.MathUtils.smoothstep(p, .63, .68) * (1 - THREE.MathUtils.smoothstep(p, .75, .775)) + THREE.MathUtils.smoothstep(p, .865, .91);
    const opacity = data.material.uniforms['opacity'], time = data.material.uniforms['time'], morph = data.material.uniforms['morph'];
    if (opacity) opacity.value = active;
    if (time) time.value = reduced ? 0 : clock.elapsedTime;
    if (morph) morph.value = THREE.MathUtils.smoothstep(p, .185, .29) * (1 - THREE.MathUtils.smoothstep(p, .63, .68));
    if (dna.current) {
      dna.current.position.set(size.width < 800 ? .25 : 2.6, size.width < 800 ? 2.25 : .5, -p * 100);
      dna.current.scale.setScalar(size.width < 800 ? .6 : .87);
      dna.current.rotation.set(0, reduced ? 0 : Math.sin(p * 8) * .18, 0);
      dna.current.visible = active > .001;
    }
    if (tunnel.current) {
      tunnel.current.visible = p > .065 && p < .41 || p > .56 && p < .765 || p > .88;
      tunnel.current.children.forEach((child, i) => {
        if (!(child instanceof THREE.LineSegments) || !(child.material instanceof THREE.LineBasicMaterial)) return;
        const distance = Math.abs(child.position.z - (12 - p * 100));
        child.material.opacity = Math.max(0, .115 * (1 - distance / 65));
      });
    }
  });
  return <>
    <group ref={dna}><lineSegments geometry={data.geometry} material={data.material} /></group>
    <group ref={tunnel}>{Array.from({ length: 24 }, (_, i) => <lineSegments key={i} geometry={tunnelGeometry} position={[0, 0, 8 - i * 7]} rotation={[0, 0, Math.sin(i * .65) * .045]}><lineBasicMaterial color={i % 5 === 0 ? palette.lime : palette.light} transparent opacity={.08} depthWrite={false} /></lineSegments>)}</group>
  </>;
}