import { diffKeys, type KeyDiff } from "./diffHelpers";

export function compareExercises(
  before: readonly string[],
  after: readonly string[],
): KeyDiff {
  return diffKeys(before, after);
}
