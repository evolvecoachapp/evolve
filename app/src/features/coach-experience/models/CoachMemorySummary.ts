/** Immutable coach memory summary — presentation read model. */
export interface CoachMemorySummary {
  readonly id: string;
  readonly headline: string;
  readonly summary: string;
  readonly focusAreas: readonly string[];
  readonly lastUpdatedAt: string;
  readonly entryCount: number;
}

export function createCoachMemorySummary(input: {
  readonly id: string;
  readonly headline: string;
  readonly summary: string;
  readonly focusAreas?: readonly string[];
  readonly lastUpdatedAt: string;
  readonly entryCount?: number;
}): CoachMemorySummary {
  return Object.freeze({
    id: input.id,
    headline: input.headline,
    summary: input.summary,
    focusAreas: Object.freeze([...(input.focusAreas ?? [])]),
    lastUpdatedAt: input.lastUpdatedAt,
    entryCount: input.entryCount ?? 0,
  });
}
