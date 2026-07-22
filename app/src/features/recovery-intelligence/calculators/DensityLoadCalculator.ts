import type { PerformanceSnapshot } from "../../performance-engine/models/PerformanceSnapshot";
import type { DensityLoad } from "../models/DensityLoad";
import { clamp, normalizeNonNegative, roundTo } from "../utils/normalizeValues";

/**
 * Pure density-load calculator from Performance Snapshot density metrics.
 * One responsibility: density → density load score.
 */
export class DensityLoadCalculator {
  calculate(performanceSnapshot: PerformanceSnapshot): DensityLoad {
    const density = performanceSnapshot.metrics.density;
    const durationMs = normalizeNonNegative(density.durationMs);
    const durationMinutes = normalizeNonNegative(density.durationMinutes);
    const tonnagePerMinute = density.tonnagePerMinute;
    const setsPerMinute = density.setsPerMinute;
    const repetitionsPerMinute = density.repetitionsPerMinute;

    // 50 tonnage/min → 100; null rates contribute 0.
    const densityScore =
      tonnagePerMinute === null || !Number.isFinite(tonnagePerMinute)
        ? 0
        : clamp(roundTo((tonnagePerMinute / 50) * 100, 4), 0, 100);

    return Object.freeze({
      durationMs,
      durationMinutes,
      tonnagePerMinute,
      setsPerMinute,
      repetitionsPerMinute,
      densityScore,
    });
  }
}

export function createDensityLoadCalculator(): DensityLoadCalculator {
  return new DensityLoadCalculator();
}
