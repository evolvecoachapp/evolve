import type { AthleteProfile } from "../models/AthleteProfile";
import type { AthleteStatus } from "../models/AthleteStatus";
import { AthleteStatusKinds } from "../models/AthleteStatus";
import type { SpecialistContribution } from "../models/SpecialistContribution";
import { freezeProfile, freezeStatus } from "../utils/FreezeAthleteState";

/**
 * Aggregates profile/status representation from contributions (no scoring).
 */
export function aggregateProfile(input: {
  readonly profile: AthleteProfile;
  readonly contributions: readonly SpecialistContribution[];
}): AthleteProfile {
  let status: AthleteStatus = input.profile.status;
  const hasRecovery = input.contributions.some((c) => c.recovery != null);
  const hasTraining = input.contributions.some((c) => c.training != null);
  const hasConstraints = input.contributions.some(
    (c) => c.constraints != null && c.constraints.injuries.length > 0,
  );

  if (hasConstraints) {
    status = freezeStatus({
      kind: AthleteStatusKinds.CONSTRAINED,
      label: "constrained",
      notes: Object.freeze(["constraints present"]),
    });
  } else if (hasRecovery && !hasTraining) {
    status = freezeStatus({
      kind: AthleteStatusKinds.RECOVERING,
      label: "recovering",
      notes: Object.freeze(["recovery contribution present"]),
    });
  } else if (hasTraining || hasRecovery) {
    status = freezeStatus({
      kind: AthleteStatusKinds.ACTIVE,
      label: "active",
      notes: Object.freeze(["specialist contributions present"]),
    });
  }

  return freezeProfile({
    ...input.profile,
    status,
  });
}
