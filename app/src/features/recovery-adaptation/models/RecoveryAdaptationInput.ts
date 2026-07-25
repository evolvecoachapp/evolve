import type { AthleteStateRef } from "./AthleteStateRef";
import type { CoachContextRef } from "./CoachContextRef";
import type { RecoveryAdaptationDecisionRef } from "./RecoveryAdaptationDecisionRef";
import type { RecoveryMetadata } from "./RecoveryMetadata";
import type { RecoverySnapshot } from "./RecoverySnapshot";
import type { PlanRef } from "./PlanRef";
import type { RuntimeRef } from "./RuntimeRef";

export const RecoveryAdaptationInputKinds = {
  ADAPT: "adapt",
  COMPARE: "compare",
  DESCRIBE: "describe",
  SNAPSHOT: "snapshot",
  VALIDATE: "validate",
} as const;

export type RecoveryAdaptationInputKind =
  (typeof RecoveryAdaptationInputKinds)[keyof typeof RecoveryAdaptationInputKinds];

export interface RecoveryAdaptationInput {
  readonly id: string;
  readonly kind: RecoveryAdaptationInputKind;
  readonly athleteId: string;
  readonly planId: string;
  readonly sessionId: string | null;
  readonly contextId: string;
  readonly planKeys: readonly string[];
  readonly dayKeys: readonly string[];
  readonly sleepKeys: readonly string[];
  readonly protocolKeys: readonly string[];
  readonly mobilityKeys: readonly string[];
  readonly weekKeys: readonly string[];
  readonly decisionKeys: readonly string[];
  readonly signalKeys: readonly string[];
  readonly signalFlags: Readonly<Record<string, boolean>>;
  readonly priorSnapshot: RecoverySnapshot | null;
  readonly decisionRef: RecoveryAdaptationDecisionRef | null;
  readonly planRef: PlanRef | null;
  readonly runtimeRef: RuntimeRef | null;
  readonly athleteStateRef: AthleteStateRef | null;
  readonly coachContextRef: CoachContextRef | null;
  readonly reason: string;
  readonly metadata: RecoveryMetadata;
  readonly createdAt: string;
}
