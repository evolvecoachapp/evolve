/**
 * Immutable connectivity model for Runtime Environment (Sprint 29.2).
 *
 * Representation only — no network requests.
 */
export type ConnectivityStatus = "online" | "offline" | "metered" | "unknown";

export interface ConnectivityInfo {
  readonly status: ConnectivityStatus;
}
