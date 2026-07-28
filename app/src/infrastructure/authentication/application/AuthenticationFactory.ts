import type { AuthenticationProvider } from "../provider/AuthenticationProvider";
import { AuthenticationProviderFactory } from "../provider/AuthenticationProviderFactory";
import { MockAuthenticationProvider } from "../provider/MockAuthenticationProvider";
import {
  AuthenticationRegistry,
  createAuthenticationProviderRegistration,
  createAuthenticationRegistry,
} from "../registry";
import type { AuthenticationProviderToken } from "../registry/AuthenticationProviderToken";
import { validateAuthenticationBundle } from "../validation";
import type { AuthenticationValidation } from "../models/AuthenticationResult";
import type { AuthenticatedUser } from "../models/AuthenticatedUser";
import type { AuthenticationSession } from "../models/AuthenticationSession";
import type { AuthenticationResult } from "../models/AuthenticationResult";
import { createAuthenticationResult } from "../models/AuthenticationResult";

export const AUTHENTICATION_ADAPTER_VERSION = "1.0.0" as const;

export interface AuthenticationBundle {
  readonly registry: AuthenticationRegistry;
  readonly provider: AuthenticationProvider;
  readonly mockProvider: MockAuthenticationProvider;
}

export interface AuthenticationFactoryDeps {
  readonly registry?: AuthenticationRegistry;
  readonly provider?: AuthenticationProvider;
  readonly mockProvider?: MockAuthenticationProvider;
  readonly bundle?: AuthenticationBundle;
  readonly version?: string;
  readonly activeToken?: AuthenticationProviderToken;
}

const PROVIDER_NAMES: Record<AuthenticationProviderToken, string> = {
  mock: "MockAuthenticationProvider",
};

function seedRegistry(
  registry: AuthenticationRegistry,
  provider: AuthenticationProvider,
  version: string,
): void {
  if (registry.has(provider.providerId)) {
    return;
  }
  registry.register(
    createAuthenticationProviderRegistration({
      token: provider.providerId,
      name: PROVIDER_NAMES[provider.providerId],
      version,
      providerId: provider.providerId,
      metadata: Object.freeze({
        backend: "mock",
        contract: "authentication",
      }),
    }),
    provider,
  );
}

/**
 * Factory for Authentication Adapter Foundation (Mock provider).
 */
export const AuthenticationFactory = {
  create(deps: AuthenticationFactoryDeps = {}): AuthenticationBundle {
    if (deps.bundle) {
      return deps.bundle;
    }

    const version = deps.version ?? AUTHENTICATION_ADAPTER_VERSION;
    const mockProvider =
      deps.mockProvider ??
      (deps.provider instanceof MockAuthenticationProvider
        ? deps.provider
        : new MockAuthenticationProvider());
    const provider =
      deps.provider ??
      AuthenticationProviderFactory.create({ provider: mockProvider });
    const registry = deps.registry ?? createAuthenticationRegistry();
    seedRegistry(registry, provider, version);

    if (deps.activeToken) {
      registry.setActive(deps.activeToken);
    }

    return Object.freeze({
      registry,
      provider,
      mockProvider:
        provider instanceof MockAuthenticationProvider
          ? provider
          : mockProvider,
    });
  },
} as const;

/** Application API — active authentication provider. */
export function getAuthentication(options: {
  readonly provider?: AuthenticationProvider;
  readonly registry?: AuthenticationRegistry;
  readonly deps?: AuthenticationFactoryDeps;
} = {}): AuthenticationProvider {
  if (options.provider) {
    return options.provider;
  }
  if (options.registry) {
    const active = options.registry.resolveActive();
    if (active) {
      return active;
    }
  }
  return AuthenticationFactory.create(options.deps).provider;
}

/** Application API — current authenticated user. */
export function getCurrentUser(options: {
  readonly provider?: AuthenticationProvider;
  readonly registry?: AuthenticationRegistry;
  readonly deps?: AuthenticationFactoryDeps;
} = {}): AuthenticatedUser | null {
  return getAuthentication(options).getCurrentUser().value;
}

/** Application API — current authentication session. */
export function getCurrentSession(options: {
  readonly provider?: AuthenticationProvider;
  readonly registry?: AuthenticationRegistry;
  readonly deps?: AuthenticationFactoryDeps;
} = {}): AuthenticationSession | null {
  return getAuthentication(options).getCurrentSession().value;
}

/** Application API — authenticated flag. */
export function isAuthenticated(options: {
  readonly provider?: AuthenticationProvider;
  readonly registry?: AuthenticationRegistry;
  readonly deps?: AuthenticationFactoryDeps;
} = {}): boolean {
  return getAuthentication(options).isAuthenticated();
}

/** Application API — validate authentication wiring / session. */
export function validateAuthentication(options: {
  readonly registry?: AuthenticationRegistry | null;
  readonly provider?: AuthenticationProvider | null;
  readonly deps?: AuthenticationFactoryDeps;
} = {}): AuthenticationValidation {
  const hasExplicit = "registry" in options || "provider" in options;

  if (hasExplicit) {
    return validateAuthenticationBundle({
      registry: options.registry ?? null,
      provider: options.provider ?? null,
    });
  }

  const bundle = AuthenticationFactory.create(options.deps);
  return validateAuthenticationBundle(bundle);
}

export type { AuthenticationValidation, AuthenticationResult };
export { createAuthenticationResult };
