import type { NutritionCapability } from "../models/NutritionCapability";
import { ALL_NUTRITION_CAPABILITIES } from "../models/NutritionCapability";
import type { NutritionIntent } from "../models/NutritionIntent";
import type {
  NutritionValidation,
  NutritionValidationIssue,
} from "../models/NutritionValidation";
import { NutritionValidationCodes } from "../models/NutritionValidation";
import { NutritionCapabilitySelector } from "../selectors/NutritionCapabilitySelector";
import { freezeValidation } from "../utils/FreezeNutritionState";

/**
 * Validates that selected capabilities are known and compatible with intent.
 */
export function validateCapabilityCompatibility(input: {
  readonly intent: NutritionIntent;
  readonly capabilities?: readonly NutritionCapability[];
  readonly selector?: NutritionCapabilitySelector;
}): NutritionValidation {
  const selector = input.selector ?? new NutritionCapabilitySelector();
  const expected = selector.select(input.intent);
  const capabilities = input.capabilities ?? expected;
  const issues: NutritionValidationIssue[] = [];
  const known = new Set<string>(ALL_NUTRITION_CAPABILITIES);
  const expectedSet = new Set(expected);

  for (const capability of capabilities) {
    if (!known.has(capability)) {
      issues.push(
        Object.freeze({
          code: NutritionValidationCodes.INCOMPATIBLE,
          message: `Unknown nutrition capability: ${capability}`,
          path: "capability",
        }),
      );
    } else if (!expectedSet.has(capability)) {
      issues.push(
        Object.freeze({
          code: NutritionValidationCodes.INCOMPATIBLE,
          message: `Capability ${capability} is not compatible with intent ${input.intent}.`,
          path: "capability",
        }),
      );
    }
  }

  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
