import { mapRecoveryDashboard } from "../mappers";
import { createRecoveryDay, type RecoveryDashboard, type RecoveryDay } from "../models";
import {
  recoveryExperienceService,
  type RecoveryExperienceService,
} from "../services";

export interface LoadRecoveryDashboardDeps {
  readonly service?: RecoveryExperienceService;
  readonly day?: RecoveryDay;
}

const TODAY = createRecoveryDay({
  id: "today",
  isoDate: new Date().toISOString().slice(0, 10),
  label: "Today",
  shortLabel: "Today",
  relativeLabel: "Today",
  isToday: true,
});

export async function loadRecoveryDashboard(
  deps: LoadRecoveryDashboardDeps = {},
): Promise<RecoveryDashboard> {
  const service = deps.service ?? recoveryExperienceService;
  const dto = await service.getDashboard(deps.day ?? TODAY);
  return mapRecoveryDashboard(dto);
}
