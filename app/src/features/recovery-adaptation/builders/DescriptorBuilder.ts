import type { RecoveryDescriptor } from "../models/RecoveryDescriptor";
import { freezeDescriptor } from "../utils/FreezeRecoveryAdaptation";

export function buildRecoveryDescriptor(input: {
  readonly id: string;
  readonly createdAt: string;
}): RecoveryDescriptor {
  return freezeDescriptor({
    id: input.id,
    name: "Recovery Adaptation Engine",
    version: "24.2.0",
    capabilities: Object.freeze([
      "adaptRecovery",
      "compareRecovery",
      "describeRecoveryAdaptation",
      "createRecoverySnapshot",
      "validateRecoveryAdaptation",
    ]),
    boundaries: Object.freeze([
      "adapts_existing_plan_only",
      "no_ai",
      "no_networking",
      "no_persistence",
      "no_ui",
      "no_recovery_generation_from_scratch",
      "no_athlete_goal_changes",
    ]),
    createdAt: input.createdAt,
  });
}
