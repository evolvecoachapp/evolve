import type { AthleteHistory } from "./AthleteHistory";
import type { HistorySnapshot } from "./HistorySnapshot";
import type { HistorySummary } from "./HistorySummary";

/**
 * Public result of the Athlete History Engine.
 */
export interface HistoryEngineResult {
  readonly history: AthleteHistory;
  readonly snapshot: HistorySnapshot;
  readonly summary: HistorySummary;
  readonly validationIssues: readonly string[];
}
