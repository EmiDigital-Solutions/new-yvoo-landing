import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import expertMap from "./expert-map-data.json";
import { dnaWithdrawal, evidenceLattice } from "./luminous-motion";
import { homeConstellation, homeDnaUnravel, homeDnaDemoPresence, homeDnaFinalePresence, homeDnaGlobeMorph, homeOpeningGlobeMorph, homeOpeningMotion, homeSceneVisibility } from "./home-scene-timeline";

type Palette = { lime: string; paper: string; gold: string };
type SceneProps = { progress: MutableRefObject<number>; palette: Palette };
type OrbitDna = { gather: number; opacity: number; targets: Float32Array | null; reducedMotion: boolean };

// Geographic map rejected by the user: the expert chapter stays a pure DNA-particle constellation.
const expertMapBlend = (_p: number) => 0;
const projectMap = (lon: number, lat: number) => [lon / 180 * 7.2, (lat - 12) / 180 * 7.2, 0];
function mapFrame(camera: THREE.PerspectiveCamera) {
  const height = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 10;
  const mobile = camera.aspect < .9;
  const scale = Math.min(height * (mobile ? .62 : .30) / 5.6, height * camera.aspect * .84 / 14.4);
  return { height, scale, y: height * (mobile ? .19 : .27) };
}

const dnaDeformation = `
  uniform float withdrawal;
  uniform float dnaMotion;
  uniform float unravel;
  uniform float globeMorph;
  uniform float mapMorph;
  uniform float partMorph;
  attribute vec3 partPosition;
  attribute vec3 targetPosition;
  attribute vec3 globePosition;
  attribute vec3 mapPosition;
  attribute float release;
  vec3 animateDna(vec3 p) {
    float wave = p.y * 0.55 - time * 0.85;
    p.x += dnaMotion * (sin(wave) * 0.09 + withdrawal * sin(p.y * 0.3 + time * 0.4) * 0.35);
    p.z += dnaMotion * cos(wave) * 0.12;
    float tail = clamp((p.y + 9.0) / 18.0, 0.0, 1.0);
    p.y += dnaMotion * withdrawal * (0.6 + tail * 1.2);
    p.x += dnaMotion * withdrawal * sin(p.y * 0.22 + release * 5.0) * (1.0 - tail) * 0.25;
    float dissolve = smoothstep(release * 0.14, 0.86 + release * 0.14, unravel);
    vec3 strand = mix(p, targetPosition, dissolve * dissolve * 0.18 * dnaMotion);
    vec3 globe = mix(strand, globePosition * (1.0 + sin(time * 0.5 + globePosition.y) * 0.003), globeMorph);
    return mix(mix(globe, mapPosition, mapMorph), partPosition, partMorph);
  }
`;

// Analytic circular light sprites: no bitmap edges or square point primitives.
const vertexShader = `
  attribute float brightness;
  varying vec3 vColor;
  varying float vBrightness;
  uniform float time;
  uniform float pointSize;
  uniform float pixelRatio;
  ${dnaDeformation}
  void main() {
    vColor = color;
    vBrightness = brightness * (0.84 + 0.16 * sin(time * 0.65 + position.y * 0.7 + position.x)) * (1.0 - unravel * 0.8);
    vec4 mvPosition = modelViewMatrix * vec4(animateDna(position), 1.0);
    gl_PointSize = clamp(pointSize * pixelRatio * 400.0 / max(1.0, -mvPosition.z), 1.5, 64.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;
const fragmentShader = `
  uniform float opacity;
  varying vec3 vColor;
  varying float vBrightness;
  void main() {
    float radius = length(gl_PointCoord - vec2(0.5)) * 2.0;
    if (radius > 1.0) discard;
    float core = exp(-radius * radius * 32.0);
    float halo = exp(-radius * radius * 6.5) * 0.22;
    float edge = 1.0 - smoothstep(0.7, 1.0, radius);
    gl_FragColor = vec4(vColor * (1.0 + core * 1.5), (core + halo) * edge * vBrightness * opacity);
  }
