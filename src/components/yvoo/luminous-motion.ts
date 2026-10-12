/** Sparse open constellations traced from the supplied Pioneer composition. */
export function evidenceLattice() {
  const coordinates = [
    [-1.8, 4.6, -1], [-.8, 3.9, -.8], [-.75, 2.1, -.6],
    [3, 5.8, -1.4], [3.45, 4.3, -1.2],
    [3.1, 3.1, 0], [1.1, .8, -.3],
    [-.65, .25, -.5], [-.15, -1.05, -.3], [.2, -2.25, -.1], [.8, -3.05, 0],
    [1.25, -4.05, -.2], [1.85, -5.05, -.6], [2.7, -4.95, -.9],
    [-4.5, -3.6, -1.2], [-3.4, -2.5, -.8], [-3.2, -3.65, -.6],
    [-5.65, -4.95, -.9], [-3.65, -5.55, -.8],
    [-3.3, -4.4, -1.4], [3.7, -5.8, -1.6], [-1.35, -1, -1.3],
  ];
  const nodes = coordinates.map(([x = 0, y = 0, z = 0]) => ({ x, y, z }));
  const edges: [number, number][] = [[0, 1], [1, 2], [3, 4], [5, 6], [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [14, 15], [15, 16], [14, 17], [17, 18]];
  return { nodes, edges };
}

/** Withdrawal follows scroll, never elapsed time, so reversing scroll restores the strand. */
export function dnaWithdrawal(progress: number) {
  const t = Math.max(0, Math.min(1, (progress - 0.084) / 0.03));
  return t * t * (3 - 2 * t);
}