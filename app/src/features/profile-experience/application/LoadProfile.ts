import { mapAthleteProfile } from "../mappers";
import type { AthleteProfile } from "../models";
import { profileExperienceService, type ProfileExperienceService } from "../services";

export interface LoadProfileDeps {
  readonly service?: ProfileExperienceService;
}

export async function loadProfile(deps: LoadProfileDeps = {}): Promise<AthleteProfile> {
  const service = deps.service ?? profileExperienceService;
  const dto = await service.getProfile();
  return mapAthleteProfile(dto);
}
