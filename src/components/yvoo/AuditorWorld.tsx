import { useTexture } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import openingFace from "@/assets/auditor-face-opening-cutout.png";
import partnerFace from "@/assets/auditor-face-partner-cutout.png";
import { auditorChapterIndex, auditorChapterProgress } from "./auditor-story";
import { AuditorInspection } from "./AuditorInspection";
import type { InspectionPalette } from "./AuditorInspection";
import { AuditorAtmosphere } from "./AuditorAtmosphere";

function Portrait({ src, chapter, progress, reduced }: { src: string; chapter: number; progress: MutableRefObject<number>; reduced: boolean }) {
  const texture = useTexture(src);
  const plate = useRef<THREE.Mesh>(null);
  const offset = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => { texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8; }, [texture]);
  useFrame(({ camera, gl }) => {
    const mesh = plate.current;
    if (!(camera instanceof THREE.PerspectiveCamera) || !mesh) return;
    const index = auditorChapterIndex(progress.current);
    const local = auditorChapterProgress(progress.current, chapter);
    mesh.visible = index === chapter;
    if (!mesh.visible) return;
    const height = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 10;
    const width = height * camera.aspect, aspect = 16 / 9;
    const scale = Math.max(height, width / aspect) * (1.03 + (reduced ? 0 : local * .14));
    const narrow = gl.domElement.clientWidth < 800;
    offset.set(-(scale * aspect - width) * .26 + (reduced ? 0 : local * width * .055), narrow ? -height * .025 : 0, -10).applyQuaternion(camera.quaternion);
    mesh.position.copy(camera.position).add(offset);
    mesh.quaternion.copy(camera.quaternion); mesh.scale.set(scale * aspect, scale, 1);
    const surface = mesh.material;
    if (surface instanceof THREE.MeshBasicMaterial) {
      const arrival = chapter === 0 ? 1 : THREE.MathUtils.smoothstep(local, 0, .1);
      surface.opacity = reduced ? 1 : arrival * (1 - THREE.MathUtils.smoothstep(local, .88, 1));
    }
  });
  return <mesh ref={plate} visible={false}><planeGeometry /><meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} /></mesh>;
}

function Journey({ progress, reduced, palette }: { progress: MutableRefObject<number>; reduced: boolean; palette: InspectionPalette }) {
  const focus = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size }) => {
    const p = progress.current;
    const narrow = size.width < 800;
    const travel = reduced ? 0 : Math.sin(p * Math.PI * 4);
    camera.position.set(travel * .8, reduced ? 0 : Math.sin(p * Math.PI * 3) * .35, (narrow ? 13.5 : 11.5) - p * 100);
    focus.set(narrow ? .2 : .6, narrow ? .6 : 0, -p * 100);
    camera.lookAt(focus);
  }, -1);
  return <>
    <ambientLight intensity={.7} />
    <directionalLight position={[-4, 7, 6]} intensity={3.5} color={palette.light} />
    <directionalLight position={[7, 2, -3]} intensity={4} color={palette.lime} />
    <pointLight position={[4, -3, 5]} intensity={35} color={palette.light} />
    <AuditorAtmosphere progress={progress} reduced={reduced} palette={palette} />
    <AuditorInspection progress={progress} reduced={reduced} palette={palette} />
    <Portrait src={openingFace} chapter={0} progress={progress} reduced={reduced} /><Portrait src={partnerFace} chapter={7} progress={progress} reduced={reduced} />
  </>;
}

function Ready({ onReady }: { onReady: () => void }) { useEffect(onReady, [onReady]); return null; }

export function AuditorWorld({ progress, onReady, reduced = false }: { progress: MutableRefObject<number>; onReady: () => void; reduced?: boolean }) {
  const [palette, setPalette] = useState<InspectionPalette>();
  useEffect(() => {
    const css = getComputedStyle(document.documentElement);
    setPalette({ metal: css.getPropertyValue("--inspection-metal").trim(), lime: css.getPropertyValue("--primary").trim(), light: css.getPropertyValue("--foreground").trim(), dark: css.getPropertyValue("--secondary").trim() });
  }, []);
  if (!palette) return null;
  // Resolve modern CSS colors through a canvas: Three's Color parser does not support oklch.
  const resolve = (color: string) => { const canvas = document.createElement("canvas"); const ctx = canvas.getContext("2d"); if (!ctx) return color; ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1); const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data; return `rgb(${r},${g},${b})`; };
  const colors = { metal: resolve(palette.metal), lime: resolve(palette.lime), light: resolve(palette.light), dark: resolve(palette.dark) };
  return <Canvas dpr={[1, 1.35]} camera={{ position: [0, 0, 12], fov: 44, near: .1, far: 250 }} gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}>
    <Suspense fallback={null}><Journey progress={progress} reduced={reduced} palette={colors} /><Ready onReady={onReady} /></Suspense>
  </Canvas>;
}
