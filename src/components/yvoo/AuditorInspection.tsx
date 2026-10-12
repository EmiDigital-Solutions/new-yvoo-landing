import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import { auditorChapterIndex, auditorChapterProgress } from "./auditor-story";

export type InspectionPalette = { metal: string; lime: string; light: string; dark: string };

// A continuous inspection of a precision rotor: intact, exploded, verified.
export function AuditorInspection({ progress, reduced, palette }: { progress: MutableRefObject<number>; reduced: boolean; palette: InspectionPalette }) {
  const assembly = useRef<THREE.Group>(null);
  const front = useRef<THREE.Group>(null);
  const rear = useRef<THREE.Group>(null);
  const rotor = useRef<THREE.Group>(null);
  const checkpoints = useRef<THREE.Group>(null);
  const blade = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(.64, -.1); shape.bezierCurveTo(1.1, -.08, 1.65, .08, 2.06, .42);
    shape.lineTo(2.02, .67); shape.bezierCurveTo(1.48, .28, 1.02, .2, .64, .11); shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: .18, bevelEnabled: true, bevelThickness: .035, bevelSize: .035, bevelSegments: 3, steps: 1, curveSegments: 16 });
    geometry.center();
    geometry.translate(1.35, .25, 0);
    return geometry;
  }, []);
  const edges = useMemo(() => new THREE.EdgesGeometry(blade, 34), [blade]);
  useFrame(({ clock, viewport }) => {
    if (!assembly.current || !front.current || !rear.current || !rotor.current || !checkpoints.current) return;
    const p = progress.current;
    const index = auditorChapterIndex(p);
    const local = auditorChapterProgress(p, index);
    const time = reduced ? 0 : clock.elapsedTime;
    const preparation = THREE.MathUtils.smoothstep(p, .16, .25) * (1 - THREE.MathUtils.smoothstep(p, .31, .4));
    const exit = 1 - THREE.MathUtils.smoothstep(p, .395, .415);
    const returnScene = THREE.MathUtils.smoothstep(p, .555, .58);
    const portraitGap = 1 - THREE.MathUtils.smoothstep(p, .758, .785) + THREE.MathUtils.smoothstep(p, .875, .9);
    const visible = index === 3 || index === 5;
    assembly.current.visible = visible;
    const narrow = viewport.aspect < 1;
    assembly.current.position.set(narrow ? .25 : 3.05, narrow ? 2.5 : .1, -p * 100);
    const size = (narrow ? .73 : 1.16) * Math.max(.001, Math.min(exit + returnScene, portraitGap));
    assembly.current.scale.setScalar(size);
    assembly.current.rotation.set(.25 + Math.sin(p * 8) * .22, -.5 + p * 5.8, -.15);
    rotor.current.rotation.z = reduced ? p * 3 : p * 5 + time * .075;
    front.current.position.z = .35 + preparation * 1.65;
    rear.current.position.z = -.35 - preparation * 1.45;
    checkpoints.current.visible = index === 5 || index === 8;
    checkpoints.current.rotation.z = -.15 + (reduced ? 0 : Math.sin(time * .25) * .035);
    checkpoints.current.children.forEach((child, i) => {
      const reveal = THREE.MathUtils.smoothstep(local, i * .18, i * .18 + .2);
      child.scale.setScalar(.65 + .35 * reveal);
    });
  });
  return <group ref={assembly}>
    <group ref={rotor}>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.62, .75, .7, 64]} /><meshStandardMaterial color={palette.metal} metalness={.75} roughness={.26} /></mesh>
      {Array.from({ length: 22 }, (_, i) => <group key={i} rotation={[0, 0, i / 22 * Math.PI * 2]}>
        <mesh geometry={blade}><meshStandardMaterial color={palette.metal} metalness={.7} roughness={.32} /></mesh>
        <lineSegments geometry={edges}><lineBasicMaterial color={i % 4 === 0 ? palette.lime : palette.light} transparent opacity={i % 4 === 0 ? .85 : .14} /></lineSegments>
      </group>)}
    </group>
    <group ref={front}>
      <mesh><torusGeometry args={[.83, .08, 12, 80]} /><meshStandardMaterial color={palette.metal} metalness={.75} roughness={.25} /></mesh>
      <mesh position={[0, 0, .08]}><torusGeometry args={[.65, .016, 8, 80]} /><meshBasicMaterial color={palette.lime} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.29, .42, .44, 48]} /><meshStandardMaterial color={palette.metal} metalness={.8} roughness={.22} /></mesh>
      {Array.from({ length: 8 }, (_, i) => <mesh key={i} position={[Math.cos(i * Math.PI / 4) * .82, Math.sin(i * Math.PI / 4) * .82, .08]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.048, .048, .09, 6]} /><meshStandardMaterial color={palette.dark} metalness={.6} roughness={.35} /></mesh>)}
    </group>
    <group ref={rear}>
      <mesh><torusGeometry args={[1.94, .035, 10, 120]} /><meshStandardMaterial color={palette.metal} metalness={.75} roughness={.26} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.15, .15, 1.8, 32]} /><meshStandardMaterial color={palette.metal} metalness={.7} roughness={.24} /></mesh>
    </group>
    <group ref={checkpoints} position={[0, 0, 1]}>
      {[0, 1, 2].map(i => <group key={i} position={[(i - 1) * 1.45, -2.7, 0]}>
        <mesh><torusGeometry args={[.22, .014, 8, 48]} /><meshBasicMaterial color={palette.lime} /></mesh>
        <mesh rotation={[0, 0, -.7]} position={[-.06, -.01, 0]}><boxGeometry args={[.025, .12, .025]} /><meshBasicMaterial color={palette.lime} /></mesh>
        <mesh rotation={[0, 0, .7]} position={[.04, .02, 0]}><boxGeometry args={[.025, .23, .025]} /><meshBasicMaterial color={palette.lime} /></mesh>
      </group>)}
    </group>
  </group>;
}