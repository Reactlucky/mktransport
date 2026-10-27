const HUES = [12, 48, 95, 145, 175, 200, 225, 250, 275, 305, 330, 350] as const;

/** Stable hue for a registration number. The same plate always lands on the same color. */
export function truckHue(seed: string): number {
  let hash = 2166136261;
  for (const char of seed.trim().toUpperCase()) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 33);
  }
  return HUES[(hash >>> 0) % HUES.length];
}

export function truckAccent(seed: string): { hue: number; stripe: string; wash: string } {
  const hue = truckHue(seed);
  return {
    hue,
    stripe: `oklch(72% 0.14 ${hue})`,
    wash: `oklch(70% 0.15 ${hue} / 0.42)`,
  };
}
