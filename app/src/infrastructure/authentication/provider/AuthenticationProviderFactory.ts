import { MockAuthenticationProvider } from "./MockAuthenticationProvider";
import type { AuthenticationProvider } from "./AuthenticationProvider";
import type { AuthenticationProviderToken } from "../registry/AuthenticationProviderToken";
import type { AuthenticationSessionManager } from "../session/AuthenticationSessionManager";
import { createAuthenticationSessionManager } from "../session/AuthenticationSessionManager";
import { AuthenticationValidator } from "./AuthenticationValidator";

export interface AuthenticationProviderFactoryDeps {
  readonly token?: AuthenticationProviderToken;
  readonly sessions?: AuthenticationSessionManager;
  readonly validator?: AuthenticationValidator;
  readonly provider?: AuthenticationProvider;
}

/**
 * Factory for authentication providers.
 * Currently produces MockAuthenticationProvider only.
 */
export const AuthenticationProviderFactory = {
  create(
    deps: AuthenticationProviderFactoryDeps = {},
  ): AuthenticationProvider {
    if (deps.provider) {
      return deps.provider;
    }

    const token = deps.token ?? "mock";
    if (token !== "mock") {
      throw new Error(
        `Authentication provider not implemented in this sprint: ${token}`,
      );
    }

    return new MockAuthenticationProvider(
      deps.sessions ?? createAuthenticationSessionManager(),
      deps.validator ?? new AuthenticationValidator(),
    );
  },
} as const;
