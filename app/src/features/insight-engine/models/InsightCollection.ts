import type { Insight } from "./Insight";
import type { InsightType } from "./InsightType";

/**
 * Frozen ordered collection of insights with counts by type.
 */
export interface InsightCollection {
  readonly insights: readonly Insight[];
  readonly count: number;
  readonly countsByType: Readonly<Partial<Record<InsightType, number>>>;
}
