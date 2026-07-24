import type { AthleteSnapshot } from "../models/AthleteSnapshot";
import type { StateValidation } from "../models/StateValidation";
import { validateSnapshot } from "../validators/validateSnapshot";

export function applySnapshotPolicy(
  snapshot: AthleteSnapshot,
): StateValidation {
  return validateSnapshot(snapshot);
}
