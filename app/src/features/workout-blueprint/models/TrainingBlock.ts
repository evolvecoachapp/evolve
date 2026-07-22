import type { TrainingFocus } from "./TrainingFocus";
import type { TrainingPriority } from "./TrainingPriority";

/**
 * High-level training block within a blueprint.
 *
 * Strategy and duration only — no progression, deload, or exercise logic.
 */
export interface TrainingBlock {
  readonly id: string;
  readonly name: string;
  readonly order: number;
  /** Number of weeks this block spans. */
  readonly weekCount: number;
  readonly priority: TrainingPriority;
  readonly focus: TrainingFocus;
}
