import {
  createCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import {
  AuthenticationFactory,
  getAuthentication,
  getCurrentUser,
  getCurrentSession,
  isAuthenticated,
  validateAuthentication,
} from "../application";
import { MockAuthenticationProvider } from "../provider/MockAuthenticationProvider";
import { AuthenticationProviderFactory } from "../provider/AuthenticationProviderFactory";
import { AuthenticationValidator } from "../provider/AuthenticationValidator";
import {
  AUTHENTICATION_PROVIDER_TOKENS,
  AuthenticationRegistry,
  createAuthenticationProviderRegistration,
  createAuthenticationRegistry,
  AuthenticationProviderRegistrationError,
  AuthenticationProviderValidationError,
} from "../registry";
import {
  createAuthenticatedUser,
  createAuthenticationSession,
  createAuthenticationToken,
  createRefreshToken,
} from "../models";

describe("Authentication Adapter integration (Sprint 30.3)", () => {
  afterEach(() => {
    resetCompositionRoot();
  });

  describe("sign in", () => {
    it("signs in and creates an authenticated session", () => {
      const provider = new MockAuthenticationProvider();
      const result = provider.signIn({
        email: "athlete@evolve.test",
        password: "secret",
      });

      expect(result.success).toBe(true);
      expect(result.value).toMatch(/^mock-session-/);
      expect(provider.isAuthenticated()).toBe(true);
      expect(provider.getCurrentUser().value?.email).toBe(
        "athlete@evolve.test",
      );
      expect(provider.getCurrentSession().value?.state).toBe("authenticated");
    });

    it("rejects missing credentials", () => {
      const provider = new MockAuthenticationProvider();
      const result = provider.signIn({ email: "", password: "" });
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe("invalid_credentials");
      expect(provider.isAuthenticated()).toBe(false);
    });
  });

  describe("sign out", () => {
    it("clears the session", () => {
      const provider = new MockAuthenticationProvider();
      provider.signIn({ email: "a@b.c", password: "x" });
      const result = provider.signOut();
      expect(result.success).toBe(true);
      expect(provider.isAuthenticated()).toBe(false);
      expect(provider.getCurrentSession().value).toBeNull();
      expect(provider.getCurrentUser().value).toBeNull();
    });
  });

  describe("session", () => {
    it("exposes session id via AuthenticationAdapter getSession", () => {
      const provider = new MockAuthenticationProvider();
      provider.signIn({ email: "a@b.c", password: "x" });
      const session = provider.getSession();
      expect(session.success).toBe(true);
      expect(session.value).toBe(
        provider.getCurrentSession().value?.sessionId ?? null,
      );
    });

    it("refreshes session tokens deterministically", () => {
      const provider = new MockAuthenticationProvider();
      provider.signIn({ email: "a@b.c", password: "x" });
      const before = provider.getCurrentSession().value!;
      const refreshed = provider.refreshSession();
      expect(refreshed.success).toBe(true);
      const after = provider.getCurrentSession().value!;
      expect(after.sessionId).toBe(before.sessionId);
      expect(after.accessToken.value).not.toBe(before.accessToken.value);
      expect(after.refreshToken.value).not.toBe(before.refreshToken.value);
    });

    it("rejects refresh without a session", () => {
      const provider = new MockAuthenticationProvider();
      const refreshed = provider.refreshSession();
      expect(refreshed.success).toBe(false);
      expect(refreshed.errorCode).toBe("invalid_session");
    });
  });

  describe("user retrieval", () => {
    it("returns null user before sign in", () => {
      const provider = new MockAuthenticationProvider();
      expect(provider.getCurrentUser().value).toBeNull();
    });

    it("returns authenticated user after sign in", () => {
      const provider = new MockAuthenticationProvider();
      provider.signIn({
        email: "user@evolve.test",
        password: "pw",
        displayName: "User",
      });
      const user = provider.getCurrentUser().value;
      expect(user?.userId).toBe("mock-user-user@evolve.test");
      expect(user?.displayName).toBe("User");
    });
  });

  describe("validation", () => {
    it("validates a healthy session", () => {
      const provider = new MockAuthenticationProvider();
      provider.signIn({ email: "a@b.c", password: "x" });
      const result = provider.validateSession();
      expect(result.success).toBe(true);
      expect(result.value).toBe(true);
    });

    it("detects invalid user and missing immutable fields", () => {
      const validator = new AuthenticationValidator();
      expect(validator.validateUser(null).valid).toBe(false);
      expect(validator.validateUser(null).errors).toEqual(
        expect.arrayContaining(["invalid user"]),
      );

      const incomplete = createAuthenticatedUser({ userId: "" });
      expect(validator.validateUser(incomplete).errors).toEqual(
        expect.arrayContaining(["missing immutable fields: userId"]),
      );
    });

    it("detects invalid session", () => {
      const validator = new AuthenticationValidator();
      expect(validator.validateSession(null).valid).toBe(false);
      expect(validator.validateSession(null).errors).toEqual(
        expect.arrayContaining(["invalid session"]),
      );
    });
  });

  describe("registry", () => {
    it("registers MockAuthenticationProvider with metadata", () => {
      const { registry, provider } = AuthenticationFactory.create();
      expect(registry.list()).toHaveLength(
        AUTHENTICATION_PROVIDER_TOKENS.length,
      );
      expect(registry.has("mock")).toBe(true);
      expect(registry.resolve("mock")).toBe(provider);
      expect(registry.resolveRegistration("mock")?.metadata.backend).toBe(
        "mock",
      );
      expect(registry.validate().valid).toBe(true);
    });

    it("rejects duplicate provider registrations", () => {
      const provider = AuthenticationProviderFactory.create();
      const registry = createAuthenticationRegistry();
      const registration = createAuthenticationProviderRegistration({
        token: "mock",
        name: "MockAuthenticationProvider",
        version: "1.0.0",
        providerId: "mock",
      });
      registry.register(registration, provider);
      expect(() => registry.register(registration, provider)).toThrow(
        AuthenticationProviderRegistrationError,
      );
    });

    it("rejects contract compliance failures", () => {
      const registry = new AuthenticationRegistry();
      const invalidProvider = {
        adapterId: "storage" as const,
        providerId: "mock" as const,
        capabilities: {
          supportsSignIn: true,
          supportsSignOut: true,
          supportsRefresh: true,
          supportsOffline: true,
          supportsBiometrics: false,
        },
        signIn: () => ({
          success: false,
          value: null,
          errorCode: null,
          message: null,
        }),
        signOut: () => ({
          success: true,
          value: null,
          errorCode: null,
          message: null,
        }),
        getSession: () => ({
          success: true,
          value: null,
          errorCode: null,
          message: null,
        }),
        refreshSession: () => ({
          success: false,
          value: null,
          errorCode: null,
          message: null,
        }),
        getCurrentUser: () => ({
          success: true,
          value: null,
          errorCode: null,
          message: null,
        }),
        getCurrentSession: () => ({
          success: true,
          value: null,
          errorCode: null,
          message: null,
        }),
        isAuthenticated: () => false,
        validateSession: () => ({
          success: false,
          value: false,
          errorCode: null,
          message: null,
        }),
      };
      expect(() =>
        registry.register(
          createAuthenticationProviderRegistration({
            token: "mock",
            name: "MockAuthenticationProvider",
            version: "1.0.0",
            providerId: "mock",
          }),
          invalidProvider as never,
        ),
      ).toThrow(AuthenticationProviderValidationError);
    });
  });

  describe("composition root", () => {
    it("registers MockAuthenticationProvider, AuthenticationRegistry, AuthenticationFactory", () => {
      const root = createCompositionRoot();
      const registry = root.getAuthenticationRegistry();
      const provider = root.getMockAuthenticationProvider();
      const factory = root.getAuthenticationFactory();

      expect(registry.validate().valid).toBe(true);
      expect(provider).toBeInstanceOf(MockAuthenticationProvider);
      expect(provider.adapterId).toBe("authentication");
      expect(factory.create).toEqual(expect.any(Function));
      expect(root.registry.getMockAuthenticationProvider()).toBe(provider);
    });
  });

  describe("application APIs", () => {
    it("exposes getAuthentication / getCurrentUser / getCurrentSession / isAuthenticated", () => {
      const provider = getAuthentication();
      expect(provider.adapterId).toBe("authentication");
      expect(isAuthenticated({ provider })).toBe(false);

      provider.signIn({ email: "api@evolve.test", password: "pw" });
      expect(isAuthenticated({ provider })).toBe(true);
      expect(getCurrentUser({ provider })?.email).toBe("api@evolve.test");
      expect(getCurrentSession({ provider })?.state).toBe("authenticated");
    });

    it("validates missing provider", () => {
      const validation = validateAuthentication({
        registry: null,
        provider: null,
      });
      expect(validation.valid).toBe(false);
      expect(validation.errors).toEqual(
        expect.arrayContaining(["Missing provider"]),
      );
    });

    it("validates a healthy bundle", () => {
      const validation = validateAuthentication();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });
  });

  describe("immutability", () => {
    it("freezes models and registrations", () => {
      const { registry } = AuthenticationFactory.create();
      const provider = new MockAuthenticationProvider();
      provider.signIn({ email: "freeze@evolve.test", password: "pw" });
      const session = provider.getCurrentSession().value!;
      const user = provider.getCurrentUser().value!;

      expect(Object.isFrozen(session)).toBe(true);
      expect(Object.isFrozen(user)).toBe(true);
      expect(Object.isFrozen(user.metadata)).toBe(true);
      expect(Object.isFrozen(session.accessToken)).toBe(true);
      expect(Object.isFrozen(session.refreshToken)).toBe(true);

      const registration = registry.resolveRegistration("mock");
      expect(Object.isFrozen(registration)).toBe(true);
      expect(Object.isFrozen(registration!.metadata)).toBe(true);
    });

    it("freezes validation results", () => {
      const validation = validateAuthentication();
      expect(Object.isFrozen(validation)).toBe(true);
      expect(Object.isFrozen(validation.errors)).toBe(true);
    });

    it("freezes constructed session helpers", () => {
      const user = createAuthenticatedUser({ userId: "u1" });
      const session = createAuthenticationSession({
        sessionId: "s1",
        user,
        accessToken: createAuthenticationToken({
          value: "a",
          issuedAt: "1970-01-01T00:00:00.000Z",
        }),
        refreshToken: createRefreshToken({
          value: "r",
          issuedAt: "1970-01-01T00:00:00.000Z",
        }),
        state: "authenticated",
        createdAt: "1970-01-01T00:00:00.000Z",
      });
      expect(Object.isFrozen(session)).toBe(true);
      expect(Object.isFrozen(session.metadata)).toBe(true);
    });
  });

  describe("contract compliance", () => {
    it("implements AuthenticationAdapter surface", () => {
      const provider = getAuthentication();
      expect(provider.adapterId).toBe("authentication");
      expect(typeof provider.signIn).toBe("function");
      expect(typeof provider.signOut).toBe("function");
      expect(typeof provider.getSession).toBe("function");
      expect(typeof provider.refreshSession).toBe("function");
      expect(typeof provider.getCurrentUser).toBe("function");
      expect(typeof provider.getCurrentSession).toBe("function");
      expect(typeof provider.isAuthenticated).toBe("function");
      expect(typeof provider.validateSession).toBe("function");
    });
  });
});
