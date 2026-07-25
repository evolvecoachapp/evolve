import type { AthleteStateRef } from "./AthleteStateRef";
import type { BlueprintRef } from "./BlueprintRef";
import type { CoachContextRef } from "./CoachContextRef";
import type { RuntimeRef } from "./RuntimeRef";
import type { WorkoutAdaptationDecisionRef } from "./WorkoutAdaptationDecisionRef";
import type { WorkoutMetadata } from "./WorkoutMetadata";
import type { WorkoutSnapshot } from "./WorkoutSnapshot";

export const WorkoutAdaptationInputKinds = {
  ADAPT: "adapt",
  COMPARE: "compare",
  DESCRIBE: "describe",
  SNAPSHOT: "snapshot",
  VALIDATE: "validate",
} as const;

export type WorkoutAdaptationInputKind =
  (typeof WorkoutAdaptationInputKinds)[keyof typeof WorkoutAdaptationInputKinds];

export interface WorkoutAdaptationInput {
  readonly id: string;
  readonly kind: WorkoutAdaptationInputKind;
  readonly athleteId: string;
  readonly blueprintId: string;
  readonly sessionId: string | null;
  readonly contextId: string;
  readonly blueprintKeys: readonly string[];
  readonly dayKeys: readonly string[];
  readonly exerciseKeys: readonly string[];
  readonly sessionKeys: readonly string[];
  readonly weekKeys: readonly string[];
  readonly decisionKeys: readonly string[];
  readonly signalKeys: readonly string[];
  readonly signalFlags: Readonly<Record<string, boolean>>;
  readonly priorSnapshot: WorkoutSnapshot | null;
  readonly decisionRef: WorkoutAdaptationDecisionRef | null;
  readonly blueprintRef: BlueprintRef | null;
  readonly runtimeRef: RuntimeRef | null;
  readonly athleteStateRef: AthleteStateRef | null;
  readonly coachContextRef: CoachContextRef | null;
  readonly reason: string;
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
