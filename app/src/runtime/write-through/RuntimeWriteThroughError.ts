export type RuntimeWriteThroughErrorCode =
  | "persist_already_started"
  | "bootstrap_not_ready"
  | "repository_contract_failed"
  | "invalid_persist_state"
  | "stale_mutation_sequence";

export class RuntimeWriteThroughError extends Error {
  constructor(
    message: string,
    readonly code: RuntimeWriteThroughErrorCode,
  ) {
    super(message);
    this.name = "RuntimeWriteThroughError";
  }
}
