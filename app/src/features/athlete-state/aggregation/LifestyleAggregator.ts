import type { LifestyleState } from "../models/LifestyleState";
import type { SpecialistContribution } from "../models/SpecialistContribution";
import { freezeLifestyle } from "../utils/FreezeAthleteState";
import { mergeUniqueStrings } from "../utils/StateHelpers";

/**
 * Lifestyle aggregation — copies notes from contributions only.
 */
export function aggregateLifestyle(input: {
  readonly current: LifestyleState;
  readonly contributions: readonly SpecialistContribution[];
}): LifestyleState {
  const notes = mergeUniqueStrings(
    input.current.notes,
    ...input.contributions.map((c) => c.notes),
  );
  return freezeLifestyle({
    ...input.current,
    notes,
  });
}
