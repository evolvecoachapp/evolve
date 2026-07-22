import type { InsightCollection } from "./InsightCollection";
import type { InsightSnapshot } from "./InsightSnapshot";
import type { InsightSummary } from "./InsightSummary";

/**
 * Engine output: frozen snapshot + collection + summary + soft validation issues.
 */
export interface InsightEngineResult {
  readonly snapshot: InsightSnapshot;
  readonly collection: InsightCollection;
  readonly summary: InsightSummary;
  readonly validationIssues: readonly string[];
}
