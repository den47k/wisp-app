export const AVATAR_GRADIENTS: ReadonlyArray<readonly [string, string]> = [
  ["oklch(0.72 0.17 250)", "oklch(0.68 0.19 290)"],
  ["oklch(0.78 0.15 200)", "oklch(0.72 0.16 260)"],
  ["oklch(0.80 0.14 160)", "oklch(0.72 0.17 220)"],
  ["oklch(0.82 0.14 60)", "oklch(0.72 0.18 330)"],
  ["oklch(0.78 0.15 320)", "oklch(0.70 0.17 270)"],
  ["oklch(0.80 0.14 100)", "oklch(0.72 0.17 190)"],
] as const;

export const gradientCount = AVATAR_GRADIENTS.length;

export const hashSeed = (seed: string | number | undefined): number => {
  if (seed == null) return 0;
  const s = String(seed);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

export const avatarGradientFor = (seed: string | number | undefined): readonly [string, string] => {
  const idx = hashSeed(seed) % gradientCount;
  return AVATAR_GRADIENTS[idx]!;
};
