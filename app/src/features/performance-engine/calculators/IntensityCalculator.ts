import type { CompletedSetSample } from "./VolumeCalculator";

function average(values: readonly number[]): number | null {
  if (values.length === 0) {
    return null;
  }
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
}

function maxOrNull(values: readonly number[]): number | null {
  if (values.length === 0) {
    return null;
  }
  return Math.max(...values);
}

/**
 * Pure intensity calculator — averages and peaks from set samples.
 */
export class IntensityCalculator {
  calculate(sets: readonly CompletedSetSample[]): {
    readonly averageWeight: number | null;
    readonly averageRepetitions: number | null;
    readonly averageRpe: number | null;
    readonly averageRir: number | null;
    readonly maxWeight: number | null;
    readonly maxRpe: number | null;
    readonly weightSampleCount: number;
    readonly rpeSampleCount: number;
    readonly rirSampleCount: number;
  } {
    const weights: number[] = [];
    const repetitions: number[] = [];
    const rpes: number[] = [];
    const rirs: number[] = [];

    for (const set of sets) {
      if (set.weight !== null && set.weight !== undefined) {
        weights.push(set.weight);
      }
      if (set.repetitions !== null && set.repetitions !== undefined) {
        repetitions.push(set.repetitions);
      }
      if (set.rpe !== null && set.rpe !== undefined) {
        rpes.push(set.rpe);
      }
      if (set.rir !== null && set.rir !== undefined) {
        rirs.push(set.rir);
      }
    }

    return Object.freeze({
      averageWeight: average(weights),
      averageRepetitions: average(repetitions),
      averageRpe: average(rpes),
      averageRir: average(rirs),
      maxWeight: maxOrNull(weights),
      maxRpe: maxOrNull(rpes),
      weightSampleCount: weights.length,
      rpeSampleCount: rpes.length,
      rirSampleCount: rirs.length,
    });
  }
}
