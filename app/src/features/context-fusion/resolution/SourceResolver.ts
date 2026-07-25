import type { ContextContribution } from "../models/ContextContribution";
import { EMPTY_CONTEXT_METADATA } from "../models/ContextMetadata";
import type { ContextSource } from "../models/ContextSource";
import { freezeSource } from "../utils/FreezeContext";

export function resolveSources(input: {
  readonly contributions: readonly ContextContribution[];
  readonly at: string;
}): readonly ContextSource[] {
  const byKind = new Map<string, ContextSource>();
  for (const c of input.contributions) {
    byKind.set(
      c.sourceKind,
      freezeSource({
        id: c.id,
        kind: c.sourceKind,
        label: c.slice.label,
        referenceId: c.slice.referenceId,
        version: c.version,
        available: true,
        notes: Object.freeze([...c.notes]),
        metadata: c.metadata ?? EMPTY_CONTEXT_METADATA,
        contributedAt: c.contributedAt || input.at,
      }),
    );
  }
  return Object.freeze([...byKind.values()]);
}
