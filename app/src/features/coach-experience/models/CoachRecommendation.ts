export const CoachRecommendationDomains = {
  WORKOUT: "workout",
  RECOVERY: "recovery",
  NUTRITION: "nutrition",
  TODAY: "today",
  GENERAL: "general",
} as const;

export type CoachRecommendationDomain =
  (typeof CoachRecommendationDomains)[keyof typeof CoachRecommendationDomains];

/** Immutable coach recommendation — presentation read model. */
export interface CoachRecommendation {
  readonly id: string;
  readonly domain: CoachRecommendationDomain;
  readonly title: string;
  readonly body: string;
  readonly actionLabel: string;
  readonly destination: string;
  readonly priority: number;
  readonly confidence: number;
}

export function createCoachRecommendation(input: {
  readonly id: string;
  readonly domain: CoachRecommendationDomain;
  readonly title: string;
  readonly body: string;
  readonly actionLabel?: string;
  readonly destination?: string;
  readonly priority?: number;
  readonly confidence?: number;
}): CoachRecommendation {
  return Object.freeze({
    id: input.id,
    domain: input.domain,
    title: input.title,
    body: input.body,
    actionLabel: input.actionLabel ?? "View details",
    destination: input.destination ?? "/(app)/(tabs)/coach",
    priority: input.priority ?? 0,
    confidence: input.confidence ?? 0.8,
  });
}
