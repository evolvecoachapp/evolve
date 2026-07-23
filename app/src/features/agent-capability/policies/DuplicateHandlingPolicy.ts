import type { CapabilityPolicy } from "../models/CapabilityPolicy";
import { CapabilityPolicyKinds } from "../models/CapabilityPolicy";
import type { CapabilityRegistration } from "../models/CapabilityRegistration";
import { freezeRegistration } from "../utils/FreezeCapabilityState";
import { sortRegistrationsDeterministic } from "../utils/sortHelpers";

/**
 * Duplicate handling modes for capability registration.
 */
export const DuplicateHandlingModes = {
  REJECT: "reject",
  IGNORE: "ignore",
  KEEP_FIRST: "keep_first",
} as const;

export type DuplicateHandlingMode =
  (typeof DuplicateHandlingModes)[keyof typeof DuplicateHandlingModes];

/**
 * Duplicate handling policy — no business logic.
 */
export interface DuplicateHandlingPolicy {
  readonly policy: CapabilityPolicy;
  readonly mode: DuplicateHandlingMode;
  apply(
    existing: readonly CapabilityRegistration[],
    candidate: CapabilityRegistration,
  ): {
    readonly accepted: boolean;
    readonly registrations: readonly CapabilityRegistration[];
    readonly reason: string | null;
  };
}

export class DefaultDuplicateHandlingPolicy implements DuplicateHandlingPolicy {
  readonly policy: CapabilityPolicy;
  readonly mode: DuplicateHandlingMode;

  constructor(mode: DuplicateHandlingMode = DuplicateHandlingModes.REJECT) {
    this.mode = mode;
    this.policy = Object.freeze({
      id: "policy:capability:duplicate-handling:default",
      kind: CapabilityPolicyKinds.DUPLICATE_HANDLING,
      name: "Default Duplicate Handling",
      description:
        "Rejects duplicate capabilityId registrations by default; ignore/keep_first optional.",
      enabled: true,
    });
  }

  apply(
    existing: readonly CapabilityRegistration[],
    candidate: CapabilityRegistration,
  ): {
    readonly accepted: boolean;
    readonly registrations: readonly CapabilityRegistration[];
    readonly reason: string | null;
  } {
    const duplicate = existing.find(
      (item) => item.capabilityId === candidate.capabilityId,
    );
    if (!duplicate) {
      return Object.freeze({
        accepted: true,
        registrations: Object.freeze([
          ...sortRegistrationsDeterministic(existing),
          freezeRegistration(candidate),
        ]),
        reason: null,
      });
    }

    if (this.mode === DuplicateHandlingModes.REJECT) {
      return Object.freeze({
        accepted: false,
        registrations: sortRegistrationsDeterministic(existing),
        reason: `Duplicate capabilityId: ${candidate.capabilityId}`,
      });
    }

    if (this.mode === DuplicateHandlingModes.IGNORE) {
      return Object.freeze({
        accepted: false,
        registrations: sortRegistrationsDeterministic(existing),
        reason: `Ignored duplicate capabilityId: ${candidate.capabilityId}`,
      });
    }

    // KEEP_FIRST — leave existing, do not accept candidate
    return Object.freeze({
      accepted: false,
      registrations: sortRegistrationsDeterministic(existing),
      reason: `Kept first registration for capabilityId: ${candidate.capabilityId}`,
    });
  }
}

export function createDuplicateHandlingPolicy(
  mode: DuplicateHandlingMode = DuplicateHandlingModes.REJECT,
): DuplicateHandlingPolicy {
  return new DefaultDuplicateHandlingPolicy(mode);
}