`;

function lightMaterial(size: number) {
  return new THREE.ShaderMaterial({
    vertexShader, fragmentShader, vertexColors: true,
    uniforms: { opacity: { value: 0 }, time: { value: 0 }, pointSize: { value: size }, pixelRatio: { value: 1 }, withdrawal: { value: 0 }, dnaMotion: { value: 0 }, unravel: { value: 0 }, globeMorph: { value: 0 }, mapMorph: { value: 0 }, partMorph: { value: 0 } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
  });
}

function updateLight(material: THREE.ShaderMaterial, opacity: number, time: number, pixelRatio: number) {
  const alpha = material.uniforms['opacity'];
  const clock = material.uniforms['time'];
  const ratio = material.uniforms['pixelRatio'];
  if (alpha) alpha.value = opacity;
  if (clock) clock.value = time;
  if (ratio) ratio.value = pixelRatio;
}

function pointGeometry(positions: number[], colors: number[], brightness: number[]) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute("brightness", new THREE.Float32BufferAttribute(brightness, 1));
  geometry.setAttribute("targetPosition", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("globePosition", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("mapPosition", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("partPosition", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("release", new THREE.Float32BufferAttribute(brightness.map(() => 0), 1));
  return geometry;
}

/** Continuous woven optical fibres, airy cross-links, and a handful of bright glints. */
export function LuminousDna({ progress, palette, orbit }: SceneProps & { orbit?: MutableRefObject<OrbitDna> }) {
  const group = useRef<THREE.Group>(null);
  const phase = useRef(0);
  const finaleOffset = useMemo(() => new THREE.Vector3(), []);
  const resources = useMemo(() => {
    const positions: number[] = [], colors: number[] = [], targets: number[] = [], releases: number[] = [];
    const globePositions: number[] = [], globeGlints: number[] = [];
    const globePoint = (y: number, filament: number, strand: number) => {
      const latitude = y / 9 * Math.PI / 2;
      const longitude = (filament / 48 + strand * .5) * Math.PI * 2 + y * .018;
      const radius = 5 + (filament % 4) * .012;
      return [radius * Math.cos(latitude) * Math.cos(longitude), radius * Math.sin(latitude), radius * Math.cos(latitude) * Math.sin(longitude)];
    };
    const glints: number[] = [], glintColors: number[] = [], strengths: number[] = [];
    const glintTargets: number[] = [], glintReleases: number[] = [];
    const lattice = evidenceLattice();
    const target = (y: number, filament: number, strand: number) => {
      const edge = lattice.edges[(filament + strand * 48) % lattice.edges.length];
      const a = edge ? lattice.nodes[edge[0]] : undefined, b = edge ? lattice.nodes[edge[1]] : undefined;
      if (!a || !b) return [0, y, 0];
      const t = (y + 9) / 18;
      return [a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t].map(v => v * 1.4);
    };
    const lime = new THREE.Color(palette.lime), gold = new THREE.Color(palette.gold), white = new THREE.Color(palette.paper);
    const color = new THREE.Color();
    const point = (y: number, filament: number, strand: number) => {
      const phase = strand * Math.PI + (filament - 23.5) * 0.022;
      const radius = 1.45 + Math.sin(filament * 2.399) * 0.24;
      const angle = y * 0.44 + phase + Math.sin(y * 1.1 + filament * 0.8) * 0.085;
      return [Math.cos(angle) * radius, y, Math.sin(angle) * radius];
    };
    for (let strand = 0; strand < 2; strand++) {
      for (let filament = 0; filament < 48; filament++) {
        for (let segment = 0; segment < 360; segment++) {
          for (const end of [segment, segment + 1]) {
            const y = -9 + end / 360 * 18;
            const intensity = 0.16 + 2.2 * Math.pow(0.5 + 0.5 * Math.sin(y * 0.85 + filament * 0.23), 8);
            color.copy(lime).lerp(gold, strand === 0 ? 0.26 : 0.12).lerp(white, filament % 9 === 0 ? 0.3 : 0.05).multiplyScalar(intensity);
            positions.push(...point(y, filament, strand)); colors.push(color.r, color.g, color.b);
             targets.push(...target(y, filament, strand)); releases.push(filament / 48);
             globePositions.push(...globePoint(y, filament, strand));
          }
        }
        for (let spark = 0; spark < 24; spark++) {
          const y = -8.8 + ((spark * 2.399 + filament * 1.37) % 17.6);
          glints.push(...point(y, filament, strand));
           glintTargets.push(...target(y, filament, strand)); glintReleases.push(filament / 48);
           globeGlints.push(...globePoint(y, filament, strand));
          color.copy(lime).lerp(gold, strand ? 0.16 : 0.3).lerp(white, 0.24);
          glintColors.push(color.r, color.g, color.b); strengths.push(filament % 11 === 0 ? 1 : 0.32);
        }
      }
    }
    // Exactly thirteen widely spaced, subtly curved continuous bridges.
    for (let rung = 0; rung < 13; rung++) {
      const y = -8.4 + rung * 1.4;
      const a = new THREE.Vector3(...point(y, 24, 0) as [number, number, number]);
      const b = new THREE.Vector3(...point(y, 24, 1) as [number, number, number]);
      for (let segment = 0; segment < 24; segment++) {
        for (const end of [segment, segment + 1]) {
          const t = end / 24;
          const p = a.clone().lerp(b, t); p.y += Math.sin(t * Math.PI) * 0.09;
          positions.push(p.x, p.y, p.z);
           targets.push(...target(y, rung, 0)); releases.push(0.5);
           const latitude = y / 9 * Math.PI / 2, longitude = t * Math.PI * 2;
           globePositions.push(5 * Math.cos(latitude) * Math.cos(longitude), 5 * Math.sin(latitude), 5 * Math.cos(latitude) * Math.sin(longitude));
          color.copy(lime).lerp(gold, t * 0.22).multiplyScalar(0.24 + Math.abs(t - 0.5) * 0.4);
          colors.push(color.r, color.g, color.b);
        }
      }
    }
    const lines = new THREE.BufferGeometry();
    lines.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    lines.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    lines.setAttribute("targetPosition", new THREE.Float32BufferAttribute(targets, 3));
    lines.setAttribute("release", new THREE.Float32BufferAttribute(releases, 1));
    lines.setAttribute("globePosition", new THREE.Float32BufferAttribute(globePositions, 3));
    lines.setAttribute("partPosition", new THREE.Float32BufferAttribute(positions, 3));
    const coastTargets = positions.map((_, index) => {
      const segment = expertMap.coast[Math.floor(index / 6) % expertMap.coast.length];
      if (!segment) return 0;
      const end = Math.floor(index / 3) % 2;
      return projectMap(segment[end * 2] ?? 0, segment[end * 2 + 1] ?? 0)[index % 3] ?? 0;
    });
    lines.setAttribute("mapPosition", new THREE.Float32BufferAttribute(coastTargets, 3));
    const fibreMaterial = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 }, opacity: { value: 0 }, withdrawal: { value: 0 }, dnaMotion: { value: 1 }, unravel: { value: 0 }, globeMorph: { value: 0 }, mapMorph: { value: 0 }, partMorph: { value: 0 } },
      vertexShader: `uniform float time; varying vec3 vColor; ${dnaDeformation}
        void main(){float keep = step(0.8, fract(release * 48.0 / 7.0));
          float lane = step(0.82, fract(release * 48.0 * 0.618));
          float travel = fract(time * 0.045 + release * 3.7);
          float pulse = exp(-pow((position.y + 9.0) / 18.0 - travel, 2.0) * 900.0) * lane;
          float ember = pow(0.5 + 0.5 * sin(position.y * 0.6 - time * 0.4 + release * 11.0), 24.0) * 0.6;
          vColor=color * (1.0 + (pulse * 3.2 + ember) * (1.0 - globeMorph * 0.6)) * mix(1.0, mix(0.08, 1.0, keep), smoothstep(0.1,0.65,unravel)); gl_Position=projectionMatrix*modelViewMatrix*vec4(animateDna(position),1.0);}`,
      fragmentShader: `uniform float opacity; varying vec3 vColor; void main(){gl_FragColor=vec4(vColor,opacity);}`,
      vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    });
    const material = lightMaterial(0.32);
    const motion = material.uniforms['dnaMotion']; if (motion) motion.value = 1;
    const sparks = pointGeometry(glints, glintColors, strengths);
    sparks.setAttribute("targetPosition", new THREE.Float32BufferAttribute(glintTargets, 3));
    sparks.setAttribute("release", new THREE.Float32BufferAttribute(glintReleases, 1));
    sparks.setAttribute("globePosition", new THREE.Float32BufferAttribute(globeGlints, 3));
    sparks.setAttribute("mapPosition", new THREE.Float32BufferAttribute(strengths.flatMap((_, i) => {
      const location = expertMap.land[i % expertMap.land.length];
      return projectMap(location?.[0] ?? 0, location?.[1] ?? 0);
    }), 3));
    // Illustrative supplier regions, not a directory of actual customer locations.
    const regions = [[51, 7], [45, 9], [50, 15], [40, 29], [23, 73], [31, 121], [22, 114], [35, 139], [14, 101], [21, 106], [3, 101], [-6, 107], [37, -97], [20, -100], [-23, -46], [43, -80], [-26, 28], [-33, 151]];
    const supplierPositions = regions.flatMap(([lat = 0, lon = 0]) => {
      const a = lat * Math.PI / 180, b = lon * Math.PI / 180;
      return [5.08 * Math.cos(a) * Math.cos(b), 5.08 * Math.sin(a), 5.08 * Math.cos(a) * Math.sin(b)];
    });
    const suppliers = pointGeometry(supplierPositions, regions.flatMap(() => [lime.r, lime.g, lime.b]), regions.map(() => 1));
    return { lines, glints: sparks, material, fibreMaterial, suppliers, supplierMaterial: lightMaterial(1.1) };
  }, [palette]);
  const appliedTargets = useRef<Float32Array | null>(null);
  useEffect(() => () => { resources.lines.dispose(); resources.glints.dispose(); resources.material.dispose(); resources.fibreMaterial.dispose(); resources.suppliers.dispose(); resources.supplierMaterial.dispose(); }, [resources]);
  useFrame(({ camera, clock, gl }, delta) => {
    const finale = homeDnaFinalePresence(progress.current);
    const openingGlobe = homeOpeningGlobeMorph(progress.current);
    const globe = Math.max(openingGlobe, homeDnaGlobeMorph(progress.current));
    const map = expertMapBlend(progress.current);
    const p = progress.current >= .9 ? .043 : progress.current >= .48 && progress.current < .613 ? .043 + (progress.current - .48) / .133 * .088 : progress.current;
    // Behind the Atlas demo the strand re-weaves itself and keeps running, faint.
    const presence = homeDnaDemoPresence(progress.current);
    const unravel = homeDnaUnravel(p) * (1 - presence);
    const strandFade = Math.max(p < .094 ? homeSceneVisibility(p).dna : 1 - THREE.MathUtils.smoothstep(p, .122, .131), presence * .18);
    const fade = progress.current >= .9 ? finale * .38 : p < .032 ? THREE.MathUtils.lerp(1, .38, openingGlobe) : strandFade;
    const withdrawal = dnaWithdrawal(p) * (1 - presence);
    if (group.current && camera instanceof THREE.PerspectiveCamera) {
      const motion = homeOpeningMotion(p);
      const distance = 10 + (1 - motion.arrival) * 1.5;
      const viewHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance;
      const mobile = camera.aspect < 0.9;
      phase.current += Math.min(delta, 0.05) * 0.075;
      group.current.visible = fade > 0.001;
      group.current.rotation.set(0, phase.current * (1 - unravel), 0);
      // The strand should read as larger than the frame: it bleeds past the viewport edges
      // and eases back to the fitted scale while it unravels into a constellation, globe or map.
      const overflow = 1 + (mobile ? 0.3 : 0.5) * (1 - Math.max(unravel, Math.max(globe, map)));
      group.current.scale.setScalar(viewHeight * (progress.current >= .9 ? .92 + finale * .08 : mobile ? 1.22 : 1.12) / 18 * (progress.current >= .9 ? 1 : overflow));
      group.current.position.set(camera.position.x, camera.position.y + (mobile ? viewHeight * 0.15 * (1 - unravel) : 0), camera.position.z - distance);
      if (progress.current >= .48 && progress.current < .613) {
        const frame = mapFrame(camera);
        group.current.scale.setScalar(THREE.MathUtils.lerp(viewHeight * (mobile ? 1.22 : 1.12) / 18 * overflow, frame.scale, map));
        group.current.quaternion.copy(camera.quaternion);
        finaleOffset.set(0, frame.y * map, -10).applyQuaternion(camera.quaternion);
        group.current.position.copy(camera.position).add(finaleOffset);
      }
      if (progress.current >= .9 || progress.current <= .032) {
        const narrowScreen = gl.domElement.clientWidth < 800;
        const globeScale = narrowScreen ? viewHeight * camera.aspect * .76 / 10 : Math.min(viewHeight * .62, viewHeight * camera.aspect * .6) / 10;
        const dnaScale = (progress.current >= .9 ? viewHeight / 18 : viewHeight * (mobile ? 1.22 : 1.12) / 18) * overflow;
        group.current.scale.setScalar(THREE.MathUtils.lerp(dnaScale, globeScale, globe));
        const verticalOffset = progress.current >= .9 ? (narrowScreen ? viewHeight * (.16 + globe * .08) : viewHeight * .06 * globe) : (mobile ? viewHeight * (.15 + globe * .09) : viewHeight * .06 * globe);
        finaleOffset.set(narrowScreen ? 0 : viewHeight * camera.aspect * .15 * globe, verticalOffset, -distance).applyQuaternion(camera.quaternion);
        group.current.position.copy(camera.position).add(finaleOffset);
        group.current.quaternion.premultiply(camera.quaternion);
      }
    }
    for (const material of [resources.fibreMaterial, resources.material]) {
      const amount = material.uniforms['withdrawal']; if (amount) amount.value = withdrawal;
      const blend = material.uniforms['unravel']; if (blend) blend.value = unravel;
      const sphere = material.uniforms['globeMorph']; if (sphere) sphere.value = globe;
      const geography = material.uniforms['mapMorph']; if (geography) geography.value = map;
    }
    updateLight(resources.fibreMaterial, fade * 0.85 * (1.0 - THREE.MathUtils.smoothstep(unravel, 0, 1)) * (1 - THREE.MathUtils.smoothstep(map, .6, 1)), clock.elapsedTime, gl.getPixelRatio());
    updateLight(resources.material, fade * 0.82 * (1.0 - THREE.MathUtils.smoothstep(unravel, 0, 1)) * (1 - map), clock.elapsedTime, gl.getPixelRatio());
    updateLight(resources.supplierMaterial, progress.current >= .9 ? globe * finale : openingGlobe, clock.elapsedTime, gl.getPixelRatio());
    const state = orbit?.current;
    if (state && group.current && camera instanceof THREE.PerspectiveCamera) {
      if (state.targets && state.targets !== appliedTargets.current) {
        appliedTargets.current = state.targets;
        for (const geometry of [resources.lines, resources.glints]) {
          const count = geometry.getAttribute("position").count;
          const points = new Float32Array(count * 3);
          const targetCount = state.targets.length / 3;
          for (let i = 0; i < count; i++) {
            const target = (i * 7919 % targetCount) * 3;
            points[i * 3] = state.targets[target] ?? 0;
            points[i * 3 + 1] = state.targets[target + 1] ?? 0;
            points[i * 3 + 2] = state.targets[target + 2] ?? 0;
          }
          geometry.setAttribute("partPosition", new THREE.BufferAttribute(points, 3));
        }
      }
      const height = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 10;
      group.current.position.set(0, 0, camera.position.z - 10);
      group.current.rotation.set(0, state.reducedMotion ? 0 : phase.current * (1 - state.gather), 0);
      group.current.scale.setScalar(height * .95 / 18);
      group.current.visible = state.opacity > .001;
      for (const material of [resources.fibreMaterial, resources.material]) {
        const morph = material.uniforms['partMorph'];
        if (morph) morph.value = state.targets ? state.gather : 0;
        const motion = material.uniforms['dnaMotion'];
        if (motion) motion.value = state.reducedMotion ? 0 : 1 - state.gather;
      }
      updateLight(resources.fibreMaterial, state.opacity * .85, clock.elapsedTime, gl.getPixelRatio());
      updateLight(resources.material, state.opacity * .82, clock.elapsedTime, gl.getPixelRatio());
    }
  });
  return <group ref={group} visible={false}>
    <lineSegments geometry={resources.lines} material={resources.fibreMaterial} />
    <points geometry={resources.glints} material={resources.material} />
    <points geometry={resources.suppliers} material={resources.supplierMaterial} />
  </group>;
}

/** Pioneer-like open constellations: sparse straight links, substantial circular light nodes. */
export function LuminousNetwork({ progress, palette }: SceneProps) {
  const group = useRef<THREE.Group>(null);
  const mapGroup = useRef<THREE.Group>(null);
  const coastMaterial = useRef<THREE.LineBasicMaterial>(null);
  const mapOffset = useMemo(() => new THREE.Vector3(), []);
  const lineMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const coreMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const resources = useMemo(() => {
    const lime = new THREE.Color(palette.lime), gold = new THREE.Color(palette.gold), white = new THREE.Color(palette.paper);
    const lattice = evidenceLattice();
    const nodes = lattice.nodes.map(p => new THREE.Vector3(p.x, p.y, p.z));
    const positions: number[] = [], colors: number[] = [], brightness: number[] = [];
    nodes.forEach((point, i) => {
      positions.push(point.x, point.y, point.z);
      const central = point.length() < 0.1;
      const color = (central ? gold : lime).clone().lerp(white, 0.35);
      colors.push(color.r, color.g, color.b); brightness.push(central ? 1 : 0.9);
    });
    const curves: THREE.QuadraticBezierCurve3[] = [];
    const tubes: THREE.TubeGeometry[] = [];
    lattice.edges.forEach(([i, j]) => {
      const a = nodes[i], b = nodes[j]; if (!a || !b) return;
      // Organic arcs: bow each edge sideways and in depth so the network reads as living fibres.
      const mid = a.clone().add(b).multiplyScalar(.5), d = b.clone().sub(a);
      const bend = (curves.length % 2 ? 1 : -1) * d.length() * .22;
      mid.add(new THREE.Vector3(-d.y, d.x, 0).normalize().multiplyScalar(bend)).add(new THREE.Vector3(0, 0, bend * .6));
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      curves.push(curve); tubes.push(new THREE.TubeGeometry(curve, 28, 0.012, 6, false));
    });
    const paths = mergeGeometries(tubes) ?? new THREE.BufferGeometry();
    tubes.forEach(tube => tube.dispose());
    const photons = pointGeometry(curves.flatMap(() => [0, 0, 0, 0, 0, 0, 0, 0, 0]), curves.flatMap((_, i) => [0, 1, 2].flatMap(() => { const c = i % 5 === 0 ? gold : white; return [c.r, c.g, c.b]; })), curves.flatMap(() => [1, .7, .45]));
    const beadPositions: number[] = [], beadColors: number[] = [], beadStrengths: number[] = [];
    curves.forEach(curve => {
      const count = Math.ceil(curve.getLength() / .12);
      for (let j = 1; j < count; j++) {
        const p = curve.getPoint(j / count);
        beadPositions.push(p.x, p.y, p.z);
        beadColors.push(lime.r, lime.g, lime.b);
        beadStrengths.push(.35);
      }
    });
    const spheres = nodes.map((point, i) => {
      const sphere = new THREE.SphereGeometry(i < 6 ? 0.105 : 0.09, 16, 12);
      sphere.translate(point.x, point.y, point.z);
      const color = (i === 0 || i === 9 || i === 11 ? gold : lime).clone().lerp(white, 0.3);
      const count = sphere.getAttribute("position").count;
      sphere.setAttribute("color", new THREE.Float32BufferAttribute(Array.from({ length: count }, () => [color.r, color.g, color.b]).flat(), 3));
      return sphere;
    });
    const cores = mergeGeometries(spheres) ?? new THREE.BufferGeometry();
    spheres.forEach(sphere => sphere.dispose());
    // Illustrative country markers (approximate centroids), flat map projection behind the constellation.
    const countries = [[51,10],[46,2],[42,12],[40,-4],[52,19],[50,15],[47,19],[45,25],[39,35],[52,0],[60,15],[62,26],[56,38],[24,45],[25,54],[30,70],[22,79],[23,90],[35,104],[31,121],[23,113],[36,128],[36,138],[15,101],[16,106],[4,102],[-2,118],[13,122],[-25,134],[-41,174],[30,31],[9,8],[0,38],[-29,24],[34,-6],[38,-97],[56,-106],[23,-102],[4,-74],[-10,-52],[-34,-64],[-33,-71],[-9,-75],[18,-77],[64,-19]];
    const mapPositions: number[] = [], mapColors: number[] = [], mapStrengths: number[] = [];
    expertMap.land.forEach(([lon = 0, lat = 0]) => {
      mapPositions.push(...projectMap(lon, lat));
      mapColors.push(lime.r, lime.g, lime.b); mapStrengths.push(.55);
    });
    const mapPoints = pointGeometry(mapPositions, mapColors, mapStrengths);
    const coast = new THREE.BufferGeometry();
    coast.setAttribute('position', new THREE.Float32BufferAttribute(expertMap.coast.flatMap(([a = 0, b = 0, c = 0, d = 0]) => [...projectMap(a,b), ...projectMap(c,d)]), 3));
    const markers = pointGeometry(countries.flatMap(([lat = 0, lon = 0]) => projectMap(lon,lat)), countries.flatMap(() => [lime.r,lime.g,lime.b]), countries.map(() => 1));
    return { nodes: pointGeometry(positions, colors, brightness), cores, paths, photons, curves, mapPoints, coast, markers, markerMaterial: lightMaterial(.5), mapMaterial: lightMaterial(.13), beads: pointGeometry(beadPositions, beadColors, beadStrengths), beadMaterial: lightMaterial(.15), nodeMaterial: lightMaterial(1.35), photonMaterial: lightMaterial(0.22) };
  }, [palette]);
  useEffect(() => () => { resources.nodes.dispose(); resources.cores.dispose(); resources.paths.dispose(); resources.photons.dispose(); resources.beads.dispose(); resources.mapPoints.dispose(); resources.coast.dispose(); resources.markers.dispose(); resources.markerMaterial.dispose(); resources.mapMaterial.dispose(); resources.beadMaterial.dispose(); resources.nodeMaterial.dispose(); resources.photonMaterial.dispose(); }, [resources]);
  useFrame(({ camera, clock, gl }) => {
    const p = progress.current >= .48 && progress.current < .613 ? .043 + (progress.current - .48) / .133 * .088 : progress.current;
    const map = expertMapBlend(progress.current);
    const fade = homeConstellation(p).fade * (1 - map);
    if (mapGroup.current && camera instanceof THREE.PerspectiveCamera) {
      const frame = mapFrame(camera);
      mapGroup.current.visible = map > .001;
      mapGroup.current.scale.setScalar(frame.scale);
      mapGroup.current.quaternion.copy(camera.quaternion);
      mapOffset.set(0, frame.y, -10).applyQuaternion(camera.quaternion);
      mapGroup.current.position.copy(camera.position).add(mapOffset);
    }
    if (coastMaterial.current) coastMaterial.current.opacity = map * .22;
    if (group.current) {
      group.current.visible = fade > 0.001 || (progress.current > .5 && progress.current < .613);
      group.current.position.set(camera.position.x, camera.position.y, camera.position.z - 10);
      if (camera instanceof THREE.PerspectiveCamera) {
        const height = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 10;
        group.current.scale.setScalar(height * (camera.aspect < .9 ? 1.22 : 1.12) / 18 * 1.4);
      }
      group.current.rotation.set(0, 0, 0);
    }
    if (lineMaterial.current) lineMaterial.current.opacity = fade * 0.16;
    if (coreMaterial.current) coreMaterial.current.opacity = fade;
    [resources.nodeMaterial, resources.photonMaterial, resources.beadMaterial].forEach(material => {
      updateLight(material, fade, clock.elapsedTime, gl.getPixelRatio());
    });
    const compactMap = camera instanceof THREE.PerspectiveCamera && camera.aspect < .9;
    updateLight(resources.mapMaterial, map * (compactMap ? .24 : .65), clock.elapsedTime, gl.getPixelRatio());
    updateLight(resources.markerMaterial, map * (compactMap ? .55 : .9), clock.elapsedTime, gl.getPixelRatio());
    if (fade > 0.001) {
      const positions = resources.photons.getAttribute("position");
      resources.curves.forEach((curve, i) => { for (let k = 0; k < 3; k++) { const p = curve.getPoint((clock.elapsedTime * (0.06 + k * .015) + i * 0.371 + k / 3) % 1); positions.setXYZ(i * 3 + k, p.x, p.y, p.z); } });
      positions.needsUpdate = true;
    }
  });
  return <><group ref={mapGroup} visible={false}>
    <lineSegments geometry={resources.coast}><lineBasicMaterial ref={coastMaterial} color={palette.lime} transparent opacity={0} depthWrite={false} toneMapped={false} fog={false} /></lineSegments>
    <points geometry={resources.mapPoints} material={resources.mapMaterial} />
    <points geometry={resources.markers} material={resources.markerMaterial} />
  </group><group ref={group} visible={false}>
    <mesh geometry={resources.paths}><meshBasicMaterial ref={lineMaterial} color={palette.lime} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} fog={false} /></mesh>
    <mesh geometry={resources.cores}><meshBasicMaterial ref={coreMaterial} vertexColors transparent opacity={0} depthWrite={false} toneMapped={false} fog={false} /></mesh>
    <points geometry={resources.nodes} material={resources.nodeMaterial} />
    <points geometry={resources.beads} material={resources.beadMaterial} />
    <points geometry={resources.photons} material={resources.photonMaterial} />
  </group></>;
}

/** A cinematic dust volume, never a decorative bitmap: thousands of subpixel lights with depth. */
export function LuminousField({ progress, palette }: SceneProps) {
  const group = useRef<THREE.Points>(null);
  const data = useMemo(() => {
    const positions: number[] = [], colors: number[] = [], brightness: number[] = [];
    const lime = new THREE.Color(palette.lime), gold = new THREE.Color(palette.gold);
    for (let i=0;i<2200;i++) {
      const a=i*2.399963;
      const radius=2+((i*37)%101)/101*18;
      positions.push(Math.cos(a)*radius, Math.sin(a)*radius*1.3, -3-((i*17)%89)/89*20);
      const color=lime.clone().lerp(gold,i%9===0?.26:.02);
      colors.push(color.r,color.g,color.b); brightness.push(.08+(i%17)/17*.35);
    }
    return { geometry: pointGeometry(positions,colors,brightness), material: lightMaterial(.16) };
  },[palette]);
  useEffect(() => () => { data.geometry.dispose();data.material.dispose(); },[data]);
  useFrame(({camera,clock,gl}) => {
    const p=progress.current;
    const fade=(p<.131? homeSceneVisibility(p).dna*.65+homeConstellation(p).fade : p>.405&&p<.603?.25:0) * (1 - expertMapBlend(p));
    if(group.current){ group.current.position.copy(camera.position);group.current.rotation.y=clock.elapsedTime*.007+(p/.131)*.12; }
    updateLight(data.material,fade,clock.elapsedTime,gl.getPixelRatio());
  });
  return <points ref={group} geometry={data.geometry} material={data.material} />;
}
