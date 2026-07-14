import type { ExerciseSet, PerceivedDifficulty } from "../types";

export interface SetPrescriptionInput {
  setNumber: number;
  targetReps: number;
  percentage?: number | null;
  oneRepMax?: number | null;
  targetWeight?: number | null;
  rpe?: number | null;
  rir?: number | null;
  restSeconds?: number | null;
  tempo?: string | null;
  pauseSeconds?: number | null;
  velocityTarget?: number | null;
  completedWeight?: number | null;
  perceivedDifficulty?: PerceivedDifficulty | null;
}

let setIdCounter = 0;

/** Generate a stable local ID for mock sets. */
export function createSetId(prefix: string): string {
  setIdCounter += 1;
  return `${prefix}-set-${setIdCounter}`;
}

/** Round to the nearest 2.5 kg increment — standard barbell loading step. */
export function roundToPlateIncrement(weightKg: number, increment = 2.5): number {
  return Math.round(weightKg / increment) * increment;
}

/** Derive target weight from a percentage of a known 1RM. */
export function weightFromPercentage(oneRepMax: number, percentage: number): number {
  return roundToPlateIncrement((oneRepMax * percentage) / 100);
}

/** Build an incomplete ExerciseSet from a prescription template. */
export function buildSet(prefix: string, input: SetPrescriptionInput): ExerciseSet {
  const percentage = input.percentage ?? null;
  const oneRepMax = input.oneRepMax ?? null;
  const derivedWeight =
    input.targetWeight ??
    (percentage !== null && oneRepMax !== null
      ? weightFromPercentage(oneRepMax, percentage)
      : null);

  return {
    id: createSetId(prefix),
    setNumber: input.setNumber,
    targetWeight: derivedWeight,
    targetReps: input.targetReps,
    completedReps: null,
    rir: input.rir ?? null,
    rpe: input.rpe ?? null,
    percentage,
    restSeconds: input.restSeconds ?? null,
    completed: false,
    tempo: input.tempo ?? null,
    pauseSeconds: input.pauseSeconds ?? null,
    velocityTarget: input.velocityTarget ?? null,
    completedWeight: input.completedWeight ?? null,
    perceivedDifficulty: input.perceivedDifficulty ?? null,
  };
}

/** Build a sequence of sets from prescription inputs, auto-numbering from 1. */
export function buildSets(prefix: string, prescriptions: Omit<SetPrescriptionInput, "setNumber">[]): ExerciseSet[] {
  return prescriptions.map((prescription, index) =>
    buildSet(prefix, { ...prescription, setNumber: index + 1 }),
  );
}
