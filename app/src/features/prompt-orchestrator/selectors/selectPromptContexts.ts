import type { PromptContextKind } from "../models/PromptContextKind";
import type { PromptContextSelection } from "../models/PromptContextSelection";
import type { PromptIntent } from "../models/PromptIntent";
import type { PromptRequest } from "../models/PromptRequest";
import { PromptSelectionPolicy } from "../policies/PromptSelectionPolicy";

/**
 * Select context kinds for an intent, intersecting with available sources.
 *
 * Never includes a kind when the corresponding source is absent.
 */
export function selectPromptContexts(
  intent: PromptIntent,
  request: PromptRequest,
  selectionPolicy: PromptSelectionPolicy = new PromptSelectionPolicy(),
): PromptContextSelection {
  const allowed = selectionPolicy.kindsFor(intent);
  const kinds: PromptContextKind[] = [];

  for (const kind of allowed) {
    if (isAvailable(kind, request)) {
      kinds.push(kind);
    }
  }

  return toSelection(Object.freeze(kinds));
}

export function toSelection(
  kinds: readonly PromptContextKind[],
): PromptContextSelection {
  const set = new Set(kinds);
  return Object.freeze({
    kinds: Object.freeze([...kinds]),
    includeConversation: set.has("conversation"),
    includeAthlete: set.has("athlete"),
    includeMemory: set.has("memory"),
    includeWorkout: set.has("workout"),
    includeCoach: set.has("coach"),
  });
}

function isAvailable(kind: PromptContextKind, request: PromptRequest): boolean {
  switch (kind) {
    case "conversation":
      return request.conversation != null;
    case "athlete":
      return request.athleteProfile != null;
    case "memory":
      return request.memory != null;
    case "workout":
      return request.workoutSummary != null;
    case "coach":
      return request.coachSummary != null;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}
