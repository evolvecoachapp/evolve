/**
 * Pure density calculator — work rates vs duration.
 * Never divides by zero; returns null rates when duration is zero.
 */
export class DensityCalculator {
  calculate(input: {
    readonly durationMs: number;
    readonly tonnage: number;
    readonly completedSets: number;
    readonly completedRepetitions: number;
  }): {
    readonly durationMs: number;
    readonly durationMinutes: number;
    readonly tonnagePerMinute: number | null;
    readonly setsPerMinute: number | null;
    readonly repetitionsPerMinute: number | null;
  } {
    const durationMinutes =
      input.durationMs > 0 ? input.durationMs / 60_000 : 0;

    if (durationMinutes <= 0) {
      return Object.freeze({
        durationMs: input.durationMs,
        durationMinutes: 0,
        tonnagePerMinute: null,
        setsPerMinute: null,
        repetitionsPerMinute: null,
      });
    }

    return Object.freeze({
      durationMs: input.durationMs,
      durationMinutes,
      tonnagePerMinute: input.tonnage / durationMinutes,
      setsPerMinute: input.completedSets / durationMinutes,
      repetitionsPerMinute: input.completedRepetitions / durationMinutes,
    });
  }
}
