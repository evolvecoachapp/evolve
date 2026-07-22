/**
 * Collect negative / NaN issues for a labeled numeric value.
 */
export function checkNonNegative(
  label: string,
  value: number,
  issues: string[],
): void {
  if (Number.isNaN(value)) {
    issues.push(`nan_value:${label}`);
  } else if (!Number.isFinite(value)) {
    issues.push(`non_finite_value:${label}`);
  } else if (value < 0) {
    issues.push(`negative_value:${label}`);
  }
}

export function checkOptionalNonNegative(
  label: string,
  value: number | null,
  issues: string[],
): void {
  if (value === null) {
    return;
  }
  checkNonNegative(label, value, issues);
}
