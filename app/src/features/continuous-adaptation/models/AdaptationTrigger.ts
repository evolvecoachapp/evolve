import type { AdaptationMetadata } from "./AdaptationMetadata";

export const AdaptationTriggerKinds = {
  PLATEAU: "plateau",
  REGRESSION: "regression",
  PROGRESS: "progress",
  RECOVERY: "recovery",
  CONSISTENCY: "consistency",
  ADHERENCE: "adherence",
  TREND: "trend",
  STATE: "state",
} as const;

export type AdaptationTriggerKind =
  (typeof AdaptationTriggerKinds)[keyof typeof AdaptationTriggerKinds];

export interface AdaptationTrigger {
  readonly id: string;
  readonly kind: AdaptationTriggerKind;
  readonly signalKey: string;
  readonly subjectId: string;
  readonly present: boolean;
  readonly metadata: AdaptationMetadata;
}
