import type { DecisionCategory } from "./DecisionCategory";

/**
 * Chronological entry for a recorded domain decision.
 */
export interface DecisionTimelineEntry {
  readonly decisionId: string;
  readonly sequence: number;
  readonly category: DecisionCategory;
  readonly summaryCode: string;
  readonly pipelineStep: string | null;
}

/**
 * Ordered timeline of decisions for one generation.
 */
export interface DecisionTimeline {
  readonly generationId: string;
  readonly entries: readonly DecisionTimelineEntry[];
}
