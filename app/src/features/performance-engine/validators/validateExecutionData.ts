import type { EventStream } from "../../../core/domain-events/models/EventStream";
import type { WorkoutResult } from "../../workout-runtime/models/WorkoutResult";
import { extractCompletedSets } from "../utils/extractExecutionData";

/**
 * Validate presence of execution data when the result claims completed work.
 */
export function validateExecutionData(
  result: WorkoutResult,
  stream: EventStream,
): readonly string[] {
  const issues: string[] = [];

  if (!stream) {
    issues.push("missing_event_stream");
    return Object.freeze(issues);
  }

  if (stream.sessionId && stream.sessionId !== result.sessionId) {
    issues.push("session_id_mismatch");
  }

  const completedSets = extractCompletedSets(stream);
  const claimedSets = result.progress.completedSets;

  if (claimedSets > 0 && completedSets.length === 0) {
    issues.push("missing_set_execution_data");
  }

  if (
    claimedSets > 0 &&
    completedSets.length > 0 &&
    completedSets.length !== claimedSets
  ) {
    issues.push(
      `set_count_mismatch:result=${claimedSets},events=${completedSets.length}`,
    );
  }

  return Object.freeze(issues);
}
