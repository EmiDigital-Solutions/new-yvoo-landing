const smooth = (value: number, start: number, end: number) => {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
};

/** Level 1–3 assemble the pixels; the CAPA transition reveals the product. */
export function orbitMorph(level: number, reducedMotion = false) {
  if (reducedMotion) return { gather: 1, photo: 1, particles: 0 };
  const photo = smooth(level, 2, 3);
  return { gather: .32 + .68 * smooth(level, 0, 2), photo, particles: 1 - photo };
}