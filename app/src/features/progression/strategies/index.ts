import { ExerciseRotationStrategy } from "./ExerciseRotationStrategy";
import { FrequencyProgressionStrategy } from "./FrequencyProgressionStrategy";
import { IntensityProgressionStrategy } from "./IntensityProgressionStrategy";
import { LinearProgressionStrategy } from "./LinearProgressionStrategy";
import type { ProgressionStrategy } from "./ProgressionStrategy";
import { VolumeProgressionStrategy } from "./VolumeProgressionStrategy";

export type { ProgressionStrategy } from "./ProgressionStrategy";

export { LinearProgressionStrategy } from "./LinearProgressionStrategy";
export { VolumeProgressionStrategy } from "./VolumeProgressionStrategy";
export { IntensityProgressionStrategy } from "./IntensityProgressionStrategy";
export { FrequencyProgressionStrategy } from "./FrequencyProgressionStrategy";
export { ExerciseRotationStrategy } from "./ExerciseRotationStrategy";

/**
 * Default ordered strategy pipeline.
 * Each strategy independently updates the exercise progression; order is apply sequence.
 */
export function createDefaultStrategies(): readonly ProgressionStrategy[] {
  return Object.freeze([
    new LinearProgressionStrategy(),
    new VolumeProgressionStrategy(),
    new IntensityProgressionStrategy(),
    new FrequencyProgressionStrategy(),
    new ExerciseRotationStrategy(),
  ]);
}
