import { getDashboardRestoreStateHolder } from "../DashboardRestoreStateHolder";
import type { DashboardRestoreStatus } from "../DashboardRestoreStatus";

/**
 * Current dashboard restore lifecycle status.
 */
export function getDashboardRestoreStatus(): DashboardRestoreStatus {
  return getDashboardRestoreStateHolder().status;
}
