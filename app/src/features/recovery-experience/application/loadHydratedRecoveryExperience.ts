import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import { readPersistedRecoveryDayState } from "../../../runtime/domain-persistence/application/persistRecoveryRuntimeMutation";
import { mapRecoveryDashboard } from "../mappers";
import { mapWorkspaceRecoveryToExperienceDto } from "../mappers/mapWorkspaceRecoveryToExperienceDto";
import {
  createRecoveryDay,
  type RecoveryDashboard,
  type RecoveryDay,
} from "../models";

export interface LoadHydratedRecoveryExperienceOptions {
  readonly athleteId: string;
  readonly day?: RecoveryDay;
  readonly sleepHours?: number;
  readonly sleepQuality?: number;
  readonly sleepLogged?: boolean;
  readonly readinessScore?: number;
  readonly assessedScore?: number;
}

const DEFAULT_DAY = createRecoveryDay({
  id: "today",
  isoDate: new Date().toISOString().slice(0, 10),
  label: "Today",
  shortLabel: "Today",
  relativeLabel: "Today",
  isToday: true,
});

/**
 * Loads today's recovery experience from hydrated Unified Workspace.
 */
export async function loadHydratedRecoveryExperience({
  athleteId,
  day = DEFAULT_DAY,
  sleepHours,
  sleepQuality,
  sleepLogged,
  readinessScore,
  assessedScore,
}: LoadHydratedRecoveryExperienceOptions): Promise<RecoveryDashboard | null> {
  const root = getCompositionRoot();
  const workspace = root.resolve("UnifiedWorkspaceService").getWorkspace(athleteId);
  if (!workspace) {
    return null;
  }

  const persistedDay = readPersistedRecoveryDayState(athleteId, day.isoDate);
  const dto = mapWorkspaceRecoveryToExperienceDto({
    recovery: workspace.recovery,
    day,
    sleepHours: sleepHours ?? persistedDay?.sleepHours,
    sleepQuality: sleepQuality ?? persistedDay?.sleepQuality,
    sleepLogged: sleepLogged ?? persistedDay?.sleepLogged,
    readinessScore: readinessScore ?? persistedDay?.readinessScore,
    assessedScore: assessedScore ?? persistedDay?.assessedScore,
  });

  return mapRecoveryDashboard(dto);
}
