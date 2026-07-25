import type { RecommendationMetadata } from "./RecommendationMetadata";

export const RecommendationTargetKinds = {
  ATHLETE: "athlete",
  SESSION: "session",
  DOMAIN: "domain",
  SUPERVISOR: "supervisor",
  EXPLAINABILITY: "explainability",
} as const;

export type RecommendationTargetKind =
  (typeof RecommendationTargetKinds)[keyof typeof RecommendationTargetKinds];

export interface RecommendationTarget {
  readonly id: string;
  readonly kind: RecommendationTargetKind;
  readonly referenceId: string;
  readonly label: string;
  readonly metadata: RecommendationMetadata;
}
