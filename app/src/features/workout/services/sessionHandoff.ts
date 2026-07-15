import type { WorkoutSession } from "../models/WorkoutSession";

/**
 * Single-slot in-memory handoff for a session the caller already has in hand
 * (just started, or found via `getActiveSession`) — lets the session screen
 * skip its first `getSession` fetch instead of re-requesting data the caller
 * already fetched a moment ago. Not a cache: consuming clears the slot, and
 * a stale or non-matching id is simply ignored (the screen falls back to its
 * normal fetch).
 */
let pendingSession: WorkoutSession | null = null;

/** Stashes a session immediately before navigating to the session screen. */
export function setPendingSession(session: WorkoutSession): void {
  pendingSession = session;
}

/** Consumes (and clears) the pending session if its id matches. Returns `null` otherwise. */
export function consumePendingSession(sessionId: string): WorkoutSession | null {
  if (pendingSession && pendingSession.id === sessionId) {
    const session = pendingSession;
    pendingSession = null;
    return session;
  }
  return null;
}
