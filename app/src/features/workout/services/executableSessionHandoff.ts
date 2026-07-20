import type { WorkoutSession } from "../../training/application";

/**
 * Single-slot in-memory handoff for an application-layer `WorkoutSession`
 * built just before navigating to the execution screen.
 *
 * Not a cache and not persistence: consuming clears the slot. A stale or
 * non-matching id is ignored so the session screen can show a clear miss state.
 */
let pendingSession: WorkoutSession | null = null;

/** Stashes a session immediately before navigating to the session screen. */
export function setPendingExecutableSession(session: WorkoutSession): void {
  pendingSession = session;
}

/** Consumes (and clears) the pending session if its id matches. Returns `null` otherwise. */
export function consumePendingExecutableSession(sessionId: string): WorkoutSession | null {
  if (pendingSession && pendingSession.id === sessionId) {
    const session = pendingSession;
    pendingSession = null;
    return session;
  }
  return null;
}
