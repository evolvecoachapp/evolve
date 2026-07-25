import type { AthleteStateRef } from "./AthleteStateRef";
import type { BlueprintRef } from "./BlueprintRef";
import type { CoachContextRef } from "./CoachContextRef";
import type { RuntimeRef } from "./RuntimeRef";
import type { WorkoutAdaptationDecisionRef } from "./WorkoutAdaptationDecisionRef";
import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface WorkoutAdaptationContext {
  readonly id: string;
  readonly athleteId: string;
  readonly blueprintId: string;
  readonly contextId: string;
  readonly blueprintRef: BlueprintRef | null;
  readonly runtimeRef: RuntimeRef | null;
  readonly athleteStateRef: AthleteStateRef | null;
  readonly coachContextRef: CoachContextRef | null;
  readonly decisionRef: WorkoutAdaptationDecisionRef | null;
  readonly signalKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
