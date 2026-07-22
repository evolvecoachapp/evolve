import type { InsightCollection } from "./InsightCollection";
import type { InsightContext } from "./InsightContext";
import type { InsightSummary } from "./InsightSummary";

/**
 * Immutable insight snapshot — frozen aggregation artifact.
 * No persistence. No recommendations. Deterministic domain facts only.
 */
export interface InsightSnapshot {
  readonly id: string;
  readonly context: InsightContext;
  readonly collection: InsightCollection;
  readonly summary: InsightSummary;
  readonly frozenAt: string;
}
