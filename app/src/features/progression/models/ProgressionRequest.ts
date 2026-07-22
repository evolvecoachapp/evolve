import type { WorkoutBlueprint } from "../../workout-blueprint/models/WorkoutBlueprint";
import type { ProgrammingResult } from "../../programming/models/ProgrammingResult";
import type { ProgressionWindow } from "./ProgressionWindow";

/**
 * Input to the Progression Engine.
 * Consumes a prior Programming result and its blueprint.
 */
export interface ProgressionRequest {
  readonly blueprint: WorkoutBlueprint;
  readonly programming: ProgrammingResult;
  /** Optional override; defaults from blueprint block weekCount or 4 weeks. */
  readonly window?: ProgressionWindow;
  readonly includeExplanations?: boolean;
}
