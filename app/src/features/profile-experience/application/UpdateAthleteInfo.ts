import { ApiError } from "../../../api/client";
import { updateCurrentUser } from "../../../api/users";
import type { UserUpdate } from "../../../types/api";
import { toNumberOrNull } from "../../shared/utils/userAdapters";
import { mapAthleteProfile } from "../mappers";
import { createAthleteProfile, type AthleteProfile } from "../models";
import {
  ProfileExperienceError,
  type AthleteInfoUpdateDto,
  type ProfileExperienceService,
} from "../services";
import { readHydratedProfile } from "../services/readHydratedProfile";

export interface UpdateAthleteInfoDeps {
  readonly service?: ProfileExperienceService;
  readonly athleteId?: string;
  readonly input: AthleteInfoUpdateDto;
}

/**
 * Height/weight have no field on Athlete Identity (see
 * `mapAthleteIdentityToProfile` — both are always `null` there), so there is
 * no local Runtime Session / SQLite value to preserve or fall back to for
 * them. The backend is the sole source of truth: on success the response is
 * merged into the currently-hydrated profile in memory; on failure the error
 * propagates so the caller never reports a save that didn't happen.
 */
async function updateAthleteInfoThroughBackend(
  athleteId: string,
  input: AthleteInfoUpdateDto,
): Promise<AthleteProfile> {
  const current = readHydratedProfile(athleteId);
  if (!current) {
    throw new ProfileExperienceError("Athlete identity unavailable.");
  }

  const data: UserUpdate = {};
  if (input.heightCm !== undefined && input.heightCm !== null) {
    data.height_cm = input.heightCm;
  }
  if (input.weightKg !== undefined && input.weightKg !== null) {
    data.current_weight_kg = input.weightKg;
  }

  try {
    const user = await updateCurrentUser(data);
    return createAthleteProfile({
      ...current,
      heightCm: toNumberOrNull(user.height_cm) ?? current.heightCm,
      weightKg: toNumberOrNull(user.current_weight_kg) ?? current.weightKg,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw new ProfileExperienceError(error.message, "backend");
    }
    throw new ProfileExperienceError(
      error instanceof Error ? error.message : "Failed to update your profile.",
      "backend",
    );
  }
}

export async function updateAthleteInfo(deps: UpdateAthleteInfoDeps): Promise<AthleteProfile> {
  if (deps.service) {
    const dto = await deps.service.updateAthleteInfo(deps.input);
    return mapAthleteProfile(dto);
  }

  if (!deps.athleteId) {
    throw new Error("athleteId is required for runtime profile updates");
  }

  return updateAthleteInfoThroughBackend(deps.athleteId, deps.input);
}
