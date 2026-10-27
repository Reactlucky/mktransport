const ACCENT_HUES = [12, 55, 100, 150, 195, 240, 285, 330];

export function truckAccent(registration: string) {
  let hash = 0;
  for (const char of registration.toUpperCase()) {
    hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  }
  const hue = ACCENT_HUES[hash % ACCENT_HUES.length];
  return {
    stripe: `oklch(74% 0.14 ${hue})`,
    wash: `oklch(74% 0.14 ${hue} / 0.2)`,
    edge: `oklch(74% 0.14 ${hue} / 0.55)`,
  };
}
