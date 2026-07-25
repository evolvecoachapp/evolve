import { formatContextVersion, type ContextVersion } from "../models/ContextVersion";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";

export function formatContextHeadline(
  context: UnifiedCoachingContext,
): string {
  const sources = context.sources.map((s) => s.kind).join(", ");
  return `Unified context for ${context.athleteId} [${sources || "no sources"}]`;
}

export function formatVersionLabel(version: ContextVersion): string {
  return formatContextVersion(version);
}
