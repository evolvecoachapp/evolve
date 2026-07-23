export const RecoveryReasoningTopics = Object.freeze({
  GOAL: "goal" as const,
  FATIGUE: "fatigue" as const,
  READINESS: "readiness" as const,
  SLEEP: "sleep" as const,
  STRESS: "stress" as const,
  TRAINING_LOAD: "training_load" as const,
  DOMS: "doms" as const,
  RECOVERY_SCORE: "recovery_score" as const,
  DELOAD: "deload" as const,
  ADAPTATION: "adaptation" as const,
  HRV: "hrv" as const,
  WELLNESS: "wellness" as const,
  EDUCATION: "education" as const,
});

export type RecoveryReasoningTopic =
  (typeof RecoveryReasoningTopics)[keyof typeof RecoveryReasoningTopics];

export interface RecoveryReasoning {
  readonly id: string;
  readonly topic: RecoveryReasoningTopic;
  readonly findings: readonly string[];
  readonly signals: Readonly<Record<string, number | string | boolean | null>>;
  readonly notes: readonly string[];
}
