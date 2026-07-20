import type { WorkoutSession, WorkoutSessionSet } from "../../training/application";
import type {
  SessionExecutionState,
  SetExecutionStatus,
} from "../types/sessionExecutionState";
import type { SessionSetRef } from "../types/sessionTiming";
import { getSetExecution } from "./sessionExecutionState";

/** Working sets trigger rest; warm-ups / other types do not. */
export function isWorkingSet(set: Pick<WorkoutSessionSet, "setType">): boolean {
  return set.setType.trim().toLowerCase() === "working";
}

/**
 * Overlay a provisional status for a set without mutating the real execution state.
 * Used when the timing hook reacts in the same tick as an interaction update.
 */
export function withProvisionalSetStatus(
  execution: SessionExecutionState,
  setId: string,
  status: SetExecutionStatus,
): SessionExecutionState {
  const current = getSetExecution(execution, setId);
  return Object.freeze({
    sets: Object.freeze({
      ...execution.sets,
      [setId]: Object.freeze({
        ...current,
        status,
      }),
    }),
  });
}

/** Flatten session sets in prescription order for navigation. */
export function listSessionSetRefs(session: WorkoutSession): SessionSetRef[] {
  const refs: SessionSetRef[] = [];
  for (const exercise of session.exercises) {
    for (const set of exercise.sets) {
      refs.push({
        setId: set.id,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        setOrder: set.order,
        setType: set.setType,
        setTypeLabel: set.setTypeLabel,
        restSeconds: set.restSeconds,
      });
    }
  }
  return refs;
}

/** Find a set ref by id, or null. */
export function findSessionSetRef(
  session: WorkoutSession,
  setId: string,
): SessionSetRef | null {
  return listSessionSetRefs(session).find((ref) => ref.setId === setId) ?? null;
}

/** First pending set in prescription order. */
export function findFirstPendingSetId(
  session: WorkoutSession,
  execution: SessionExecutionState,
): string | null {
  for (const ref of listSessionSetRefs(session)) {
    if (getSetExecution(execution, ref.setId).status === "pending") {
      return ref.setId;
    }
  }
  return null;
}

/**
 * Next pending set after `afterSetId` in prescription order.
 * When `afterSetId` is null, returns the first pending set.
 */
export function findNextPendingSetId(
  session: WorkoutSession,
  execution: SessionExecutionState,
  afterSetId: string | null = null,
): string | null {
  const refs = listSessionSetRefs(session);
  const startIndex =
    afterSetId === null ? -1 : refs.findIndex((ref) => ref.setId === afterSetId);

  for (let index = Math.max(startIndex + 1, 0); index < refs.length; index += 1) {
    const ref = refs[index]!;
    if (getSetExecution(execution, ref.setId).status === "pending") {
      return ref.setId;
    }
  }

  // If afterSetId was mid-list and nothing follows, fall back to first pending overall
  // only when afterSetId itself is no longer pending (completed/skipped).
  if (afterSetId !== null) {
    return findFirstPendingSetId(session, execution);
  }

  return null;
}

/**
 * Rest should start only after a working set with a positive prescribed duration
 * and when another pending set remains.
 */
export function shouldStartRestAfterComplete(
  session: WorkoutSession,
  execution: SessionExecutionState,
  completedSetId: string,
): { start: true; durationSeconds: number; upcomingSetId: string } | { start: false } {
  const completed = findSessionSetRef(session, completedSetId);
  if (!completed || !isWorkingSet(completed)) {
    return { start: false };
  }

  const duration = completed.restSeconds;
  if (duration === null || duration <= 0) {
    return { start: false };
  }

  const upcomingSetId = findNextPendingSetId(session, execution, completedSetId);
  if (upcomingSetId === null) {
    return { start: false };
  }

  return { start: true, durationSeconds: duration, upcomingSetId };
}

/** Human-readable set label for rest "up next" UI. */
export function formatUpcomingSetLabel(ref: SessionSetRef): string {
  return `${ref.setTypeLabel} · Set ${ref.setOrder + 1}`;
}
