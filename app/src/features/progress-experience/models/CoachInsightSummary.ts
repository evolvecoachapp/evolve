export type CoachInsightSeverity = "positive" | "warning" | "action";

export interface CoachInsightSummary {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly metric: string;
  readonly severity: CoachInsightSeverity;
  readonly destination: string | null;
}

export function createCoachInsightSummary(input: CoachInsightSummary): CoachInsightSummary {
  return Object.freeze({ ...input });
}
