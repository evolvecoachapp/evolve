import type { PromptPackage } from "./PromptPackage";
import type { PromptSnapshot } from "./PromptSnapshot";
import type { PromptStatistics } from "./PromptStatistics";
import type { PromptSummary } from "./PromptSummary";
import type { SystemPrompt } from "./SystemPrompt";
import type { UserPrompt } from "./UserPrompt";

export interface PromptBuildResult {
  readonly snapshot: PromptSnapshot;
  readonly promptPackage: PromptPackage;
  readonly summary: PromptSummary;
  readonly statistics: PromptStatistics;
  readonly systemPrompt: SystemPrompt;
  readonly userPrompt: UserPrompt;
  readonly validationIssues: readonly string[];
}
