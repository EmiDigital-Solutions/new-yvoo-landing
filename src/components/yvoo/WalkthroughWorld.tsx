import { Environment, Lightformer, useProgress, useTexture } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";

import officeImage from "@/assets/walk-office-clear.jpg";
import warehouseImage from "@/assets/walk-warehouse.jpg";
import productionImage from "@/assets/yvoo-modern-factory.jpg";
import labImage from "@/assets/walk-lab.jpg";
import dispatchImage from "@/assets/walk-dispatch.jpg";

const C = { black: "#0e0f11", steel: "#a8b0a8", lime: "#d1ee6c" };

/** Station z positions along the walkthrough; the camera passes through each plate. */
export const STATION_Z = [-26, -66, -106, -146, -186];
const DRONE_Z = -232;
const TUNNEL_START = 6;
const TUNNEL_END = -196;

function ReadySignal({ onReady }: { onReady: () => void }) {
  const { active, progress } = useProgress();
  useEffect(() => {
    if (!active && progress === 100) onReady();
  }, [active, onReady, progress]);
  return null;
}

export function Stations({ progress, calm }: { progress: MutableRefObject<number>; calm: boolean }) {
  const materials = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const office = useRef<THREE.Mesh>(null);
  useFrame(({ camera }) => {
    if (office.current && camera instanceof THREE.PerspectiveCamera && camera.position.z > -26) {
      const height = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (camera.position.z + 26);
      const width = Math.max(34, height * camera.aspect, height * 1.78);
      office.current.scale.set(width, width / 1.78, 1);
    }
    if (!calm) return;
    const station = THREE.MathUtils.clamp(progress.current / 0.8, 0, 1) * 4;
    materials.current.forEach((material, i) => {
      if (material) material.opacity = Math.max(0, 1 - Math.abs(station - i));
    });
  });
  const textures = useTexture([officeImage, warehouseImage, productionImage, labImage, dispatchImage]);
  const maxAniso = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  useEffect(() => {
    textures.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = Math.min(16, maxAniso);
    });
  }, [maxAniso, textures]);
  return (
    <>
      {STATION_Z.map((z, i) => (
        <mesh key={z} ref={i === 0 ? office : null} position={[0, 0, calm ? -26 + i * 0.01 : z]} scale={[34, 19.1, 1]}>
          <planeGeometry />
          <meshBasicMaterial ref={(m) => { materials.current[i] = m; }} map={textures[i] ?? null} fog={false} toneMapped={false} transparent={calm} depthWrite={!calm} opacity={calm && i > 0 ? 0 : 1} />
        </mesh>
      ))}
    </>
  );
}

/** Subtle static tunnel frames; camera movement supplies the sense of depth. */
export function Tunnel() {
  const frames = useMemo(() => {
    const list: Array<{ z: number; hot: boolean }> = [];
    for (let z = TUNNEL_START; z > TUNNEL_END; z -= 3) {
      const hot = STATION_Z.some((s) => z > s && z - s < 12);
      list.push({ z, hot });
    }
    return list;
  }, []);
  return (
    <group>
      {frames.map(({ z, hot }) => {
        const color = hot ? C.lime : C.steel;
        const o = hot ? 0.22 : 0.12;
        return (
          <group key={z} position={[0, 0, z]}>
            <mesh position={[-6.6, 0, 0]}><boxGeometry args={[0.035, 8.4, 0.035]} /><meshBasicMaterial color={color} transparent opacity={o} /></mesh>
            <mesh position={[6.6, 0, 0]}><boxGeometry args={[0.035, 8.4, 0.035]} /><meshBasicMaterial color={color} transparent opacity={o} /></mesh>
            <mesh position={[0, 4.2, 0]}><boxGeometry args={[13.2, 0.035, 0.035]} /><meshBasicMaterial color={color} transparent opacity={o} /></mesh>
            <mesh position={[0, -4.2, 0]}><boxGeometry args={[13.2, 0.035, 0.035]} /><meshBasicMaterial color={color} transparent opacity={o} /></mesh>
          </group>
        );
      })}
      {/* floor guide lines */}
      {[-3, 3].map((x) => (
        <mesh key={x} position={[x, -4.2, (TUNNEL_START + TUNNEL_END) / 2]}>
          <boxGeometry args={[0.03, 0.03, TUNNEL_START - TUNNEL_END]} />
          <meshBasicMaterial color={C.lime} transparent opacity={0.12} />
        </mesh>
      ))}
    </group>
  );
}

