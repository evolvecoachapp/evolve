import {
  EQUIPMENT_ITEMS,
  type EquipmentProfile,
} from "../models/EquipmentProfile";
import type { AthleteContextValidationIssue } from "../models/AthleteContextValidationResult";

/**
 * Validate equipment inventory.
 *
 * Returns structured issues; never throws for validation failures.
 */
export function validateEquipment(
  equipment: EquipmentProfile,
): readonly AthleteContextValidationIssue[] {
  const issues: AthleteContextValidationIssue[] = [];

  for (let index = 0; index < equipment.available.length; index += 1) {
    const item = equipment.available[index]!;
    if (!(EQUIPMENT_ITEMS as readonly string[]).includes(item)) {
      issues.push(
        Object.freeze({
          field: `equipment.available[${index}]`,
          code: "invalid_equipment_item" as const,
        }),
      );
    }
  }

  return Object.freeze(issues);
}
