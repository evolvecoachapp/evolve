import type { RecommendationMetadata } from "./RecommendationMetadata";

export const RecommendationConstraintKinds = {
  BLOCKING: "blocking",
  MUTUAL_EXCLUSION: "mutual_exclusion",
  ORDERING: "ordering",
  CAPACITY: "capacity",
} as const;

export type RecommendationConstraintKind =
  (typeof RecommendationConstraintKinds)[keyof typeof RecommendationConstraintKinds];

export interface RecommendationConstraint {
  readonly id: string;
  readonly kind: RecommendationConstraintKind;
  readonly subjectKeys: readonly string[];
  readonly blocking: boolean;
  readonly description: string;
  readonly metadata: RecommendationMetadata;
}
