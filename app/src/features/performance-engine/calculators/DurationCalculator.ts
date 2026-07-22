/**
 * Pure duration calculator — execution duration from runtime timestamps.
 */
export class DurationCalculator {
  /**
   * Duration in milliseconds from start → end.
   * Returns 0 when either timestamp is missing or end precedes start.
   */
  calculateMs(
    startedAt: string | null,
    endedAt: string | null,
  ): number {
    if (!startedAt || !endedAt) {
      return 0;
    }

    const start = Date.parse(startedAt);
    const end = Date.parse(endedAt);

    if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
      return 0;
    }

    return end - start;
  }

  calculateMinutes(durationMs: number): number {
    if (durationMs <= 0) {
      return 0;
    }
    return durationMs / 60_000;
  }
}
