import type { CoachConstraint } from "../models/CoachConstraint";
import type { CoachEvidence } from "../models/CoachEvidence";
import type { CoachFocus } from "../models/CoachFocus";
import type { CoachInstruction } from "../models/CoachInstruction";
import type { CoachObjective } from "../models/CoachObjective";
import {
  COACH_PRIORITY_DEFAULT,
  COACH_PRIORITY_MAX,
  COACH_PRIORITY_MIN,
} from "../models/CoachPriority";

/**
 * Clamp a priority into the valid 1–100 range.
 */
export function normalizePriority(priority: number): number {
  if (!Number.isFinite(priority)) {
    return COACH_PRIORITY_DEFAULT;
  }
  return Math.min(
    COACH_PRIORITY_MAX,
    Math.max(COACH_PRIORITY_MIN, Math.round(priority)),
  );
}

export function normalizeObjectivePriorities(
  objectives: readonly CoachObjective[],
): readonly CoachObjective[] {
  return objectives.map((objective) => {
    const priority = normalizePriority(objective.priority);
    if (priority === objective.priority) {
      return objective;
    }
    return Object.freeze({ ...objective, priority });
  });
}

export function normalizeConstraintPriorities(
  constraints: readonly CoachConstraint[],
): readonly CoachConstraint[] {
  return constraints.map((constraint) => {
    const priority = normalizePriority(constraint.priority);
    if (priority === constraint.priority) {
      return constraint;
    }
    return Object.freeze({ ...constraint, priority });
  });
}

export function normalizeInstructionPriorities(
  instructions: readonly CoachInstruction[],
): readonly CoachInstruction[] {
  return instructions.map((instruction) => {
    const priority = normalizePriority(instruction.priority);
    if (priority === instruction.priority) {
      return instruction;
    }
    return Object.freeze({ ...instruction, priority });
  });
}

export function normalizeFocusPriorities(
  focusItems: readonly CoachFocus[],
): readonly CoachFocus[] {
  return focusItems.map((focus) => {
    const priority = normalizePriority(focus.priority);
    if (priority === focus.priority) {
      return focus;
    }
    return Object.freeze({ ...focus, priority });
  });
}

export function normalizeEvidencePriorities(
  evidence: readonly CoachEvidence[],
): readonly CoachEvidence[] {
  return evidence.map((item) => {
    const priority = normalizePriority(item.priority);
    if (priority === item.priority) {
      return item;
    }
    return Object.freeze({ ...item, priority });
  });
}
