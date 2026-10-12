import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

function Evidence({ progress, colors }: { progress: number; colors: string[] }) {
  const tiles = useRef<THREE.InstancedMesh>(null);
  const cameraProgress = useRef(progress);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => {
    const mesh = tiles.current;
    if (!mesh) return;
    for (let i = 0; i < 200; i++) mesh.setColorAt(i, new THREE.Color(colors[i < 60 ? 0 : 1]));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [colors]);
  useFrame(({ camera, clock, size }, delta) => {
    const mesh = tiles.current;
    if (!mesh) return;
    cameraProgress.current = THREE.MathUtils.damp(cameraProgress.current, progress, 4, delta);
    const p = cameraProgress.current;
    const separation = THREE.MathUtils.smoothstep(p, .12, .6);
    const compact = size.width < 800;
    for (let i = 0; i < 200; i++) {
      const accepted = i < 60;
      const groupIndex = accepted ? i : i - 60;
      const column = groupIndex % 10;
      const row = Math.floor(groupIndex / 10);
      const originX = ((i % 20) - 9.5) * .53;
      const originY = (4.5 - Math.floor(i / 20)) * .66;
      const finalX = (column - 4.5) * .45 + (accepted ? -3.1 : 3.1);
      const finalY = ((accepted ? 2.5 : 6.5) - row) * .43;
      dummy.position.set(THREE.MathUtils.lerp(originX, finalX, separation), THREE.MathUtils.lerp(originY, finalY, separation), Math.sin(i * 2.4 + clock.elapsedTime * .24) * .15 + (1 - separation) * Math.sin(i * 7) * 2);
      dummy.rotation.set(Math.sin(i + clock.elapsedTime * .2) * .05, (1 - separation) * Math.cos(i) * .22, 0);
      dummy.scale.set(.32, .38, .025);
      dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    const aspect = size.width / size.height;
    const fittedDistance = Math.max(compact ? 19 : 12, 15 / Math.max(.5, aspect));
    camera.position.set(Math.sin(p * Math.PI) * .15, compact ? .6 : .3, fittedDistance - Math.sin(p * Math.PI) * .4);
    camera.lookAt(0, 0, 0);
  });
  return <instancedMesh ref={tiles} args={[undefined, undefined, 200]}><boxGeometry /><meshBasicMaterial transparent opacity={.8} toneMapped={false} /></instancedMesh>;
}

export function HomeProofWorld({ progress }: { progress: number }) {
  const [colors, setColors] = useState<string[]>();
  useEffect(() => {
    const css = getComputedStyle(document.documentElement);
    const canvas = document.createElement("canvas"); const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setColors(["--primary", "--foreground"].map(token => {
      ctx.fillStyle = css.getPropertyValue(token).trim(); ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      return `rgb(${r},${g},${b})`;
    }));
  }, []);
  return <div className="home-proof-world" aria-hidden="true">{colors && <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 13], fov: 43 }} gl={{ alpha: true, antialias: true }}><Evidence progress={progress} colors={colors} /></Canvas>}</div>;
}