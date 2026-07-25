export const RecommendationTypes = {
  ACTION: "action",
  GUIDANCE: "guidance",
  CONSTRAINT: "constraint",
  SEQUENCE: "sequence",
  GROUP: "group",
  HANDOFF: "handoff",
} as const;

export type RecommendationType =
  (typeof RecommendationTypes)[keyof typeof RecommendationTypes];
