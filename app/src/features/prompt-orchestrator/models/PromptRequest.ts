import type { AthleteProfile } from "../../athlete-context/models/AthleteProfile";
import type { ConversationContext } from "../../ai/models/ConversationContext";
import type { CoachSummary } from "../../coach-intelligence/models/CoachSummary";
import type { PromptContext } from "../../prompt-builder/models/PromptContext";
import type { WorkoutSummary } from "../../workout/models/WorkoutSummary";
import type { MemoryContext } from "./MemoryContext";
import type { PromptIntent } from "./PromptIntent";

/**
 * Input for a single prompt orchestration pass.
 *
 * Carries available domain contexts and optional Prompt Builder output.
 * The orchestrator selects and composes — never formats or calls providers.
 */
export interface PromptRequest {
  /** Latest user message text for rule-based intent detection. */
  readonly message: string;
  readonly conversation?: ConversationContext | null;
  readonly athleteProfile?: AthleteProfile | null;
  readonly memory?: MemoryContext | null;
  readonly workoutSummary?: WorkoutSummary | null;
  readonly coachSummary?: CoachSummary | null;
  /**
   * Optional base PromptContext from Prompt Builder.
   * Trimmed to match selection / budget; never rebuilt from templates here.
   */
  readonly promptContext?: PromptContext | null;
  /** Optional intent override — skips rule-based detection when set. */
  readonly intentOverride?: PromptIntent;
}
