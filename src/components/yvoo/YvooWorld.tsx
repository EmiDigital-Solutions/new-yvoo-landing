import { Environment, Lightformer, useProgress } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";

import { LuminousDna, LuminousNetwork, LuminousField } from "./LuminousScenes";
import { homeOpeningMotion, homeSceneVisibility, WALK_START } from "./home-scene-timeline";

const SCENE = {
  black: "#0e0f11",
  opening: "#000000",
  graphite: "#151a16",
  steel: "#a8b0a8",
  paper: "#eef1eb",
  lime: "#d1ee6c",
  warning: "#ff784f",
  gold: "#f2c879",
};

function ReadySignal({ onReady }: { onReady: () => void }) {
  const { active, progress } = useProgress();
  useEffect(() => {
    if (!active && progress === 100) onReady();
  }, [active, onReady, progress]);
  return null;
}

/** Hero: a slow, sparse drift of evidence motes in front of the part — depth without glare. */
function HeroDust({ story }: { story: MutableRefObject<number> }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const material = useRef<THREE.MeshBasicMaterial>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const offset = useMemo(() => new THREE.Vector3(), []);
  const count = 70;
  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    for (let index = 0; index < count; index += 1) {
      const angle = index * 2.399 + 0.7;
      const radius = 2.2 + (index % 13) * 0.62;
      dummy.position.set(Math.cos(angle) * radius, Math.sin(angle * 1.7) * radius * 0.55, -6.8 - (index % 9) * 0.55);
      dummy.scale.setScalar(index % 11 === 0 ? 0.035 : 0.014);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [dummy]);
  useFrame(({ clock, camera }) => {
    const motion = homeOpeningMotion(story.current);
    if (ref.current) {
      ref.current.rotation.z = clock.elapsedTime * 0.006;
      offset.set(0, motion.push * 0.6, -7 + motion.push * 3).applyQuaternion(camera.quaternion);
      ref.current.position.copy(camera.position).add(offset);
    }
    if (material.current) material.current.opacity = motion.motes * 0.48;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <circleGeometry args={[1, 8]} />
      <meshBasicMaterial ref={material} color={SCENE.lime} transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}


function SearchField() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = 180;
  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    for (let index = 0; index < count; index += 1) {
      const angle = index * 2.399;
      const radius = 4 + (index % 17) * 0.58;
      dummy.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.5, -18 - (index % 7) * 1.8);
      dummy.scale.setScalar(index % 19 === 0 ? 0.16 : 0.045);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [dummy]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <icosahedronGeometry args={[1, 1]} />
      <meshBasicMaterial color={SCENE.lime} transparent opacity={0.72} />
    </instancedMesh>
  );
}

function DeadlineCorridor() {
  return (
    <group position={[0, 0, -43]}>
      {Array.from({ length: 16 }, (_, index) => (
        <group key={index} position={[0, 0, -index * 2.15]}>
          <mesh position={[-6.4, 0, 0]}><boxGeometry args={[0.04, 9, 0.04]} /><meshBasicMaterial color={index < 5 ? SCENE.lime : SCENE.steel} transparent opacity={0.55} /></mesh>
          <mesh position={[6.4, 0, 0]}><boxGeometry args={[0.04, 9, 0.04]} /><meshBasicMaterial color={index < 5 ? SCENE.lime : SCENE.steel} transparent opacity={0.55} /></mesh>
          <mesh position={[0, 4.5, 0]}><boxGeometry args={[12.8, 0.04, 0.04]} /><meshBasicMaterial color={SCENE.steel} transparent opacity={0.28} /></mesh>
        </group>
      ))}
    </group>
  );
}

function EvidenceScanner() {
  const scan = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (scan.current) scan.current.position.y = Math.sin(clock.elapsedTime * 0.75) * 3.6;
  });
  return (
    <group position={[0, 0, -83]}>
      <mesh><boxGeometry args={[8.6, 7, 0.45]} /><meshPhysicalMaterial color={SCENE.graphite} metalness={0.58} roughness={0.2} clearcoat={1} /></mesh>
      {[-2.4, -0.8, 0.8, 2.4].map((y, index) => (
        <group key={y} position={[-2.5, y, 0.28]}>
          <mesh><boxGeometry args={[0.34, 0.34, 0.08]} /><meshBasicMaterial color={index < 2 ? SCENE.lime : SCENE.warning} /></mesh>
          <mesh position={[2.5, 0, 0]}><boxGeometry args={[4.2 - index * 0.4, 0.1, 0.08]} /><meshBasicMaterial color={index < 2 ? SCENE.paper : SCENE.warning} /></mesh>
        </group>
      ))}
      <mesh ref={scan} position={[0, 0, 0.55]}><boxGeometry args={[10.5, 0.035, 0.02]} /><meshBasicMaterial color={SCENE.lime} /></mesh>
      <pointLight color={SCENE.lime} intensity={22} distance={12} />
    </group>
  );
}

