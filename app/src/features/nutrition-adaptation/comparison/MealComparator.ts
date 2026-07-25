import { diffKeys, type KeyDiff } from "./diffHelpers";

export function compareMeals(
  before: readonly string[],
  after: readonly string[],
): KeyDiff {
  return diffKeys(before, after);
}
