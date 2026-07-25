import type { DecisionCategory } from "../models/DecisionCategory";
import { priorityForCategory } from "./DecisionHelpers";

export function compareCategoryPriority(
  left: DecisionCategory,
  right: DecisionCategory,
): number {
  return (
    priorityForCategory(left).ordinal - priorityForCategory(right).ordinal
  );
}

export function isHigherPriority(
  left: DecisionCategory,
  right: DecisionCategory,
): boolean {
  return compareCategoryPriority(left, right) < 0;
}
