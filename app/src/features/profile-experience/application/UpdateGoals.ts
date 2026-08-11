import { mapAthleteProfile } from "../mappers";
import type { AthleteProfile } from "../models";
import {
  ProfileExperienceError,
  profileExperienceService,
  type ProfileExperienceService,
  type AthleteGoalDto,
} from "../services";

export interface UpdateGoalsDeps {
  readonly service?: ProfileExperienceService;
  readonly athleteId?: string;
  readonly goals: readonly AthleteGoalDto[];
}

/**
 * Goals shown in Profile are projected from the athlete's goal-progress
 * runtime, not from Athlete Identity, so there's no identity field to write
 * this into here. Fails explicitly rather than pretending the edit saved.
 */
export async function updateGoals(deps: UpdateGoalsDeps): Promise<AthleteProfile> {
  if (deps.service) {
    const dto = await deps.service.updateGoals(deps.goals);
    return mapAthleteProfile(dto);
  }

  if (!deps.athleteId) {
    throw new Error("athleteId is required for runtime profile updates");
  }

  throw new ProfileExperienceError(
    "Goals aren't editable from Profile yet — manage goals from the Goals tab.",
  );
}
