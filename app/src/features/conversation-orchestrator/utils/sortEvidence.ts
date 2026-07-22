import type { ConversationConstraint } from "../models/ConversationConstraint";
import type { ConversationEvidence } from "../models/ConversationEvidence";
import type { ConversationGoal } from "../models/ConversationGoal";
import type { ConversationMessage } from "../models/ConversationMessage";
import type { ConversationTurn } from "../models/ConversationTurn";

function compareByPriorityThenId(
  a: { readonly priority: number; readonly id: string },
  b: { readonly priority: number; readonly id: string },
): number {
  if (b.priority !== a.priority) {
    return b.priority - a.priority;
  }
  return a.id.localeCompare(b.id);
}

/**
 * Sort evidence by priority desc, then id asc.
 */
export function sortEvidence(
  evidence: readonly ConversationEvidence[],
): readonly ConversationEvidence[] {
  return [...evidence].sort(compareByPriorityThenId);
}

export function sortGoals(
  goals: readonly ConversationGoal[],
): readonly ConversationGoal[] {
  return [...goals].sort(compareByPriorityThenId);
}

export function sortConstraints(
  constraints: readonly ConversationConstraint[],
): readonly ConversationConstraint[] {
  return [...constraints].sort(compareByPriorityThenId);
}

export function sortMessages(
  messages: readonly ConversationMessage[],
): readonly ConversationMessage[] {
  return [...messages].sort(compareByPriorityThenId);
}

export function sortTurns(
  turns: readonly ConversationTurn[],
): readonly ConversationTurn[] {
  return [...turns].sort((a, b) => {
    if (a.index !== b.index) {
      return a.index - b.index;
    }
    return compareByPriorityThenId(a, b);
  });
}
