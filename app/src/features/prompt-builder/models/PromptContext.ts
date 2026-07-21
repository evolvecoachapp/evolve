import type { AthleteProfile } from "../../athlete-context/models/AthleteProfile";
import type { AthleteContext } from "./AthleteContext";
import type { CoachContext } from "./CoachContext";
import type { PerformanceContext } from "./PerformanceContext";
import type { PromptMetadata } from "./PromptMetadata";
import type { PromptSection } from "./PromptSection";
import type { TrainingContext } from "./TrainingContext";

/**
 * Complete structured prompt object for a future AI provider.
 *
 * Assembled from coach intelligence and athlete context — never markdown,
 * never prose, never serialized prompt strings.
 */
export interface PromptContext {
  /** Readiness / consistency derived from coach intelligence. */
  readonly athlete: AthleteContext;
  /** Who the athlete is — from Athlete Context domain. */
  readonly profile: AthleteProfile;
  readonly training: TrainingContext;
  readonly performance: PerformanceContext;
  readonly coach: CoachContext;
  readonly metadata: PromptMetadata;
  readonly sections: readonly PromptSection[];
}
