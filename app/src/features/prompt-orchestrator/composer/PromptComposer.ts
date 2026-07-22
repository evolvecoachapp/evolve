import type { PromptContext } from "../../prompt-builder/models/PromptContext";
import type { PromptBudget } from "../models/PromptBudget";
import type { PromptComposition } from "../models/PromptComposition";
import type { PromptContextSelection } from "../models/PromptContextSelection";
import type { PromptIntent } from "../models/PromptIntent";
import type { PromptPriority } from "../models/PromptPriority";
import type { PromptRequest } from "../models/PromptRequest";
import { toSelection } from "../selectors/selectPromptContexts";
import { freezePromptComposition } from "../utils/freezePromptComposition";
import { trimContext } from "../utils/trimContext";

export interface ComposePromptOptions {
  readonly intent: PromptIntent;
  readonly selection: PromptContextSelection;
  readonly request: PromptRequest;
  readonly budget: PromptBudget;
  readonly priority: PromptPriority;
}

/**
 * Merge selected contexts, respect budget, freeze final PromptComposition.
 *
 * No formatting and no prompt strings — structured domain merge only.
 */
export class PromptComposer {
  compose(options: ComposePromptOptions): PromptComposition {
    const { intent, request, budget, priority } = options;
    const trimResult = trimContext(options.selection.kinds, budget, priority);
    const selection = toSelection(trimResult.kept);

    const composition: PromptComposition = {
      intent,
      selection,
      conversation: selection.includeConversation
        ? (request.conversation ?? null)
        : null,
      athleteProfile: selection.includeAthlete
        ? (request.athleteProfile ?? null)
        : null,
      memory: selection.includeMemory ? (request.memory ?? null) : null,
      workoutSummary: selection.includeWorkout
        ? (request.workoutSummary ?? null)
        : null,
      coachSummary: selection.includeCoach
        ? (request.coachSummary ?? null)
        : null,
      promptContext: projectPromptContext(
        request.promptContext ?? null,
        selection,
      ),
      budget,
      trimmedKinds: trimResult.trimmed,
      usedWeight: trimResult.usedWeight,
    };

    return freezePromptComposition(composition);
  }
}

/**
 * Project Prompt Builder output onto remaining domain selection.
 *
 * When coach context is deselected, coach evidence is cleared while keeping
 * PromptContext structurally valid for downstream Prompt Builder / AIService.
 */
function projectPromptContext(
  base: PromptContext | null,
  selection: PromptContextSelection,
): PromptContext | null {
  if (base == null) {
    return null;
  }

  if (!selection.includeAthlete && !selection.includeCoach) {
    return null;
  }

  if (!selection.includeCoach) {
    return Object.freeze({
      ...base,
      coach: Object.freeze({
        riskFlags: Object.freeze([]),
        recommendations: Object.freeze([]),
        insights: Object.freeze([]),
      }),
      metadata: Object.freeze({
        ...base.metadata,
        insightCount: 0,
        riskCount: 0,
        recommendationCount: 0,
      }),
    });
  }

  return base;
}
