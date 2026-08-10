import { getHydrationStateHolder } from "../HydrationStateHolder";
import type { HydrationStatus } from "../HydrationStatus";

/**
 * Current repository hydration lifecycle status.
 */
export function getHydrationStatus(): HydrationStatus {
  return getHydrationStateHolder().status;
}
