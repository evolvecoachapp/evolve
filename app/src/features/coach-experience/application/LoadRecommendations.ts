import { mapCoachRecommendation } from "../mappers";
import type { CoachRecommendation } from "../models/CoachRecommendation";
import {
  coachExperienceService,
  type CoachExperienceService,
} from "../services";

export interface LoadRecommendationsOptions {
  readonly service?: CoachExperienceService;
}

/** Loads coach recommendations via Application → ExperienceService. */
export async function loadRecommendations({
  service = coachExperienceService,
}: LoadRecommendationsOptions = {}): Promise<readonly CoachRecommendation[]> {
  const dto = await service.getRecommendations();
  return Object.freeze(dto.map(mapCoachRecommendation));
}
