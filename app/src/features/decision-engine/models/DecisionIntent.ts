export const DecisionIntents = {
  PRIORITIZE: "prioritize",
  DEFER: "defer",
  BLOCK: "block",
  CONTINUE: "continue",
  ESCALATE: "escalate",
  RECOMMEND: "recommend",
  RESOLVE: "resolve",
} as const;

export type DecisionIntent =
  (typeof DecisionIntents)[keyof typeof DecisionIntents];
