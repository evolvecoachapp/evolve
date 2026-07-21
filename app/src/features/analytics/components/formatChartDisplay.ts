/**
 * Presentation helpers for chart axis labels.
 * Formats already-computed values — no analytics aggregation.
 */

/** Short UTC week label from ISO Monday (YYYY-MM-DD), e.g. "Jul 6". */
export function formatTrendWeekLabel(periodStart: string): string {
  const date = new Date(`${periodStart}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return periodStart;
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** Compact numeric label for axis ticks. */
export function formatChartAxisValue(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(Math.round(value));
}
