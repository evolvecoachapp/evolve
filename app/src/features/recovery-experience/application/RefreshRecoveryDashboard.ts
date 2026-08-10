import { loadRecoveryDashboard } from "./LoadRecoveryDashboard";
import type { RecoveryDay } from "../models";
import type { RecoveryExperienceService } from "../services";

export interface RefreshRecoveryDashboardDeps {
  readonly service?: RecoveryExperienceService;
  readonly day?: RecoveryDay;
}

export async function refreshRecoveryDashboard(
  deps: RefreshRecoveryDashboardDeps = {},
) {
  return loadRecoveryDashboard(deps);
}
