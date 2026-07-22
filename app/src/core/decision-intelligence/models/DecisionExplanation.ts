/**
 * Template-based explanation variants for a decision or graph summary.
 * No AI — deterministic string templates only.
 */
export type DecisionExplanationStyle =
  | "human"
  | "developer"
  | "compact"
  | "detailed";

export interface DecisionExplanation {
  readonly decisionId: string;
  readonly style: DecisionExplanationStyle;
  readonly text: string;
  readonly codes: readonly string[];
}

/**
 * Aggregated explanation output for a report.
 */
export interface ExplanationReport {
  readonly generationId: string;
  readonly human: readonly DecisionExplanation[];
  readonly developer: readonly DecisionExplanation[];
  readonly compact: readonly DecisionExplanation[];
  readonly detailed: readonly DecisionExplanation[];
  readonly summaryText: string;
}
