import type { CollaborationParticipant } from "../models/CollaborationParticipant";
import type { CollaborationRequest } from "../models/CollaborationRequest";
import {
  CollaborationRoles,
  type CollaborationRole,
} from "../models/CollaborationRole";
import { EMPTY_COLLABORATION_METADATA } from "../models/CollaborationMetadata";
import {
  createDuplicateHandlingPolicy,
  type DuplicateHandlingPolicy,
} from "../policies/DuplicateHandlingPolicy";
import {
  createExecutionOrderingPolicy,
  type ExecutionOrderingPolicy,
} from "../policies/ExecutionOrderingPolicy";
import {
  createParticipantEligibilityPolicy,
  type ParticipantEligibilityPolicy,
} from "../policies/ParticipantEligibilityPolicy";
import { freezeParticipant } from "../utils/FreezeCollaborationState";

const DEFAULT_AGENT_IDS: Readonly<Record<CollaborationRole, string>> =
  Object.freeze({
    [CollaborationRoles.COACH]: "agent:coach",
    [CollaborationRoles.WORKOUT]: "agent:workout",
    [CollaborationRoles.NUTRITION]: "agent:nutrition",
    [CollaborationRoles.RECOVERY]: "agent:recovery",
  });

export interface ParticipantSelectorDeps {
  readonly eligibilityPolicy?: ParticipantEligibilityPolicy;
  readonly duplicatePolicy?: DuplicateHandlingPolicy;
  readonly orderingPolicy?: ExecutionOrderingPolicy;
  readonly agentIdByRole?: Readonly<Partial<Record<CollaborationRole, string>>>;
}

/**
 * Selects collaboration participants from a Coach request.
 * Planning only — never executes.
 */
export class ParticipantSelector {
  private readonly eligibilityPolicy: ParticipantEligibilityPolicy;
  private readonly duplicatePolicy: DuplicateHandlingPolicy;
  private readonly orderingPolicy: ExecutionOrderingPolicy;
  private readonly agentIdByRole: Readonly<
    Partial<Record<CollaborationRole, string>>
  >;

  constructor(deps: ParticipantSelectorDeps = {}) {
    this.eligibilityPolicy =
      deps.eligibilityPolicy ?? createParticipantEligibilityPolicy();
    this.duplicatePolicy =
      deps.duplicatePolicy ?? createDuplicateHandlingPolicy();
    this.orderingPolicy =
      deps.orderingPolicy ?? createExecutionOrderingPolicy();
    this.agentIdByRole = deps.agentIdByRole ?? {};
  }

  select(request: CollaborationRequest): readonly CollaborationParticipant[] {
    const candidates: CollaborationParticipant[] = [];

    for (let i = 0; i < request.requestedRoles.length; i++) {
      const role = request.requestedRoles[i];
      const agentId =
        this.agentIdByRole[role] ??
        DEFAULT_AGENT_IDS[role] ??
        `agent:${role}`;
      candidates.push(
        freezeParticipant({
          id: `participant:${request.id}:${role}:${i + 1}`,
          agentId,
          role,
          order: i + 1,
          required: true,
          eligible: true,
          capability: null,
          metadata: EMPTY_COLLABORATION_METADATA,
        }),
      );
    }

    for (let i = 0; i < request.requestedAgentIds.length; i++) {
      const agentId = request.requestedAgentIds[i];
      const role = inferRoleFromAgentId(agentId);
      candidates.push(
        freezeParticipant({
          id: `participant:${request.id}:agent:${i + 1}`,
          agentId,
          role,
          order: candidates.length + 1,
          required: true,
          eligible: true,
          capability: null,
          metadata: EMPTY_COLLABORATION_METADATA,
        }),
      );
    }

    const eligible = this.eligibilityPolicy.filterEligible(candidates);
    const unique = this.duplicatePolicy.deduplicate(eligible);
    return this.orderingPolicy.orderParticipants(unique);
  }
}

function inferRoleFromAgentId(agentId: string): CollaborationRole {
  const lower = agentId.toLowerCase();
  if (lower.includes("workout")) return CollaborationRoles.WORKOUT;
  if (lower.includes("nutrition")) return CollaborationRoles.NUTRITION;
  if (lower.includes("recovery")) return CollaborationRoles.RECOVERY;
  if (lower.includes("coach")) return CollaborationRoles.COACH;
  return CollaborationRoles.WORKOUT;
}

export function createParticipantSelector(
  deps: ParticipantSelectorDeps = {},
): ParticipantSelector {
  return new ParticipantSelector(deps);
}
