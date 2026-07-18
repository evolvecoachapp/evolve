import type { ProgressionModel } from "../enums/ProgressionModel";
import type { WeightUnit } from "../enums/WeightUnit";
import type { ProgressionSchemeId } from "../types/ids";

/**
 * Describes how load, volume, or intensity should evolve over time for a
 * program or a single exercise. Holds only the rule's parameters —
 * applying the rule to real training data is deliberately out of scope
 * for this foundation and belongs to a future service layer.
 */
export interface ProgressionScheme {
  readonly id: ProgressionSchemeId;
  readonly model: ProgressionModel;
  readonly incrementValue: number | null;
  readonly incrementUnit: WeightUnit | null;
  readonly cycleLengthWeeks: number | null;
  readonly deloadFrequencyWeeks: number | null;
  readonly description: string | null;
}
