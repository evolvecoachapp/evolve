import type { CollaborationParticipant } from "../models/CollaborationParticipant";
import type { CollaborationPolicy } from "../models/CollaborationPolicy";
import { CollaborationPolicyKinds } from "../models/CollaborationPolicy";
import {
  ALL_COLLABORATION_ROLES,
  CollaborationRoles,
  type CollaborationRole,
} from "../models/CollaborationRole";
import { freezeParticipant } from "../utils/FreezeCollaborationState";

/**
 * Participant eligibility policy — specialists only by default.
 * Contains NO business logic.
 */
export interface ParticipantEligibilityPolicy {
  readonly policy: CollaborationPolicy;
  readonly allowedRoles: readonly CollaborationRole[];
  isEligible(participant: CollaborationParticipant): boolean;
  filterEligible(
    participants: readonly CollaborationParticipant[],
  ): readonly CollaborationParticipant[];
}

export class DefaultParticipantEligibilityPolicy
  implements ParticipantEligibilityPolicy
{
  readonly policy: CollaborationPolicy = Object.freeze({
    id: "policy:collaboration:participant-eligibility:default",
    kind: CollaborationPolicyKinds.PARTICIPANT_ELIGIBILITY,
    name: "Default Participant Eligibility",
    description:
      "Allows specialist roles (workout / nutrition / recovery); coach is not a dispatched specialist.",
    enabled: true,
  });

  constructor(
    readonly allowedRoles: readonly CollaborationRole[] = Object.freeze([
      CollaborationRoles.WORKOUT,
      CollaborationRoles.NUTRITION,
      CollaborationRoles.RECOVERY,
    ]),
  ) {}

  isEligible(participant: CollaborationParticipant): boolean {
    if (!participant.eligible) return false;
    if (!participant.agentId) return false;
    if (!(ALL_COLLABORATION_ROLES as readonly string[]).includes(participant.role)) {
      return false;
    }
    return (this.allowedRoles as readonly string[]).includes(participant.role);
  }

  filterEligible(
    participants: readonly CollaborationParticipant[],
  ): readonly CollaborationParticipant[] {
    return Object.freeze(
      participants
        .filter((p) => this.isEligible(p))
        .map((p) => freezeParticipant(p)),
    );
  }
}

export function createParticipantEligibilityPolicy(
  allowedRoles?: readonly CollaborationRole[],
): ParticipantEligibilityPolicy {
  return new DefaultParticipantEligibilityPolicy(allowedRoles);
}
