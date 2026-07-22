/**
 * Returns true when current strictly exceeds baseline, or when no baseline exists
 * and current is a positive comparable value (first recorded value).
 */
export function isPersonalRecord(
  currentValue: number | null | undefined,
  baseline: number | null,
): { readonly isRecord: boolean; readonly isFirst: boolean } {
  if (currentValue == null || !Number.isFinite(currentValue)) {
    return { isRecord: false, isFirst: false };
  }
  if (baseline == null) {
    return { isRecord: currentValue > 0, isFirst: currentValue > 0 };
  }
  return {
    isRecord: currentValue > baseline,
    isFirst: false,
  };
}
