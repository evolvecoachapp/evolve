import { AccessoryExerciseSelector } from "./AccessoryExerciseSelector";
import type { ExerciseRoleSelector } from "./ExerciseRoleSelector";
import { PrimaryExerciseSelector } from "./PrimaryExerciseSelector";
import { SecondaryExerciseSelector } from "./SecondaryExerciseSelector";

export type { ExerciseRoleSelector } from "./ExerciseRoleSelector";
export { PrimaryExerciseSelector } from "./PrimaryExerciseSelector";
export { SecondaryExerciseSelector } from "./SecondaryExerciseSelector";
export { AccessoryExerciseSelector } from "./AccessoryExerciseSelector";

export function createDefaultSelectors(): readonly ExerciseRoleSelector[] {
  return Object.freeze([
    new PrimaryExerciseSelector(),
    new SecondaryExerciseSelector(),
    new AccessoryExerciseSelector(),
  ]);
}
