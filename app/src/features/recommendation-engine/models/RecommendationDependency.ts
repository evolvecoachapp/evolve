import type { RecommendationMetadata } from "./RecommendationMetadata";

export const RecommendationDependencyKinds = {
  REQUIRES: "requires",
  FOLLOWS: "follows",
  BLOCKS: "blocks",
  GROUPS_WITH: "groups_with",
} as const;

export type RecommendationDependencyKind =
  (typeof RecommendationDependencyKinds)[keyof typeof RecommendationDependencyKinds];

export interface RecommendationDependency {
  readonly id: string;
  readonly kind: RecommendationDependencyKind;
  readonly fromId: string;
  readonly toId: string;
  readonly required: boolean;
  readonly metadata: RecommendationMetadata;
}
