import type { PersonalRecordType } from "./PersonalRecordType";

/**
 * Query against an injected historical reference.
 * History storage is NOT implemented — callers provide the provider.
 */
export interface PersonalRecordBaselineQuery {
  readonly type: PersonalRecordType;
  readonly exerciseId?: string | null;
  readonly athleteId?: string | null;
}

/**
 * Injected comparison source for Personal Record detection.
 * Implementations live outside this engine (no history in this sprint).
 */
export interface PersonalRecordBaselineProvider {
  getBaseline(query: PersonalRecordBaselineQuery): number | null;
}

/**
 * Simple in-memory baseline map for tests and local evaluation.
 * Not a history store — values are supplied by the caller.
 */
export class MapPersonalRecordBaselineProvider
  implements PersonalRecordBaselineProvider
{
  constructor(
    private readonly baselines: Readonly<
      Partial<Record<PersonalRecordType, number>>
    > = {},
    private readonly exerciseVolumes: Readonly<Record<string, number>> = {},
  ) {}

  getBaseline(query: PersonalRecordBaselineQuery): number | null {
    if (
      query.type === "highest_exercise_volume" &&
      query.exerciseId != null &&
      query.exerciseId !== ""
    ) {
      const value = this.exerciseVolumes[query.exerciseId];
      return value === undefined ? null : value;
    }
    const value = this.baselines[query.type];
    return value === undefined ? null : value;
  }
}
