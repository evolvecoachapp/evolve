import { InMemoryAthleteContextRepository } from "./InMemoryAthleteContextRepository";
import type { AthleteContextRepository } from "./AthleteContextRepository";

export type { AthleteContextRepository } from "./AthleteContextRepository";
export { InMemoryAthleteContextRepository } from "./InMemoryAthleteContextRepository";

/** Default athlete context repository (in-memory; no AsyncStorage yet). */
export const athleteContextRepository: AthleteContextRepository =
  new InMemoryAthleteContextRepository();
