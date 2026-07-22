import { ExerciseOrderStrategy } from "./ExerciseOrderStrategy";
import { IntensityStrategy } from "./IntensityStrategy";
import { PriorityStrategy } from "./PriorityStrategy";
import type { ProgrammingStrategy } from "./ProgrammingStrategy";
import { RestStrategy } from "./RestStrategy";
import { TempoStrategy } from "./TempoStrategy";
import { VolumeStrategy } from "./VolumeStrategy";

export type { ProgrammingStrategy } from "./ProgrammingStrategy";

export { VolumeStrategy } from "./VolumeStrategy";
export { IntensityStrategy } from "./IntensityStrategy";
export { RestStrategy } from "./RestStrategy";
export { TempoStrategy } from "./TempoStrategy";
export { ExerciseOrderStrategy } from "./ExerciseOrderStrategy";
export { PriorityStrategy } from "./PriorityStrategy";

/**
 * Default ordered strategy pipeline.
 * Each strategy independently updates the prescription; order is apply sequence.
 */
export function createDefaultStrategies(): readonly ProgrammingStrategy[] {
  return Object.freeze([
    new VolumeStrategy(),
    new IntensityStrategy(),
    new RestStrategy(),
    new TempoStrategy(),
    new ExerciseOrderStrategy(),
    new PriorityStrategy(),
  ]);
}
