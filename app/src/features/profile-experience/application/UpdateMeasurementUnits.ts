import { mapAthleteProfile } from "../mappers";
import type { AthleteProfile } from "../models";
import {
  profileExperienceService,
  type ProfileExperienceService,
  type MeasurementUnitsDto,
} from "../services";

export interface UpdateMeasurementUnitsDeps {
  readonly service?: ProfileExperienceService;
  readonly units: MeasurementUnitsDto;
}

export async function updateMeasurementUnits(
  deps: UpdateMeasurementUnitsDeps,
): Promise<AthleteProfile> {
  const service = deps.service ?? profileExperienceService;
  const dto = await service.updateMeasurementUnits(deps.units);
  return mapAthleteProfile(dto);
}
