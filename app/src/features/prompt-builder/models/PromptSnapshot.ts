import type { PromptPackage } from "./PromptPackage";
import type { PromptStatistics } from "./PromptStatistics";
import type { PromptSummary } from "./PromptSummary";

export interface PromptSnapshot {
  readonly id: string;
  readonly promptPackage: PromptPackage;
  readonly summary: PromptSummary;
  readonly statistics: PromptStatistics;
  readonly frozenAt: string;
}
