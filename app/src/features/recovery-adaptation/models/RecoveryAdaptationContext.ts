import type { AthleteStateRef } from "./AthleteStateRef";
import type { CoachContextRef } from "./CoachContextRef";
import type { RecoveryAdaptationDecisionRef } from "./RecoveryAdaptationDecisionRef";
import type { RecoveryMetadata } from "./RecoveryMetadata";
import type { PlanRef } from "./PlanRef";
import type { RuntimeRef } from "./RuntimeRef";

export interface RecoveryAdaptationContext {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly contextId: string;
  readonly planRef: PlanRef | null;
  readonly runtimeRef: RuntimeRef | null;
  readonly athleteStateRef: AthleteStateRef | null;
  readonly coachContextRef: CoachContextRef | null;
  readonly decisionRef: RecoveryAdaptationDecisionRef | null;
  readonly signalKeys: readonly string[];
  readonly metadata: RecoveryMetadata;
  readonly createdAt: string;
}
