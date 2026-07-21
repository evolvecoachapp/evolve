import type { AthleteContext } from "./AthleteContext";
import type { CoachContext } from "./CoachContext";
import type { PerformanceContext } from "./PerformanceContext";
import type { PromptMetadata } from "./PromptMetadata";
import type { PromptSection } from "./PromptSection";
import type { TrainingContext } from "./TrainingContext";

/**
 * Complete structured prompt object for a future AI provider.
 *
 * Assembled from coach intelligence only — never markdown, never prose,
 * never serialized prompt strings.
 */
export interface PromptContext {
  readonly athlete: AthleteContext;
  readonly training: TrainingContext;
  readonly performance: PerformanceContext;
  readonly coach: CoachContext;
  readonly metadata: PromptMetadata;
  readonly sections: readonly PromptSection[];
}
