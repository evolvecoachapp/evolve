/**
 * Immutable capability error (registry / resolution integrity only).
 */
export interface CapabilityError {
  readonly code: string;
  readonly message: string;
  readonly capabilityId: string | null;
  readonly agentId: string | null;
  readonly occurredAt: string;
}

export function createCapabilityError(input: {
  readonly code: string;
  readonly message: string;
  readonly capabilityId?: string | null;
  readonly agentId?: string | null;
  readonly occurredAt: string;
}): CapabilityError {
  return Object.freeze({
    code: input.code,
    message: input.message,
    capabilityId: input.capabilityId ?? null,
    agentId: input.agentId ?? null,
    occurredAt: input.occurredAt,
  });
}
