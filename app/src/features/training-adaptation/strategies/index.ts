import { ExerciseSwapStrategy } from "./ExerciseSwapStrategy";
import { IntensityAdaptationStrategy } from "./IntensityAdaptationStrategy";
import type { AdaptationStrategy } from "./AdaptationStrategy";
import { RecoveryDayStrategy } from "./RecoveryDayStrategy";
import { ScheduleAdjustmentStrategy } from "./ScheduleAdjustmentStrategy";
import { VolumeAdaptationStrategy } from "./VolumeAdaptationStrategy";

export type { AdaptationStrategy } from "./AdaptationStrategy";

export { VolumeAdaptationStrategy } from "./VolumeAdaptationStrategy";
export { IntensityAdaptationStrategy } from "./IntensityAdaptationStrategy";
export { ExerciseSwapStrategy } from "./ExerciseSwapStrategy";
export { RecoveryDayStrategy } from "./RecoveryDayStrategy";
export { ScheduleAdjustmentStrategy } from "./ScheduleAdjustmentStrategy";

/**
 * Default ordered adaptation strategy pipeline.
 * Each strategy independently emits recommendations; order is evaluation sequence.
 */
export function createDefaultStrategies(): readonly AdaptationStrategy[] {
  return Object.freeze([
    new VolumeAdaptationStrategy(),
    new IntensityAdaptationStrategy(),
    new ExerciseSwapStrategy(),
    new RecoveryDayStrategy(),
    new ScheduleAdjustmentStrategy(),
  ]);
}
