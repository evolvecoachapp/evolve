export const CoachInsightKinds = {
  DAILY: "daily",
  PINNED: "pinned",
  WORKOUT: "workout",
  RECOVERY: "recovery",
  NUTRITION: "nutrition",
  GENERAL: "general",
} as const;

export type CoachInsightKind =
  (typeof CoachInsightKinds)[keyof typeof CoachInsightKinds];

export const CoachInsightSeverities = {
  INFO: "info",
  POSITIVE: "positive",
  CAUTION: "caution",
  CRITICAL: "critical",
} as const;

export type CoachInsightSeverity =
  (typeof CoachInsightSeverities)[keyof typeof CoachInsightSeverities];

/** Immutable coach insight — presentation read model. */
export interface CoachInsight {
  readonly id: string;
  readonly kind: CoachInsightKind;
  readonly title: string;
  readonly body: string;
  readonly severity: CoachInsightSeverity;
  readonly pinned: boolean;
  readonly dismissed: boolean;
  readonly createdAt: string;
  readonly detailsDestination: string;
}

export function createCoachInsight(input: {
  readonly id: string;
  readonly kind: CoachInsightKind;
  readonly title: string;
  readonly body: string;
  readonly severity?: CoachInsightSeverity;
  readonly pinned?: boolean;
  readonly dismissed?: boolean;
  readonly createdAt: string;
  readonly detailsDestination?: string;
}): CoachInsight {
  return Object.freeze({
    id: input.id,
    kind: input.kind,
    title: input.title,
    body: input.body,
    severity: input.severity ?? CoachInsightSeverities.INFO,
    pinned: input.pinned ?? false,
    dismissed: input.dismissed ?? false,
    createdAt: input.createdAt,
    detailsDestination:
      input.detailsDestination ?? `/(app)/coach/insights/${input.id}`,
  });
}
