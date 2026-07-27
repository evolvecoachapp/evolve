import type { DailyBrief } from "./DailyBrief";
import type { DailyBriefSummary } from "./DailyBriefSummary";

export interface DailyBriefValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

/**
 * Immutable result of building / querying a Daily Brief.
 */
export interface DailyBriefResult {
  readonly id: string;
  readonly success: boolean;
  readonly brief: DailyBrief | null;
  readonly summary: DailyBriefSummary | null;
  readonly validation: DailyBriefValidation;
  readonly message: string;
  readonly generatedAt: string;
}
