import type { PlanRestoreTarget } from "./PlanRestoreTarget";

export interface PlanRestoreRequestMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<Record<string, string>>;
}

export const EMPTY_RESTORE_METADATA: PlanRestoreRequestMetadata = Object.freeze({
  tags: Object.freeze([] as string[]),
  attributes: Object.freeze({} as Record<string, string>),
});

/**
 * Immutable request to preview / apply a plan restore.
 */
export interface PlanRestoreRequest {
  readonly id: string;
  readonly athleteId: string;
  readonly conversationId: string | null;
  readonly sessionId: string | null;
  readonly message: string;
  readonly target: PlanRestoreTarget;
  readonly metadata: PlanRestoreRequestMetadata;
  readonly createdAt: string;
}
