import type { CoachEvidence } from "../../coach-intelligence/models/CoachEvidence";
import type { CoachObjective } from "../../coach-intelligence/models/CoachObjective";
import type { ConversationEvidence } from "../models/ConversationEvidence";
import { freezeEvidence } from "../utils/freezeContext";
import { normalizePriority } from "../utils/normalizePriorities";
import { sortEvidence } from "../utils/sortEvidence";

/**
 * Maps coaching evidence into ConversationEvidence.
 * One responsibility: evidence extraction only.
 */
export class EvidenceSelector {
  select(options: {
    readonly coachEvidence: readonly CoachEvidence[];
    readonly rankedObjectives: readonly CoachObjective[];
  }): readonly ConversationEvidence[] {
    const objectiveByEvidenceId = new Map<string, string>();
    for (const objective of options.rankedObjectives) {
      for (const evidenceId of objective.evidenceIds) {
        objectiveByEvidenceId.set(evidenceId, objective.id);
      }
    }

    const evidence = options.coachEvidence.map((item) =>
      freezeEvidence({
        id: `conversation-evidence:coach:${item.id}`,
        sourceType: item.sourceType,
        sourceId: item.sourceId,
        statement: item.statement,
        priority: normalizePriority(item.priority),
        attributes: Object.freeze({
          coachEvidenceId: item.id,
          objectiveId: objectiveByEvidenceId.get(item.id) ?? null,
          ...item.attributes,
        }),
      }),
    );

    return Object.freeze(sortEvidence(evidence));
  }
}

export function createEvidenceSelector(): EvidenceSelector {
  return new EvidenceSelector();
}
