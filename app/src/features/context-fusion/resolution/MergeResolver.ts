import {
  ContextMergeStrategies,
  type ContextMerge,
} from "../models/ContextMerge";
import { EMPTY_CONTEXT_METADATA } from "../models/ContextMetadata";
import type { ContextResolution } from "../models/ContextResolution";
import type { ContextSourceKind } from "../models/ContextSource";
import { freezeMerge } from "../utils/FreezeContext";

export function resolveMerge(input: {
  readonly id: string;
  readonly sourceKinds: readonly ContextSourceKind[];
  readonly resolutions: readonly ContextResolution[];
  readonly at: string;
  readonly notes?: readonly string[];
}): ContextMerge {
  return freezeMerge({
    id: input.id,
    strategy: ContextMergeStrategies.PRIORITY_OVERLAY,
    sourceKinds: Object.freeze([...input.sourceKinds]),
    resolutions: Object.freeze([...input.resolutions]),
    notes: Object.freeze([...(input.notes ?? [])]),
    metadata: EMPTY_CONTEXT_METADATA,
    mergedAt: input.at,
  });
}
