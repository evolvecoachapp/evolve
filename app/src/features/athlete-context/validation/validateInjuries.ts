import type { AthleteContextValidationIssue } from "../models/AthleteContextValidationResult";
import {
  INJURY_SEVERITIES,
  type InjuryProfile,
} from "../models/InjuryProfile";

/**
 * Validate injury profile entries.
 *
 * Returns structured issues; never throws for validation failures.
 */
export function validateInjuries(
  injuries: InjuryProfile,
): readonly AthleteContextValidationIssue[] {
  const issues: AthleteContextValidationIssue[] = [];

  for (let index = 0; index < injuries.injuries.length; index += 1) {
    const entry = injuries.injuries[index]!;
    const prefix = `injuries.injuries[${index}]`;

    if (entry.id.trim().length === 0) {
      issues.push(
        Object.freeze({
          field: `${prefix}.id`,
          code: "invalid_injury_id" as const,
        }),
      );
    }

    if (entry.bodyRegion.trim().length === 0) {
      issues.push(
        Object.freeze({
          field: `${prefix}.bodyRegion`,
          code: "invalid_injury_region" as const,
        }),
      );
    }

    if (!(INJURY_SEVERITIES as readonly string[]).includes(entry.severity)) {
      issues.push(
        Object.freeze({
          field: `${prefix}.severity`,
          code: "invalid_injury_severity" as const,
        }),
      );
    }
  }

  return Object.freeze(issues);
}
