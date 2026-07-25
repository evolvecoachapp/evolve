import type { CoachingDecision } from "../../decision-engine/models/CoachingDecision";
import type { CoachingExplanation } from "../../explainability-engine/models/CoachingExplanation";
import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import type { GoalMetadata } from "./GoalMetadata";
import type { GoalSnapshot } from "./GoalSnapshot";

export const GoalProgressInputKinds = {
  EVALUATE: "evaluate",
  TRACK: "track",
  DESCRIBE: "describe",
  SNAPSHOT: "snapshot",
  VALIDATE: "validate",
} as const;

export type GoalProgressInputKind =
  (typeof GoalProgressInputKinds)[keyof typeof GoalProgressInputKinds];

export interface GoalProgressInput {
  readonly id: string;
  readonly kind: GoalProgressInputKind;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly decisions: readonly CoachingDecision[];
  readonly recommendations: readonly CoachingRecommendation[];
  readonly explanations: readonly CoachingExplanation[];
  readonly stateKeys: readonly string[];
  readonly performanceKeys: readonly string[];
  readonly recoveryKeys: readonly string[];
  readonly nutritionKeys: readonly string[];
  readonly goalKeys: readonly string[];
  readonly adherenceKeys: readonly string[];
  readonly historyKeys: readonly string[];
  readonly timelineKeys: readonly string[];
  readonly signalFlags: Readonly<Record<string, boolean>>;
  readonly priorSnapshot: GoalSnapshot | null;
  readonly reason: string;
  readonly metadata: GoalMetadata;
  readonly createdAt: string;
}
