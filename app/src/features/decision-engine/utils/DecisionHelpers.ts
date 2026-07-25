import type { DecisionCandidate } from "../models/DecisionCandidate";
import type { DecisionCategory } from "../models/DecisionCategory";
import {
  DEFAULT_DECISION_PRIORITIES,
  type DecisionPriority,
} from "../models/DecisionPriority";
import type { CoachingDecision } from "../models/CoachingDecision";
import type { UnifiedCoachingContext } from "../../context-fusion/models/UnifiedCoachingContext";

export function priorityForCategory(
  category: DecisionCategory,
): DecisionPriority {
  const found = DEFAULT_DECISION_PRIORITIES.find((p) => p.category === category);
  return (
    found ??
    Object.freeze({
      category,
      ordinal: 99,
      label: category,
    })
  );
}

export function presentSourceKeys(
  context: UnifiedCoachingContext,
): readonly string[] {
  const keys: string[] = [];
  if (context.athlete) keys.push("athlete");
  if (context.session) keys.push("session");
  if (context.conversation) keys.push("conversation");
  if (context.workout) keys.push("workout");
  if (context.nutrition) keys.push("nutrition");
  if (context.recovery) keys.push("recovery");
  if (context.goal) keys.push("goal");
  if (context.supervisor) keys.push("supervisor");
  return Object.freeze(keys);
}

export function sortCandidatesByPriority(
  candidates: readonly DecisionCandidate[],
): readonly DecisionCandidate[] {
  return Object.freeze(
    [...candidates].sort(
      (a, b) =>
        a.priority.ordinal - b.priority.ordinal || a.id.localeCompare(b.id),
    ),
  );
}

export function sortDecisionsByPriority(
  decisions: readonly CoachingDecision[],
): readonly CoachingDecision[] {
  return Object.freeze(
    [...decisions].sort(
      (a, b) =>
        a.priority.ordinal - b.priority.ordinal || a.id.localeCompare(b.id),
    ),
  );
}

export function decisionIds(
  decisions: readonly CoachingDecision[],
): readonly string[] {
  return Object.freeze(decisions.map((d) => d.id));
}
