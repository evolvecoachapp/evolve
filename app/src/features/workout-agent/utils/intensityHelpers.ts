/** Intensity helpers for Workout Agent planning (deterministic). */

export function isIntensityInRange(intensityScore: number): boolean {
  return intensityScore >= 0.2 && intensityScore <= 0.95;
}

export function intensityLabel(intensityScore: number): string {
  if (intensityScore < 0.45) return "low";
  if (intensityScore < 0.75) return "moderate";
  return "high";
}

export function suggestRpe(intensityScore: number): number {
  return Math.round((6 + intensityScore * 3) * 10) / 10;
}
