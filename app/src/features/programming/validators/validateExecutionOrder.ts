import type { ExercisePrescription } from "../models/ExercisePrescription";

/**
 * Validate execution order is unique and sequential starting at 1.
 */
export function validateExecutionOrder(
  prescriptions: readonly ExercisePrescription[],
): readonly string[] {
  const issues: string[] = [];
  const orders = prescriptions.map((entry) => entry.order);
  const sorted = [...orders].sort((left, right) => left - right);

  for (let index = 0; index < sorted.length; index += 1) {
    const expected = index + 1;
    if (sorted[index] !== expected) {
      issues.push(`execution_order_gap_or_duplicate:expected_${expected}`);
      break;
    }
  }

  const seen = new Set<number>();
  for (const prescription of prescriptions) {
    if (seen.has(prescription.order)) {
      issues.push(`duplicate_order:${prescription.order}`);
    } else {
      seen.add(prescription.order);
    }
  }

  return Object.freeze(issues);
}
