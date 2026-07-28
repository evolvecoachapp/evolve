import type { AdapterResult } from "../registry/AdapterResult";

/**
 * Infrastructure adapter contract for authentication providers.
 * No implementation in this sprint.
 */
export interface AuthenticationAdapter {
  readonly adapterId: "authentication";
  signIn(
    credentials: Readonly<Record<string, string>>,
  ): Promise<AdapterResult<string>> | AdapterResult<string>;
  signOut(): Promise<AdapterResult<void>> | AdapterResult<void>;
  getSession(): Promise<AdapterResult<string | null>> | AdapterResult<string | null>;
  refreshSession(): Promise<AdapterResult<string>> | AdapterResult<string>;
}
