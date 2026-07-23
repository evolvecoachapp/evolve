/** Volume helpers for Workout Agent planning (deterministic). */

export function estimateWeeklySets(
  daysPerWeek: number,
  volumeScore: number,
): number {
  return Math.round(daysPerWeek * (8 + volumeScore * 10));
}

export function isVolumeInRange(volumeScore: number): boolean {
  return volumeScore >= 0.2 && volumeScore <= 0.95;
}

export function volumeLabel(volumeScore: number): string {
  if (volumeScore < 0.4) return "low";
  if (volumeScore < 0.7) return "moderate";
  return "high";
}
