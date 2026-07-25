import type { RecommendationMetadata } from "./RecommendationMetadata";

export const RecommendationConflictKinds = {
  PRIORITY: "priority",
  MUTUAL_EXCLUSION: "mutual_exclusion",
  ORDERING: "ordering",
  DEPENDENCY: "dependency",
} as const;

export type RecommendationConflictKind =
  (typeof RecommendationConflictKinds)[keyof typeof RecommendationConflictKinds];

export interface RecommendationConflict {
  readonly id: string;
  readonly kind: RecommendationConflictKind;
  readonly leftId: string;
  readonly rightId: string;
  readonly description: string;
  readonly resolved: boolean;
  readonly metadata: RecommendationMetadata;
}
