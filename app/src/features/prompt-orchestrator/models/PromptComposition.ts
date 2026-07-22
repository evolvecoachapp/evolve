import type { AthleteProfile } from "../../athlete-context/models/AthleteProfile";
import type { ConversationContext } from "../../ai/models/ConversationContext";
import type { CoachSummary } from "../../coach-intelligence/models/CoachSummary";
import type { PromptContext } from "../../prompt-builder/models/PromptContext";
import type { WorkoutSummary } from "../../workout/models/WorkoutSummary";
import type { MemoryContext } from "./MemoryContext";
import type { PromptBudget } from "./PromptBudget";
import type { PromptContextKind } from "./PromptContextKind";
import type { PromptContextSelection } from "./PromptContextSelection";
import type { PromptIntent } from "./PromptIntent";

/**
 * Immutable merge of selected domain contexts after budget trimming.
 *
 * Contains structured domain payloads only — never prompt strings or
 * formatting. `promptContext` is the Prompt Builder payload when provided.
 */
export interface PromptComposition {
  readonly intent: PromptIntent;
  readonly selection: PromptContextSelection;
  readonly conversation: ConversationContext | null;
  readonly athleteProfile: AthleteProfile | null;
  readonly memory: MemoryContext | null;
  readonly workoutSummary: WorkoutSummary | null;
  readonly coachSummary: CoachSummary | null;
  /** Composed PromptContext for Prompt Builder / AIService, or null. */
  readonly promptContext: PromptContext | null;
  readonly budget: PromptBudget;
  /** Kinds removed by budget trimming (lowest priority first). */
  readonly trimmedKinds: readonly PromptContextKind[];
  /** Total relative weight of included kinds. */
  readonly usedWeight: number;
}