function Camera({ progress, calm, sync }: { progress: MutableRefObject<number>; calm: boolean; sync?: readonly number[] | undefined }) {
  const path = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 14),
    new THREE.Vector3(0.6, 0.2, -20),
    new THREE.Vector3(-0.7, -0.1, -60),
    new THREE.Vector3(0.7, 0.2, -100),
    new THREE.Vector3(-0.6, -0.1, -140),
    new THREE.Vector3(0.5, 0.1, -180),
    new THREE.Vector3(0, 0.4, -198),
    new THREE.Vector3(0, 9, -210),
    new THREE.Vector3(0, 16, -214),
  ]), []);
  const current = useRef(0);
  // Samples of path z per t, so the camera can cross each photo exactly at a headline boundary.
  const table = useMemo(() => Array.from({ length: 401 }, (_, i) => path.getPointAt((i / 400) * 0.86).z), [path]);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const aerial = useMemo(() => new THREE.Vector3(0, -14, DRONE_Z), []);
  useFrame(({ camera, clock }, delta) => {
    if (calm) {
      camera.position.set(0, 0, 14);
      camera.rotation.set(0, 0, 0);
      return;
    }
    if (sync) {
      const f = THREE.MathUtils.clamp(progress.current / 0.8, 0, 1);
      const keys = [0, ...sync, 1], zs = [14, ...sync.map((_, j) => (STATION_Z[j] ?? -186) - 2), -197];
      let j = 0; while (j < keys.length - 2 && f > (keys[j + 1] ?? 1)) j++;
      const a = keys[j] ?? 0, b = keys[j + 1] ?? 1, k = (f - a) / Math.max(1e-4, b - a);
      const z = THREE.MathUtils.lerp(zs[j] ?? 14, zs[j + 1] ?? -197, k);
      let i = 0; while (i < 400 && (table[i + 1] ?? -999) > z) i++;
      const z0 = table[i] ?? 14, z1 = table[i + 1] ?? z0;
      current.current = ((i + (z0 === z1 ? 0 : (z0 - z) / (z0 - z1))) / 400) * 0.86;
    } else current.current = THREE.MathUtils.damp(current.current, progress.current, 5, Math.min(delta, 0.05));
    const t = THREE.MathUtils.clamp(current.current, 0, 1);
    path.getPointAt(t, pos);
    path.getPointAt(Math.min(t + 0.02, 1), look);
    // blend the gaze down onto the aerial plate during the finale
    const k = THREE.MathUtils.smoothstep(t, 0.84, 0.97);
    look.lerp(aerial, k);
    camera.position.copy(pos);
    camera.position.x += Math.sin(clock.elapsedTime * 0.2) * 0.05;
    camera.position.y += Math.cos(clock.elapsedTime * 0.17) * 0.04;
    camera.lookAt(look);
    camera.rotation.z += Math.sin(t * Math.PI * 6) * 0.012 * (1 - k);
  });
  return null;
}

export function WalkthroughWorld({ progress, onReady, active = true, calm = false, sync }: { progress: MutableRefObject<number>; onReady: () => void; active?: boolean; calm?: boolean; sync?: readonly number[] }) {
  return (
    <Canvas frameloop={active ? "always" : "never"} dpr={[1, 1.35]} camera={{ position: [0, 0, 14], fov: 46, near: 0.1, far: 260 }} gl={{ antialias: false, powerPreference: "high-performance", alpha: false }}>
      <ReadySignal onReady={onReady} />
      <color attach="background" args={[C.black]} />
      <fog attach="fog" args={[C.black, 38, 125]} />
      <ambientLight intensity={0.6} />
      <Environment resolution={64}>
        <Lightformer intensity={3} position={[0, 7, 2]} scale={[14, 2, 1]} />
      </Environment>
      <Camera progress={progress} calm={calm} sync={sync} />
      <Stations progress={progress} calm={calm} />
      <Tunnel />
      <EffectComposer multisampling={0}>
        <Bloom intensity={0.5} luminanceThreshold={0.85} mipmapBlur />
        <Vignette offset={0.28} darkness={0.2} />
      </EffectComposer>
    </Canvas>
  );
}
