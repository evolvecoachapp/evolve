import { mapAthleteProfile } from "../mappers";
import {
  mapMeasurementUnitsDtoToBuildUnits,
} from "../mappers/mapProfileUpdateToIdentity";
import type { AthleteProfile } from "../models";
import {
  profileExperienceService,
  type ProfileExperienceService,
  type MeasurementUnitsDto,
} from "../services";
import {
  createProfileIdentityRequestId,
  updateAthleteIdentityFromProfile,
} from "./updateAthleteIdentityFromProfile";

export interface UpdateMeasurementUnitsDeps {
  readonly service?: ProfileExperienceService;
  readonly athleteId?: string;
  readonly units: MeasurementUnitsDto;
}

export async function updateMeasurementUnits(
  deps: UpdateMeasurementUnitsDeps,
): Promise<AthleteProfile> {
  if (deps.service) {
    const dto = await deps.service.updateMeasurementUnits(deps.units);
    return mapAthleteProfile(dto);
  }

  if (!deps.athleteId) {
    throw new Error("athleteId is required for runtime profile updates");
  }

  return updateAthleteIdentityFromProfile({
    athleteId: deps.athleteId,
    requestId: createProfileIdentityRequestId(deps.athleteId, "units"),
    update: {
      units: mapMeasurementUnitsDtoToBuildUnits(deps.units),
    },
  });
}
