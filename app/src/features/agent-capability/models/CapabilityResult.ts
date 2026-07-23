import type { CapabilityCollection } from "./CapabilityCollection";
import type { CapabilityError } from "./CapabilityError";
import type { CapabilityEvent } from "./CapabilityEvent";
import type { CapabilityMetadata } from "./CapabilityMetadata";
import type { CapabilityRegistration } from "./CapabilityRegistration";
import type { CapabilityResolution } from "./CapabilityResolution";
import type { CapabilitySnapshot } from "./CapabilitySnapshot";
import type { CapabilityValidation } from "./CapabilityValidation";

/**
 * Operation kinds returned by Agent Capability services.
 */
export const CapabilityOperationKinds = {
  REGISTER: "register",
  RESOLVE: "resolve",
  FIND: "find",
  QUERY: "query",
  SNAPSHOT: "snapshot",
  VALIDATE: "validate",
} as const;

export type CapabilityOperationKind =
  (typeof CapabilityOperationKinds)[keyof typeof CapabilityOperationKinds];

/**
 * Immutable primary output of Agent Capability operations.
 */
export interface CapabilityResult {
  readonly id: string;
  readonly operation: CapabilityOperationKind;
  readonly success: boolean;
  readonly message: string | null;
  readonly registration: CapabilityRegistration | null;
  readonly resolution: CapabilityResolution | null;
  readonly collection: CapabilityCollection | null;
  readonly snapshot: CapabilitySnapshot | null;
  readonly exists: boolean | null;
  readonly ownerAgentId: string | null;
  readonly validation: CapabilityValidation;
  readonly error: CapabilityError | null;
  readonly events: readonly CapabilityEvent[];
  readonly metadata: CapabilityMetadata;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly frozenAt: string;
}
