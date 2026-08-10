export type HydrationErrorCode =
  | "hydration_already_started"
  | "bootstrap_not_ready"
  | "repository_contract_failed"
  | "invalid_hydration_state";

export class HydrationError extends Error {
  constructor(
    message: string,
    readonly code: HydrationErrorCode,
  ) {
    super(message);
    this.name = "HydrationError";
  }
}
