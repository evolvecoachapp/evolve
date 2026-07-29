import { mapAthleteProfile } from "../mappers";
import type { AthleteProfile } from "../models";
import {
  profileExperienceService,
  type ProfileExperienceService,
  type AthleteGoalDto,
} from "../services";

export interface UpdateGoalsDeps {
  readonly service?: ProfileExperienceService;
  readonly goals: readonly AthleteGoalDto[];
}

export async function updateGoals(deps: UpdateGoalsDeps): Promise<AthleteProfile> {
  const service = deps.service ?? profileExperienceService;
  const dto = await service.updateGoals(deps.goals);
  return mapAthleteProfile(dto);
}
