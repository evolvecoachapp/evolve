/**
 * Immutable Weekly Coach Report decision section.
 * Composed from Coach Timeline — weekly decisions, plan restores, program modifications, interventions.
 * Presentation only. Never invent decisions.
 */
export interface WeeklyDecisionItem {
  readonly id: string;
  readonly category: string;
  readonly summary: string;
  readonly timestamp: string;
  readonly affectedDomain: string | null;
}

export interface WeeklyDecisionReport {
  readonly present: boolean;
  readonly decisionCount: number;
  readonly restoreCount: number;
  readonly modificationCount: number;
  readonly interventionCount: number;
  readonly items: readonly WeeklyDecisionItem[];
  readonly summary: string;
}
