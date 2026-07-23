import type { CollaborationParticipant } from "../models/CollaborationParticipant";
import type { CollaborationPolicy } from "../models/CollaborationPolicy";
import { CollaborationPolicyKinds } from "../models/CollaborationPolicy";
import {
  CollaborationRoles,
  SPECIALIST_COLLABORATION_ROLES,
  type CollaborationRole,
} from "../models/CollaborationRole";
import { sortParticipantsDeterministic } from "../utils/sortHelpers";

/**
 * Default specialist execution order (deterministic).
 * workout → nutrition → recovery
 */
export const DEFAULT_ROLE_ORDER: readonly CollaborationRole[] = Object.freeze([
  CollaborationRoles.WORKOUT,
  CollaborationRoles.NUTRITION,
  CollaborationRoles.RECOVERY,
]);

/**
 * Execution ordering policy — sorts participants by role order then agentId.
 * Contains NO business logic.
 */
export interface ExecutionOrderingPolicy {
  readonly policy: CollaborationPolicy;
  readonly roleOrder: readonly CollaborationRole[];
  orderParticipants(
    participants: readonly CollaborationParticipant[],
  ): readonly CollaborationParticipant[];
}

export class DefaultExecutionOrderingPolicy implements ExecutionOrderingPolicy {
  readonly policy: CollaborationPolicy = Object.freeze({
    id: "policy:collaboration:execution-ordering:default",
    kind: CollaborationPolicyKinds.EXECUTION_ORDERING,
    name: "Default Execution Ordering",
    description:
      "Orders participants by specialist role order (workout → nutrition → recovery), then agentId.",
    enabled: true,
  });

  constructor(
    readonly roleOrder: readonly CollaborationRole[] = DEFAULT_ROLE_ORDER,
  ) {}

  orderParticipants(
    participants: readonly CollaborationParticipant[],
  ): readonly CollaborationParticipant[] {
    const rank = new Map(
      this.roleOrder.map((role, index) => [role, index] as const),
    );
    const sorted = [...participants].sort((a, b) => {
      const ra = rank.get(a.role) ?? Number.MAX_SAFE_INTEGER;
      const rb = rank.get(b.role) ?? Number.MAX_SAFE_INTEGER;
      if (ra !== rb) return ra - rb;
      return a.agentId.localeCompare(b.agentId);
    });
    return Object.freeze(
      sorted.map((p, index) =>
        Object.freeze({
          ...p,
          order: index + 1,
        }),
      ),
    );
  }
}

export function createExecutionOrderingPolicy(
  roleOrder?: readonly CollaborationRole[],
): ExecutionOrderingPolicy {
  return new DefaultExecutionOrderingPolicy(
    roleOrder ?? DEFAULT_ROLE_ORDER,
  );
}

export function isSpecialistRole(role: CollaborationRole): boolean {
  return (SPECIALIST_COLLABORATION_ROLES as readonly string[]).includes(role);
}

export { sortParticipantsDeterministic };
