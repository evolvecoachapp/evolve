/**
 * Lifecycle state for a rest runtime session.
 */
export type RestState =
  | "Idle"
  | "Running"
  | "Paused"
  | "Completed"
  | "Cancelled"
  | "Expired";

export const REST_STATES = Object.freeze([
  "Idle",
  "Running",
  "Paused",
  "Completed",
  "Cancelled",
  "Expired",
] as const satisfies readonly RestState[]);

export const TERMINAL_REST_STATES = Object.freeze([
  "Completed",
  "Cancelled",
  "Expired",
] as const satisfies readonly RestState[]);

export function isTerminalRestState(state: RestState): boolean {
  return (
    state === "Completed" || state === "Cancelled" || state === "Expired"
  );
}
