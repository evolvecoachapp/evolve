export type RuntimeBootstrapErrorCode =
  | "bootstrap_already_started"
  | "bootstrap_not_ready"
  | "composition_root_failed"
  | "invalid_bootstrap_state";

export class RuntimeBootstrapError extends Error {
  constructor(
    message: string,
    readonly code: RuntimeBootstrapErrorCode,
  ) {
    super(message);
    this.name = "RuntimeBootstrapError";
  }
}
