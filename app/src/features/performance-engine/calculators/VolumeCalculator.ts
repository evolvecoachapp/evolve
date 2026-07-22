/**
 * Extracted completed-set sample used by calculators.
 */
export interface CompletedSetSample {
  readonly setRuntimeId: string;
  readonly exerciseRuntimeId: string;
  readonly setIndex: number;
  readonly weight: number | null;
  readonly repetitions: number | null;
  readonly rpe: number | null;
  readonly rir: number | null;
}

/**
 * Exercise lifecycle sample from domain events.
 */
export interface ExerciseLifecycleSample {
  readonly exerciseRuntimeId: string;
  readonly exerciseId: string;
  readonly exerciseName: string;
  readonly order: number;
  readonly skipped: boolean;
  readonly completed: boolean;
}

/**
 * Pure volume calculator — one responsibility.
 */
export class VolumeCalculator {
  calculate(sets: readonly CompletedSetSample[]): {
    readonly tonnage: number;
    readonly volumeLoad: number;
    readonly totalCompletedSets: number;
    readonly totalCompletedRepetitions: number;
    readonly loadedSetCount: number;
    readonly unloadedSetCount: number;
  } {
    let tonnage = 0;
    let totalCompletedRepetitions = 0;
    let loadedSetCount = 0;
    let unloadedSetCount = 0;

    for (const set of sets) {
      const reps = set.repetitions;
      if (reps !== null && reps !== undefined) {
        totalCompletedRepetitions += reps;
      }

      if (
        set.weight !== null &&
        set.weight !== undefined &&
        reps !== null &&
        reps !== undefined
      ) {
        tonnage += set.weight * reps;
        loadedSetCount += 1;
      } else {
        unloadedSetCount += 1;
      }
    }

    return Object.freeze({
      tonnage,
      volumeLoad: tonnage,
      totalCompletedSets: sets.length,
      totalCompletedRepetitions,
      loadedSetCount,
      unloadedSetCount,
    });
  }
}
