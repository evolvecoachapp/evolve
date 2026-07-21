/**
 * Volume for a completed set: load (kg) × reps.
 * Pure presentation/domain helper — UI must not inline this math.
 */
export function calculateSetVolume(weightKg: number, reps: number): number {
  const load = Number.isFinite(weightKg) ? Math.max(0, weightKg) : 0;
  const completedReps = Number.isFinite(reps) ? Math.max(0, reps) : 0;
  return Math.round(load * completedReps * 100) / 100;
}