function ProofWall() {
  return (
    <group position={[0, 0, -186]}>
      {Array.from({ length: 40 }, (_, index) => {
        const col = index % 10;
        const row = Math.floor(index / 10);
        const accepted = index % 10 < 3;
        return (
          <mesh key={index} position={[(col - 4.5) * 1.15, (1.5 - row) * 1.4, (index % 3) * 0.12]}>
            <boxGeometry args={[0.86, 1.06, 0.1]} />
            <meshPhysicalMaterial color={accepted ? SCENE.lime : SCENE.paper} emissive={accepted ? SCENE.lime : SCENE.black} emissiveIntensity={accepted ? 1.5 : 0} roughness={0.52} transparent opacity={accepted ? 0.95 : 0.68} />
          </mesh>
        );
      })}
    </group>
  );
}

function ArchitectureChannels() {
  return (
    <group position={[0, 0, -216]}>
      {[-5.2, 0, 5.2].map((x, index) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh><boxGeometry args={[3.8, 5.5, 0.32]} /><meshPhysicalMaterial color={SCENE.graphite} metalness={0.4} roughness={0.23} clearcoat={1} /></mesh>
          <mesh position={[0, 0, 0.2]}><ringGeometry args={[0.82 + index * 0.12, 1 + index * 0.12, 48]} /><meshBasicMaterial color={index === 0 ? SCENE.lime : SCENE.paper} /></mesh>
        </group>
      ))}
      <mesh position={[0, -3.8, 0]}><boxGeometry args={[14.2, 0.08, 0.08]} /><meshBasicMaterial color={SCENE.lime} /></mesh>
    </group>
  );
}

function Journey({ progress, calm, story }: { progress: MutableRefObject<number>; calm: boolean; story: MutableRefObject<number> }) {
  const surroundings = useRef<THREE.Group>(null);
  const path = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 13), new THREE.Vector3(-1.2, 0.5, -9),
    new THREE.Vector3(1.4, -0.2, -37), new THREE.Vector3(-1.8, 0.4, -66),
    new THREE.Vector3(1.3, -0.3, -98), new THREE.Vector3(-1, 0.2, -126),
    new THREE.Vector3(1.5, 0, -160), new THREE.Vector3(-1.2, 0.3, -190),
    new THREE.Vector3(1, -0.2, -219), new THREE.Vector3(0, 0, -228),
  ]), []);
  const current = useRef(0);
  const position = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, clock }, delta) => {
    if (surroundings.current) surroundings.current.visible = homeSceneVisibility(story.current).surroundings && story.current < .9 && !(story.current >= .48 && story.current < .748);
    if (story.current < WALK_START) {
      const motion = homeOpeningMotion(story.current);
      camera.position.set(motion.push * 0.5, -motion.push * 1.4, 13 - motion.push * 10);
      camera.rotation.set(0, 0, 0);
      if (!calm) {
        camera.position.x += Math.sin(clock.elapsedTime * 0.2) * 0.025;
        camera.position.y += Math.cos(clock.elapsedTime * 0.17) * 0.02;
      }
      return;
    }
    current.current = calm ? progress.current : THREE.MathUtils.damp(current.current, progress.current, 5.1, Math.min(delta, 0.05));
    const t = THREE.MathUtils.clamp(current.current * 0.975, 0, 0.975);
    path.getPointAt(t, position);
    path.getPointAt(Math.min(t + 0.021, 1), target);
    camera.position.copy(position);
    if (calm) {
      camera.position.x = 0;
      camera.position.y = 0;
      camera.rotation.set(0, 0, 0);
      return;
    }
    camera.position.x += Math.sin(clock.elapsedTime * 0.2) * 0.05;
    camera.position.y += Math.cos(clock.elapsedTime * 0.17) * 0.04;
    camera.lookAt(target);
    camera.rotation.z = Math.sin(t * Math.PI * 7) * 0.018;
  });
  return <><HeroDust story={story} /><group ref={surroundings}><SearchField /><DeadlineCorridor /><EvidenceScanner /><ProofWall /><ArchitectureChannels /></group><LuminousDna progress={story} palette={SCENE} /><LuminousNetwork progress={story} palette={SCENE} /><LuminousField progress={story} palette={SCENE} /></>;
}

export function YvooWorld({ progress, onReady, active = true, calm = false, story }: { progress: MutableRefObject<number>; onReady: () => void; active?: boolean; calm?: boolean; story?: MutableRefObject<number> }) {
  return (
    <Canvas frameloop={active ? "always" : "never"} dpr={[1, 1.35]} camera={{ position: [0, 0, 13], fov: 43, near: 0.1, far: 300 }} gl={{ antialias: false, powerPreference: "high-performance", alpha: false }}>
      <ReadySignal onReady={onReady} />
      <color attach="background" args={[SCENE.opening]} />
      <fog attach="fog" args={["#0e0f11", 28, 78]} />
      <ambientLight intensity={0.58} color={SCENE.paper} />
      <directionalLight position={[5, 9, 7]} intensity={3} color={SCENE.paper} />
      <Environment resolution={128}>
        <Lightformer intensity={4} position={[0, 7, 2]} scale={[14, 2, 1]} />
        <Lightformer intensity={2.5} color={SCENE.lime} position={[-8, 0, -12]} rotation-y={Math.PI / 2} scale={[20, 1, 1]} />
      </Environment>
      <Journey progress={progress} calm={calm} story={story ?? progress} />
      <EffectComposer multisampling={0}>
        <Bloom intensity={0.48} luminanceThreshold={0.92} mipmapBlur />
        <Vignette offset={0.28} darkness={0.2} />
      </EffectComposer>
    </Canvas>
  );
}