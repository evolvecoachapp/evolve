import type { AthleteSnapshot } from "../models/AthleteSnapshot";
import type { AthleteState } from "../models/AthleteState";
import {
  createAthleteStateSession,
  type AthleteStateSession,
} from "./AthleteStateSession";

/**
 * In-memory registry of athlete states (no persistence).
 */
export class AthleteStateManager {
  private readonly sessions = new Map<string, AthleteStateSession>();

  get(athleteId: string): AthleteStateSession | null {
    return this.sessions.get(athleteId) ?? null;
  }

  getState(athleteId: string): AthleteState | null {
    return this.get(athleteId)?.state ?? null;
  }

  put(state: AthleteState): AthleteStateSession {
    const existing = this.sessions.get(state.athleteId);
    const session = createAthleteStateSession({
      state,
      snapshots: existing?.snapshots ?? [],
    });
    this.sessions.set(state.athleteId, session);
    return session;
  }

  addSnapshot(
    athleteId: string,
    snapshot: AthleteSnapshot,
  ): AthleteStateSession | null {
    const existing = this.sessions.get(athleteId);
    if (!existing) return null;
    const session = createAthleteStateSession({
      state: existing.state,
      snapshots: [...existing.snapshots, snapshot],
    });
    this.sessions.set(athleteId, session);
    return session;
  }

  listAthleteIds(): readonly string[] {
    return Object.freeze([...this.sessions.keys()]);
  }
}

export function createAthleteStateManager(): AthleteStateManager {
  return new AthleteStateManager();
}
