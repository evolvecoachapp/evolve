import type { ConversationConstraint } from "../models/ConversationConstraint";
import type { ConversationEvidence } from "../models/ConversationEvidence";
import type { ConversationGoal } from "../models/ConversationGoal";
import type { ConversationMessage } from "../models/ConversationMessage";
import type { ConversationTurn } from "../models/ConversationTurn";
import {
  CONVERSATION_PRIORITY_DEFAULT,
  CONVERSATION_PRIORITY_MAX,
  CONVERSATION_PRIORITY_MIN,
} from "../models/ConversationPriority";

/**
 * Clamp a priority into the valid 1–100 range.
 */
export function normalizePriority(priority: number): number {
  if (!Number.isFinite(priority)) {
    return CONVERSATION_PRIORITY_DEFAULT;
  }
  return Math.min(
    CONVERSATION_PRIORITY_MAX,
    Math.max(CONVERSATION_PRIORITY_MIN, Math.round(priority)),
  );
}

export function normalizeGoalPriorities(
  goals: readonly ConversationGoal[],
): readonly ConversationGoal[] {
  return goals.map((goal) => {
    const priority = normalizePriority(goal.priority);
    if (priority === goal.priority) {
      return goal;
    }
    return Object.freeze({ ...goal, priority });
  });
}

export function normalizeConstraintPriorities(
  constraints: readonly ConversationConstraint[],
): readonly ConversationConstraint[] {
  return constraints.map((constraint) => {
    const priority = normalizePriority(constraint.priority);
    if (priority === constraint.priority) {
      return constraint;
    }
    return Object.freeze({ ...constraint, priority });
  });
}

export function normalizeEvidencePriorities(
  evidence: readonly ConversationEvidence[],
): readonly ConversationEvidence[] {
  return evidence.map((item) => {
    const priority = normalizePriority(item.priority);
    if (priority === item.priority) {
      return item;
    }
    return Object.freeze({ ...item, priority });
  });
}

export function normalizeMessagePriorities(
  messages: readonly ConversationMessage[],
): readonly ConversationMessage[] {
  return messages.map((message) => {
    const priority = normalizePriority(message.priority);
    if (priority === message.priority) {
      return message;
    }
    return Object.freeze({ ...message, priority });
  });
}

export function normalizeTurnPriorities(
  turns: readonly ConversationTurn[],
): readonly ConversationTurn[] {
  return turns.map((turn) => {
    const priority = normalizePriority(turn.priority);
    if (priority === turn.priority) {
      return turn;
    }
    return Object.freeze({ ...turn, priority });
  });
}
