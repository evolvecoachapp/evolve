import {
  AuthenticationFactory,
  type AuthenticationBundle,
  type AuthenticationFactoryDeps,
} from "../../../infrastructure/authentication/application";

export interface AuthenticationCompositionFactoryDeps
  extends AuthenticationFactoryDeps {}

/**
 * Composition Root factory for the Authentication Adapter Foundation.
 */
export const AuthenticationCompositionFactory = {
  create(
    deps: AuthenticationCompositionFactoryDeps = {},
  ): AuthenticationBundle {
    return AuthenticationFactory.create(deps);
  },
} as const;

export type { AuthenticationBundle, AuthenticationFactoryDeps };
