import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
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

  const dto = mapWorkspaceRecoveryToExperienceDto({
    recovery: workspace.recovery,
    day,
    sleepHours,
    sleepQuality,
    sleepLogged,
    readinessScore,
    assessedScore,
  });

  return mapRecoveryDashboard(dto);
}
