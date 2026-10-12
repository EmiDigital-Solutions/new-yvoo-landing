export const WALK_START = 0.131;
export const WALK_END = 0.38;
export const WALK_MAX = 0.8;

function smoothstep(value: number, start: number, end: number) {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
}

/** One score drives scene changes, typography and navigation; no nearest-slide guessing. */
export const HOME_CHAPTER_STARTS = [0, 0.019, 0.131, 0.211, 0.264, 0.317, 0.366, 0.405, 0.48, 0.613, 0.748, 0.90] as const;

export function homeChapterIndex(progress: number) {
  let index = 0;
  HOME_CHAPTER_STARTS.forEach((at, i) => { if (progress >= at) index = i; });
  return index;
}

export function homeChapterPose(progress: number, index: number) {
  const start = HOME_CHAPTER_STARTS[index] ?? 0;
  const end = HOME_CHAPTER_STARTS[index + 1] ?? 1.08;
  const entering = index === 0 ? 1 : smoothstep(progress, start, start + 0.007);
  const leaving = 1 - smoothstep(progress, end - 0.006, end);
  return { opacity: entering * leaving, solid: index === 0 ? 1 : smoothstep(progress, start + 0.002, start + 0.012), rise: (1 - entering) * 24 - (1 - leaving) * 16 };
}

/** Screen-space diagonal wipe, reversible and tied to distance travelled, not a CSS timer. */
export function homeImageReveal(progress: number, start: number) {
  return start === 0 ? 1 : smoothstep(progress, start - 0.009, start + 0.009);
}

/** Spatial handoff: travel through the filament globe as it opens into DNA. */
export function homeOpeningMotion(progress: number) {
  return {
    push: smoothstep(progress, 0.003, 0.036),
    arrival: smoothstep(progress, 0.019, 0.03),
    departure: smoothstep(progress, 0.088, 0.102),
    motes: smoothstep(progress, 0.004, 0.014) * (1 - smoothstep(progress, 0.033, 0.05)),
  };
}

/** A single set of fibres carries the opening globe continuously into DNA. */
export function homeOpeningGlobeMorph(progress: number) {
  return 1 - smoothstep(progress, 0.004, 0.032);
}

export function homeSceneVisibility(progress: number) {
  return {
    dna: smoothstep(progress, 0.019, 0.032) * (1 - smoothstep(progress, 0.094, 0.102)),
    surroundings: progress >= WALK_START,
  };
}
/** Nodes light up along the departing DNA's trailing fibres, never a separate image swap. */
export function homeConstellation(progress: number) {
  return {
    fade: smoothstep(progress, 0.1, 0.112) * (1 - smoothstep(progress, 0.125, WALK_START)),
    travel: smoothstep(progress, 0.102, WALK_START),
  };
}

export function homeDnaUnravel(progress: number) {
  return smoothstep(progress, 0.088, 0.114);
}

/** The strand keeps running, faint, as the backdrop behind the Atlas demo chapter. */
export function homeDnaDemoPresence(progress: number) {
  return smoothstep(progress, 0.616, 0.63) * (1 - smoothstep(progress, 0.728, 0.745));
}

/** A living strand returns for the pilot, fully formed and reversible on scroll. */
export function homeDnaFinalePresence(progress: number) {
  return smoothstep(progress, 0.9, 0.925);
}

export function homeDnaGlobeMorph(progress: number) {
  return smoothstep(progress, 0.925, 0.975);
}
