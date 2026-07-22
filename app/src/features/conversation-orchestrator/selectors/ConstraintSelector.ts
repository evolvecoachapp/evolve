import type { CoachConstraint } from "../../coach-intelligence/models/CoachConstraint";
import type { ConversationConstraint } from "../models/ConversationConstraint";
import { freezeConstraint } from "../utils/freezeContext";
import { normalizePriority } from "../utils/normalizePriorities";
import { sortConstraints } from "../utils/sortEvidence";

/**
 * Maps coaching constraints into ConversationConstraint.
 * One responsibility: constraint selection only.
 */
export class ConstraintSelector {
  select(
    coachConstraints: readonly CoachConstraint[],
  ): readonly ConversationConstraint[] {
    const constraints = coachConstraints.map((constraint) =>
      freezeConstraint({
        id: `conversation-constraint:${constraint.id}`,
        code: constraint.code,
        statement: constraint.statement,
        sourceType: constraint.sourceType,
        sourceId: constraint.sourceId,
        priority: normalizePriority(constraint.priority),
        reason: Object.freeze({
          code: constraint.reason.code,
          statement: constraint.reason.statement,
          attributes: Object.freeze({
            ...constraint.reason.attributes,
            coachConstraintId: constraint.id,
          }),
        }),
      }),
    );

    return Object.freeze(sortConstraints(constraints));
  }
}

export function createConstraintSelector(): ConstraintSelector {
  return new ConstraintSelector();
}
