/**
 * Authentication Adapter Foundation (Sprint 30.3).
 *
 * Application → Authentication Contract → Authentication Adapter → Mock Authentication Provider
 *
 * In-memory Mock Authentication Adapter implementing Infrastructure AuthenticationAdapter.
 * No Supabase / Firebase / Auth0 / OAuth / JWT / OpenID / HTTP / networking / cloud / SDK /
 * encryption / persistence / business logic.
 */

export * from "./models";
export * from "./registry";
export * from "./session";
export * from "./provider";
export * from "./validation";
export {
  AuthenticationFactory,
  getAuthentication,
  getCurrentUser,
  getCurrentSession,
  isAuthenticated,
  validateAuthentication,
  AUTHENTICATION_ADAPTER_VERSION,
  type AuthenticationBundle,
  type AuthenticationFactoryDeps,
} from "./application";
