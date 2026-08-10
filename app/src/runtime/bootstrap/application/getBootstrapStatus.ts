import { getBootstrapStateHolder } from "../BootstrapStateHolder";
import type { BootstrapStatus } from "../BootstrapStatus";

/**
 * Returns the current Runtime Bootstrap lifecycle status.
 */
export function getBootstrapStatus(): BootstrapStatus {
  return getBootstrapStateHolder().status;
}
