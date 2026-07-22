import type { Insight } from "../models/Insight";
import type { InsightCollection } from "../models/InsightCollection";
import type { InsightType } from "../models/InsightType";
import { InsightTypes } from "../models/InsightType";

const KNOWN_TYPES = new Set<string>(Object.values(InsightTypes));

/**
 * Validate insight field consistency (ids, titles, statements, types).
 */
export function validateInsightConsistency(
  insights: readonly Insight[],
): readonly string[] {
  const issues: string[] = [];

  for (const insight of insights) {
    if (!insight.id) {
      issues.push("insight_missing_id");
    }
    if (!insight.title.trim()) {
      issues.push(`insight_empty_title:${insight.id}`);
    }
    if (!insight.statement.trim()) {
      issues.push(`insight_empty_statement:${insight.id}`);
    }
    if (!KNOWN_TYPES.has(insight.type)) {
      issues.push(`insight_unknown_type:${insight.id}`);
    }
    if (!insight.reason.code) {
      issues.push(`insight_missing_reason_code:${insight.id}`);
    }
    if (!insight.generatedAt || !insight.frozenAt) {
      issues.push(`insight_missing_timestamps:${insight.id}`);
    }
  }

  return issues;
}

/**
 * Validate collection counts match insight list.
 */
export function validateCollectionConsistency(
  collection: InsightCollection,
): readonly string[] {
  const issues: string[] = [];

  if (collection.count !== collection.insights.length) {
    issues.push("collection_count_mismatch");
  }

  const computed: Partial<Record<InsightType, number>> = {};
  for (const insight of collection.insights) {
    computed[insight.type] = (computed[insight.type] ?? 0) + 1;
  }

  for (const [type, count] of Object.entries(collection.countsByType)) {
    if ((computed[type as InsightType] ?? 0) !== count) {
      issues.push(`collection_type_count_mismatch:${type}`);
    }
  }

  return issues;
}
