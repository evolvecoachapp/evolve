import { isValidConversationPriority } from "../models/ConversationPriority";
import type { ConversationConstraint } from "../models/ConversationConstraint";
import type { ConversationEvidence } from "../models/ConversationEvidence";
import type { ConversationGoal } from "../models/ConversationGoal";
import type { ConversationMessage } from "../models/ConversationMessage";
import type { ConversationTurn } from "../models/ConversationTurn";

/**
 * Soft-validate priorities are in 1–100.
 */
export function validatePriorities(options: {
  readonly goals: readonly ConversationGoal[];
  readonly constraints: readonly ConversationConstraint[];
  readonly evidence: readonly ConversationEvidence[];
  readonly messages: readonly ConversationMessage[];
  readonly turns: readonly ConversationTurn[];
}): readonly string[] {
  const issues: string[] = [];

  const check = (
    items: readonly { readonly id: string; readonly priority: number }[],
    kind: string,
  ) => {
    for (const item of items) {
      if (!isValidConversationPriority(item.priority)) {
        issues.push(`invalid_${kind}_priority:${item.id}`);
      }
    }
  };

  check(options.goals, "goal");
  check(options.constraints, "constraint");
  check(options.evidence, "evidence");
  check(options.messages, "message");
  check(options.turns, "turn");

  return issues;
}
