export const RecommendationIntents = {
  ACT: "act",
  DEFER: "defer",
  MONITOR: "monitor",
  ESCALATE: "escalate",
  INFORM: "inform",
  SEQUENCE: "sequence",
  GROUP: "group",
} as const;

export type RecommendationIntent =
  (typeof RecommendationIntents)[keyof typeof RecommendationIntents];
