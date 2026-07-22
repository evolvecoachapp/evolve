import type { InsightCategory } from "./InsightCategory";
import type { InsightEvidence } from "./InsightEvidence";
import type { InsightMetadata } from "./InsightMetadata";
import type { InsightPriority } from "./InsightPriority";
import type { InsightReason } from "./InsightReason";
import type { InsightSeverity } from "./InsightSeverity";
import type { InsightStatus } from "./InsightStatus";
import type { InsightType } from "./InsightType";

/**
 * Immutable deterministic domain insight.
 * Not AI-generated. Not a recommendation. Not conversational.
 */
export interface Insight {
  readonly id: string;
  readonly type: InsightType;
  readonly category: InsightCategory;
  readonly severity: InsightSeverity;
  readonly priority: InsightPriority;
  readonly status: InsightStatus;
  readonly title: string;
  readonly statement: string;
  readonly reason: InsightReason;
  readonly evidence: InsightEvidence;
  readonly metadata: InsightMetadata;
  readonly generatedAt: string;
  readonly frozenAt: string;
}
