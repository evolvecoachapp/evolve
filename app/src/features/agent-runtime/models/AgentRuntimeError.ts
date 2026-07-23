/**
 * Immutable runtime error envelope (no stack traces / provider details).
 */
export interface AgentRuntimeError {
  readonly code: string;
  readonly message: string;
  readonly agentId: string | null;
  readonly details: Readonly<
    Record<string, string | number | boolean | null>
  >;
  readonly occurredAt: string;
}

export class AgentRuntimeException extends Error {
  readonly code: string;
  readonly agentId: string | null;
  readonly details: Readonly<
    Record<string, string | number | boolean | null>
  >;

  constructor(
    code: string,
    message: string,
    agentId: string | null = null,
    details: Readonly<
      Record<string, string | number | boolean | null>
    > = Object.freeze({}),
  ) {
    super(message);
    this.name = "AgentRuntimeException";
    this.code = code;
    this.agentId = agentId;
    this.details = details;
  }
}

export function createRuntimeError(options: {
  readonly code: string;
  readonly message: string;
  readonly agentId?: string | null;
  readonly details?: Readonly<
    Record<string, string | number | boolean | null>
  >;
  readonly occurredAt: string;
}): AgentRuntimeError {
  return Object.freeze({
    code: options.code,
    message: options.message,
    agentId: options.agentId ?? null,
    details: Object.freeze({ ...(options.details ?? {}) }),
    occurredAt: options.occurredAt,
  });
}
