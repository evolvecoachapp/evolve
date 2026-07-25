import type { CoachingDecision } from "../../decision-engine/models/CoachingDecision";
import type { ExplainabilityInput } from "../../recommendation-engine/models/ExplainabilityInput";
import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import type { RecommendationPackage } from "../../recommendation-engine/models/RecommendationPackage";
import type { ExplanationMetadata } from "./ExplanationMetadata";

export const ExplanationInputKinds = {
  BUILD: "build",
  VALIDATE: "validate",
  SNAPSHOT: "snapshot",
  PACKAGE: "package",
  DESCRIBE: "describe",
} as const;

export type ExplanationInputKind =
  (typeof ExplanationInputKinds)[keyof typeof ExplanationInputKinds];

export interface ExplanationInput {
  readonly id: string;
  readonly kind: ExplanationInputKind;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly decisions: readonly CoachingDecision[];
  readonly recommendations: readonly CoachingRecommendation[];
  readonly recommendationPackage: RecommendationPackage | null;
  readonly explainabilityHandoff: ExplainabilityInput | null;
  readonly reason: string;
  readonly metadata: ExplanationMetadata;
  readonly createdAt: string;
}
