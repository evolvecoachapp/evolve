export type RuntimeObserverErrorCode =
  | "observe_already_started"
  | "bootstrap_not_ready"
  | "invalid_observer_state";

export class RuntimeObserverError extends Error {
  constructor(
    message: string,
    readonly code: RuntimeObserverErrorCode,
  ) {
    super(message);
    this.name = "RuntimeObserverError";
  }
}
