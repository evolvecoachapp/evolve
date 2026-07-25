import type { ContextContribution } from "../models/ContextContribution";
import type { ContextSlice } from "../models/ContextSlice";
import { ContextSourceKinds } from "../models/ContextSource";
import { contributionsByKind } from "../utils/ContextHelpers";
import { freezeSlice } from "../utils/FreezeContext";

/**
 * Deterministic recovery aggregation — facts only, no inference.
 */
export function aggregateRecovery(input: {
  readonly current: ContextSlice | null;
  readonly contributions: readonly ContextContribution[];
}): ContextSlice | null {
  const items = contributionsByKind(
    input.contributions,
    ContextSourceKinds.RECOVERY,
  );
  if (items.length === 0) return input.current;
  const last = items[items.length - 1]!;
  return freezeSlice(last.slice);
}
