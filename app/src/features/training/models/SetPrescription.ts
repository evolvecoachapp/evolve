import type { SetType } from "../enums/SetType";
import type { SetPrescriptionId } from "../types/ids";
import type { IntensityTarget } from "../types/IntensityTarget";
import type { RepRange } from "../types/RepRange";
import type { Tempo } from "../types/Tempo";

/**
 * A single prescribed (not logged) set: what an athlete should aim for —
 * how many reps, at what intensity, with how much rest and tempo. This is
 * pure programming data; capturing what was actually performed belongs to
 * a future execution/session domain, not to this foundation.
 */
export interface SetPrescription {
  readonly id: SetPrescriptionId;
  readonly setType: SetType;
  readonly targetReps: RepRange | number;
  readonly intensity: IntensityTarget | null;
  readonly restSeconds: number | null;
  readonly tempo: Tempo | null;
  readonly notes: string | null;
}
