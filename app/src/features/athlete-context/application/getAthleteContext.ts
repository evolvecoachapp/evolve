import {
  athleteContextRepository,
  type AthleteContextRepository,
} from "../repository";
import type { AthleteContextSnapshot } from "../models/AthleteContextSnapshot";

export interface GetAthleteContextOptions {
  readonly repository?: AthleteContextRepository;
  readonly referenceDate?: Date;
}

/**
 * Loads an immutable athlete context snapshot via the repository layer.
 */
export async function getAthleteContext({
  repository = athleteContextRepository,
  referenceDate,
}: GetAthleteContextOptions = {}): Promise<AthleteContextSnapshot> {
  return repository.getSnapshot(referenceDate);
}
