import type { ExercisePrescription } from "../models/ExercisePrescription";
import type { PrescriptionTempo } from "../models/PrescriptionTempo";

const DEFAULT_SECONDS_PER_REP = 3;
const TRANSITION_SECONDS = 15;

function tempoSecondsPerRep(tempo: PrescriptionTempo | null): number {
  if (!tempo) {
    return DEFAULT_SECONDS_PER_REP;
  }
  return (
    tempo.eccentricSeconds +
    tempo.bottomPauseSeconds +
    tempo.concentricSeconds +
    tempo.topPauseSeconds
  );
}

/**
 * Estimate total duration in seconds for one exercise prescription.
 * Deterministic — no randomness, no athlete timing history.
 */
export function estimateDuration(prescription: ExercisePrescription): number {
  const sets = prescription.volume.sets;
  if (sets <= 0) {
    return 0;
  }

  const avgReps =
    (prescription.volume.repMin + prescription.volume.repMax) / 2;
  const workSeconds = Math.round(
    sets * avgReps * tempoSecondsPerRep(prescription.tempo),
  );
  const restSeconds = Math.max(0, sets - 1) * prescription.rest.seconds;
  return workSeconds + restSeconds + TRANSITION_SECONDS;
}
