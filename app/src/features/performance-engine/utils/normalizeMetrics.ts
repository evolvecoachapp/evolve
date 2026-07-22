import type { PerformanceMetrics } from "../models/PerformanceMetrics";
import type { VolumeMetrics } from "../models/VolumeMetrics";
import type { IntensityMetrics } from "../models/IntensityMetrics";
import type { DensityMetrics } from "../models/DensityMetrics";
import type { CompletionMetrics } from "../models/CompletionMetrics";

/**
 * Normalize floating metrics to stable precision for snapshots.
 */
export function normalizeNumber(
  value: number | null,
  decimals = 4,
): number | null {
  if (value === null) {
    return null;
  }
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function normalizeVolume(volume: VolumeMetrics): VolumeMetrics {
  return Object.freeze({
    ...volume,
    tonnage: normalizeNumber(volume.tonnage) ?? 0,
    volumeLoad: normalizeNumber(volume.volumeLoad) ?? 0,
  });
}

export function normalizeIntensity(
  intensity: IntensityMetrics,
): IntensityMetrics {
  return Object.freeze({
    ...intensity,
    averageWeight: normalizeNumber(intensity.averageWeight),
    averageRepetitions: normalizeNumber(intensity.averageRepetitions),
    averageRpe: normalizeNumber(intensity.averageRpe),
    averageRir: normalizeNumber(intensity.averageRir),
    maxWeight: normalizeNumber(intensity.maxWeight),
    maxRpe: normalizeNumber(intensity.maxRpe),
  });
}

export function normalizeDensity(density: DensityMetrics): DensityMetrics {
  return Object.freeze({
    ...density,
    durationMinutes: normalizeNumber(density.durationMinutes) ?? 0,
    tonnagePerMinute: normalizeNumber(density.tonnagePerMinute),
    setsPerMinute: normalizeNumber(density.setsPerMinute),
    repetitionsPerMinute: normalizeNumber(density.repetitionsPerMinute),
  });
}

export function normalizeCompletion(
  completion: CompletionMetrics,
): CompletionMetrics {
  return Object.freeze({
    ...completion,
    exerciseCompletionPercent:
      normalizeNumber(completion.exerciseCompletionPercent) ?? 0,
    setCompletionPercent:
      normalizeNumber(completion.setCompletionPercent) ?? 0,
    workoutCompletionPercent:
      normalizeNumber(completion.workoutCompletionPercent) ?? 0,
  });
}

export function normalizeMetrics(
  metrics: PerformanceMetrics,
): PerformanceMetrics {
  return Object.freeze({
    volume: normalizeVolume(metrics.volume),
    intensity: normalizeIntensity(metrics.intensity),
    density: normalizeDensity(metrics.density),
    completion: normalizeCompletion(metrics.completion),
  });
}
