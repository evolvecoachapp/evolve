import type { ContextContribution } from "../models/ContextContribution";
import type { ContextSlice } from "../models/ContextSlice";
import { ContextSourceKinds } from "../models/ContextSource";
import { contributionsByKind } from "../utils/ContextHelpers";
import { freezeSlice } from "../utils/FreezeContext";

/**
 * Deterministic conversation aggregation — facts only, no inference.
 */
export function aggregateConversation(input: {
  readonly current: ContextSlice | null;
  readonly contributions: readonly ContextContribution[];
}): ContextSlice | null {
  const items = contributionsByKind(
    input.contributions,
    ContextSourceKinds.CONVERSATION,
  );
  if (items.length === 0) return input.current;
  const last = items[items.length - 1]!;
  return freezeSlice(last.slice);
}
