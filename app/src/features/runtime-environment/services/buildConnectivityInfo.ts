import type {
  ConnectivityInfo,
  ConnectivityStatus,
} from "../models/ConnectivityInfo";

export interface BuildConnectivityInfoInput {
  readonly status?: ConnectivityStatus;
}

/**
 * Builds an immutable ConnectivityInfo model (no network requests).
 */
export function buildConnectivityInfo(
  input: BuildConnectivityInfoInput = {},
): ConnectivityInfo {
  return Object.freeze({
    status: input.status ?? "unknown",
  });
}
