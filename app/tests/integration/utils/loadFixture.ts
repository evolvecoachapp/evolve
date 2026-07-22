import {
  ATHLETE_FIXTURES,
  getAthleteFixture,
  listAthleteFixtures,
  type AthleteFixtureName,
} from "../fixtures";
import type { AthleteFixture } from "../shared/types";

/**
 * Load a named immutable athlete fixture.
 */
export function loadAthleteFixture(name: AthleteFixtureName): AthleteFixture {
  return getAthleteFixture(name);
}

/**
 * Load fixture by registry key string.
 */
export function loadAthleteFixtureByKey(key: string): AthleteFixture {
  const match = listAthleteFixtures().find((fixture) => fixture.key === key);
  if (!match) {
    throw new Error(`Unknown athlete fixture key: ${key}`);
  }
  return match;
}

export function loadAllAthleteFixtures(): readonly AthleteFixture[] {
  return listAthleteFixtures();
}

export { ATHLETE_FIXTURES };
