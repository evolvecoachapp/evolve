import { mapAthleteProfile } from "../mappers";
import type { AthleteProfile } from "../models";
import {
  profileExperienceService,
  type ProfileExperienceService,
  type AthleteGoalDto,
} from "../services";
import { readRuntimeProfile } from "./updateAthleteIdentityFromProfile";

export interface UpdateGoalsDeps {
  readonly service?: ProfileExperienceService;
  readonly athleteId?: string;
  readonly goals: readonly AthleteGoalDto[];
}

export async function updateGoals(deps: UpdateGoalsDeps): Promise<AthleteProfile> {
  if (deps.service) {
    const dto = await deps.service.updateGoals(deps.goals);
    return mapAthleteProfile(dto);
  }

  if (!deps.athleteId) {
    throw new Error("athleteId is required for runtime profile updates");
  }

  return readRuntimeProfile(deps.athleteId);
}
