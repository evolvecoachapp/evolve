import type { RecoveryConstraints } from "../models/RecoveryConstraints";
import { DEFAULT_RECOVERY_CONSTRAINTS } from "../models/RecoveryConstraints";
import { freezeConstraints } from "../utils/FreezeRecoveryState";

export class ConstraintSelector {
  select(raw: readonly string[]): RecoveryConstraints {
    const lower = raw.map((c) => c.toLowerCase());
    const notes = [...raw];
    let maxTrainingLoad: number | null = null;
    for (const c of lower) {
      const match = c.match(/max[_ ]?load[=:](\d+)/);
      if (match) maxTrainingLoad = Number(match[1]);
    }
    return freezeConstraints({
      medicalClearanceRequired: lower.some(
        (c) => c.includes("medical") || c.includes("injury"),
      ),
      avoidDeload: lower.some((c) => c.includes("avoid_deload") || c.includes("no deload")),
      prioritizeSleep: lower.some((c) => c.includes("prioritize_sleep") || c.includes("sleep first")),
      prioritizeStress: lower.some(
        (c) => c.includes("prioritize_stress") || c.includes("stress first"),
      ),
      maxTrainingLoad,
      notes: Object.freeze(notes),
    });
  }

  defaults(): RecoveryConstraints {
    return freezeConstraints(DEFAULT_RECOVERY_CONSTRAINTS);
  }
}
