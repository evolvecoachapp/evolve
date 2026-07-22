import type { Insight } from "../models/Insight";

/**
 * Detect duplicate insight ids and duplicate type+category+statement triples.
 */
export function validateDuplicates(
  insights: readonly Insight[],
): readonly string[] {
  const issues: string[] = [];
  const seenIds = new Set<string>();
  const seenSignatures = new Set<string>();

  for (const insight of insights) {
    if (seenIds.has(insight.id)) {
      issues.push(`duplicate_insight_id:${insight.id}`);
    } else {
      seenIds.add(insight.id);
    }

    const signature = `${insight.type}|${insight.category}|${insight.statement}`;
    if (seenSignatures.has(signature)) {
      issues.push(`duplicate_insight_signature:${insight.id}`);
    } else {
      seenSignatures.add(signature);
    }
  }

  return issues;
}
