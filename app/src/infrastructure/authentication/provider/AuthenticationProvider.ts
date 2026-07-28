import type { AuthenticationAdapter } from "../../../core/infrastructure/adapters/AuthenticationAdapter";
import type { AdapterResult } from "../../../core/infrastructure/registry/AdapterResult";
import type { AuthenticatedUser } from "../models/AuthenticatedUser";
import type { AuthenticationSession } from "../models/AuthenticationSession";
import type { AuthenticationResult } from "../models/AuthenticationResult";
import type { AuthenticationCapabilities } from "../models/AuthenticationCapabilities";
import type { AuthenticationProviderToken } from "../registry/AuthenticationProviderToken";

/**
 * Authentication provider contract.
 * Extends Infrastructure AuthenticationAdapter; replaceable without Domain changes.
 */
export interface AuthenticationProvider extends AuthenticationAdapter {
  readonly providerId: AuthenticationProviderToken;
  readonly capabilities: AuthenticationCapabilities;

  signIn(
    credentials: Readonly<Record<string, string>>,
  ): AdapterResult<string> | Promise<AdapterResult<string>>;

  signOut(): AdapterResult<void> | Promise<AdapterResult<void>>;

  getSession():
    | AdapterResult<string | null>
    | Promise<AdapterResult<string | null>>;

  refreshSession(): AdapterResult<string> | Promise<AdapterResult<string>>;

  getCurrentUser(): AuthenticationResult<AuthenticatedUser | null>;

  getCurrentSession(): AuthenticationResult<AuthenticationSession | null>;

  isAuthenticated(): boolean;

  validateSession(): AuthenticationResult<boolean>;
}
