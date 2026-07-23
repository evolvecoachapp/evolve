import type { CollaborationParticipant } from "../models/CollaborationParticipant";
import type { CollaborationPolicy } from "../models/CollaborationPolicy";
import { CollaborationPolicyKinds } from "../models/CollaborationPolicy";
import { freezeParticipant } from "../utils/FreezeCollaborationState";
import { sortParticipantsDeterministic } from "../utils/sortHelpers";

/**
 * Duplicate handling policy — keep first occurrence by agentId after sort.
 * Contains NO business logic.
 */
export interface DuplicateHandlingPolicy {
  readonly policy: CollaborationPolicy;
  deduplicate(
    participants: readonly CollaborationParticipant[],
  ): readonly CollaborationParticipant[];
}

export class DefaultDuplicateHandlingPolicy implements DuplicateHandlingPolicy {
  readonly policy: CollaborationPolicy = Object.freeze({
    id: "policy:collaboration:duplicate-handling:default",
    kind: CollaborationPolicyKinds.DUPLICATE_HANDLING,
    name: "Default Duplicate Handling",
    description:
      "Keeps the first participant per agentId after deterministic sort; drops later duplicates.",
    enabled: true,
  });

  deduplicate(
    participants: readonly CollaborationParticipant[],
  ): readonly CollaborationParticipant[] {
    const seen = new Set<string>();
    const unique: CollaborationParticipant[] = [];
    for (const participant of sortParticipantsDeterministic(participants)) {
      if (seen.has(participant.agentId)) continue;
      seen.add(participant.agentId);
      unique.push(freezeParticipant(participant));
    }
    return Object.freeze(unique);
  }
}

export function createDuplicateHandlingPolicy(): DuplicateHandlingPolicy {
  return new DefaultDuplicateHandlingPolicy();
}
