import type { ContextPackage } from "../models/ContextPackage";
import type { ContextSnapshot } from "../models/ContextSnapshot";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import { EMPTY_CONTEXT_METADATA } from "../models/ContextMetadata";
import { buildContextSummary } from "./SummaryBuilder";
import { freezePackage } from "../utils/FreezeContext";
import { buildDecisionEngineContext } from "./DecisionEngineContextBuilder";

export function buildContextPackage(input: {
  readonly id: string;
  readonly context: UnifiedCoachingContext;
  readonly snapshot?: ContextSnapshot | null;
  readonly createdAt: string;
}): ContextPackage {
  const summary = buildContextSummary({
    context: input.context,
    createdAt: input.createdAt,
  });
  return freezePackage({
    id: input.id,
    context: input.context,
    snapshot: input.snapshot ?? null,
    summary,
    decisionEngineContext: buildDecisionEngineContext({
      id: `decision-ctx:${input.context.id}`,
      context: input.context,
      summary,
      createdAt: input.createdAt,
    }),
    metadata: EMPTY_CONTEXT_METADATA,
    createdAt: input.createdAt,
  });
}
