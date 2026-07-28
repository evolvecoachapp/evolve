import { mapCoachQuickAction } from "../mappers";
import type { CoachQuickAction } from "../models/CoachQuickAction";
import {
  coachExperienceService,
  type CoachExperienceService,
} from "../services";

export interface LoadQuickActionsOptions {
  readonly service?: CoachExperienceService;
}

/** Loads coach quick actions via Application → ExperienceService. */
export async function loadQuickActions({
  service = coachExperienceService,
}: LoadQuickActionsOptions = {}): Promise<readonly CoachQuickAction[]> {
  const dto = await service.getQuickActions();
  return Object.freeze(dto.map(mapCoachQuickAction));
}
