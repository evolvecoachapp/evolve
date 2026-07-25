import type { CoachingDecision } from "../../decision-engine/models/CoachingDecision";
import type { CoachingExplanation } from "../../explainability-engine/models/CoachingExplanation";
import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import type { AdaptationMetadata } from "./AdaptationMetadata";
import type { AdaptationSnapshot } from "./AdaptationSnapshot";

export const AdaptationInputKinds = {
  EVALUATE: "evaluate",
  DETECT: "detect",
  DESCRIBE: "describe",
  SNAPSHOT: "snapshot",
  VALIDATE: "validate",
} as const;

export type AdaptationInputKind =
  (typeof AdaptationInputKinds)[keyof typeof AdaptationInputKinds];

export interface AdaptationInput {
  readonly id: string;
  readonly kind: AdaptationInputKind;
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
  readonly priorSnapshot: AdaptationSnapshot | null;
  readonly reason: string;
  readonly metadata: AdaptationMetadata;
  readonly createdAt: string;
}
