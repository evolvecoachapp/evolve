import type { RestSession } from "../models/RestSession";
import { validateDurationMs } from "../validators/validateDuration";

/**
 * Validate a RestSession before seeding a runtime.
 */
export function validateSessionForRuntime(
  session: RestSession,
): readonly string[] {
  const issues: string[] = [];

  if (!session.id) {
    issues.push("missing_session_id");
  }

  issues.push(...validateDurationMs(session.target.duration.milliseconds));

  if (session.target.duration.milliseconds === 0) {
    issues.push("zero_target_duration");
  }

  return Object.freeze(issues);
}
