import type { DecisionMetadata } from "./DecisionMetadata";

export const DecisionTimelineEventKinds = {
  BUILD: "build",
  ANALYZE: "analyze",
  EVALUATE: "evaluate",
  PLAN: "plan",
  RESOLVE: "resolve",
  VALIDATE: "validate",
  DESCRIBE: "describe",
} as const;

export type DecisionTimelineEventKind =
  (typeof DecisionTimelineEventKinds)[keyof typeof DecisionTimelineEventKinds];

export interface DecisionTimelineItem {
  readonly id: string;
  readonly kind: DecisionTimelineEventKind;
  readonly label: string;
  readonly at: string;
  readonly metadata: DecisionMetadata;
}

export interface DecisionTimeline {
  readonly items: readonly DecisionTimelineItem[];
  readonly metadata: DecisionMetadata;
}
