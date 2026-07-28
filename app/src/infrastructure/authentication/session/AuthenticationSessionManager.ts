import type { AuthenticationSession } from "../models/AuthenticationSession";
import type { AuthenticatedUser } from "../models/AuthenticatedUser";
import type { AuthenticationState } from "../models/AuthenticationState";

/**
 * Deterministic in-memory session holder.
 * Replaces whole immutable session snapshots — no timers, no background refresh.
 */
export class AuthenticationSessionManager {
  private session: AuthenticationSession | null = null;
  private state: AuthenticationState = "anonymous";

  getSession(): AuthenticationSession | null {
    return this.session;
  }

  getUser(): AuthenticatedUser | null {
    return this.session?.user ?? null;
  }

  getState(): AuthenticationState {
    return this.state;
  }

  isAuthenticated(): boolean {
    return this.state === "authenticated" && this.session !== null;
  }

  setSession(session: AuthenticationSession): void {
    this.session = session;
    this.state = session.state;
  }

  clearSession(nextState: AuthenticationState = "signed_out"): void {
    this.session = null;
    this.state = nextState;
  }

  replaceSession(session: AuthenticationSession | null): void {
    if (session === null) {
      this.clearSession("anonymous");
      return;
    }
    this.setSession(session);
  }
}

export function createAuthenticationSessionManager(
  initial?: AuthenticationSession | null,
): AuthenticationSessionManager {
  const manager = new AuthenticationSessionManager();
  if (initial) {
    manager.setSession(initial);
  }
  return manager;
}
