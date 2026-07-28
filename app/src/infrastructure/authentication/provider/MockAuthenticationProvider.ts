import {
  createAuthenticatedUser,
  createAuthenticationResult,
  createAuthenticationSession,
  createAuthenticationToken,
  createRefreshToken,
  MOCK_AUTHENTICATION_CAPABILITIES,
  type AuthenticatedUser,
  type AuthenticationCapabilities,
  type AuthenticationResult,
  type AuthenticationSession,
} from "../models";
import type { AuthenticationSessionManager } from "../session/AuthenticationSessionManager";
import { createAuthenticationSessionManager } from "../session/AuthenticationSessionManager";
import type { AuthenticationProvider } from "./AuthenticationProvider";
import { createAdapterResult } from "../../../core/infrastructure/registry/AdapterResult";
import type { AdapterResult } from "../../../core/infrastructure/registry/AdapterResult";
import { AuthenticationValidator } from "./AuthenticationValidator";

/**
 * In-memory Mock Authentication Provider.
 * Implements AuthenticationAdapter. No networking. No OAuth. No JWT. No SDK.
 */
export class MockAuthenticationProvider implements AuthenticationProvider {
  readonly adapterId = "authentication" as const;
  readonly providerId = "mock" as const;
  readonly capabilities: AuthenticationCapabilities =
    MOCK_AUTHENTICATION_CAPABILITIES;

  private readonly sessions: AuthenticationSessionManager;
  private readonly validator: AuthenticationValidator;
  private sequence = 0;

  constructor(
    sessions: AuthenticationSessionManager = createAuthenticationSessionManager(),
    validator: AuthenticationValidator = new AuthenticationValidator(),
  ) {
    this.sessions = sessions;
    this.validator = validator;
  }

  signIn(
    credentials: Readonly<Record<string, string>>,
  ): AdapterResult<string> {
    const email = credentials.email?.trim() ?? "";
    const password = credentials.password ?? "";

    if (email.length === 0 || password.length === 0) {
      return createAdapterResult<string>({
        success: false,
        errorCode: "invalid_credentials",
        message: "email and password are required",
      });
    }

    this.sequence += 1;
    const issuedAt = `1970-01-01T00:00:${String(this.sequence).padStart(2, "0")}.000Z`;
    const userId = `mock-user-${email}`;
    const sessionId = `mock-session-${this.sequence}`;

    const user = createAuthenticatedUser({
      userId,
      email,
      displayName: credentials.displayName ?? email,
      metadata: Object.freeze({ provider: "mock" }),
    });

    const session = createAuthenticationSession({
      sessionId,
      user,
      accessToken: createAuthenticationToken({
        value: `mock-access-${this.sequence}`,
        issuedAt,
      }),
      refreshToken: createRefreshToken({
        value: `mock-refresh-${this.sequence}`,
        issuedAt,
      }),
      state: "authenticated",
      createdAt: issuedAt,
      metadata: Object.freeze({ provider: "mock" }),
    });

    const userValidation = this.validator.validateUser(user);
    const sessionValidation = this.validator.validateSession(session);
    if (!userValidation.valid || !sessionValidation.valid) {
      return createAdapterResult<string>({
        success: false,
        errorCode: "invalid_session",
        message: [...userValidation.errors, ...sessionValidation.errors].join(
          "; ",
        ),
      });
    }

    this.sessions.setSession(session);

    return createAdapterResult<string>({
      success: true,
      value: session.sessionId,
    });
  }

  signOut(): AdapterResult<void> {
    this.sessions.clearSession("signed_out");
    return createAdapterResult<void>({
      success: true,
      value: undefined,
    });
  }

  getSession(): AdapterResult<string | null> {
    const session = this.sessions.getSession();
    return createAdapterResult<string | null>({
      success: true,
      value: session?.sessionId ?? null,
    });
  }

  refreshSession(): AdapterResult<string> {
    const current = this.sessions.getSession();
    if (!current || current.state !== "authenticated") {
      return createAdapterResult<string>({
        success: false,
        errorCode: "invalid_session",
        message: "No authenticated session to refresh",
      });
    }

    this.sequence += 1;
    const issuedAt = `1970-01-01T00:00:${String(this.sequence).padStart(2, "0")}.000Z`;

    const refreshed = createAuthenticationSession({
      sessionId: current.sessionId,
      user: current.user,
      accessToken: createAuthenticationToken({
        value: `mock-access-${this.sequence}`,
        issuedAt,
      }),
      refreshToken: createRefreshToken({
        value: `mock-refresh-${this.sequence}`,
        issuedAt,
      }),
      state: "authenticated",
      createdAt: current.createdAt,
      metadata: current.metadata,
    });

    this.sessions.setSession(refreshed);

    return createAdapterResult<string>({
      success: true,
      value: refreshed.sessionId,
    });
  }

  getCurrentUser(): AuthenticationResult<AuthenticatedUser | null> {
    return createAuthenticationResult({
      success: true,
      value: this.sessions.getUser(),
    });
  }

  getCurrentSession(): AuthenticationResult<AuthenticationSession | null> {
    return createAuthenticationResult({
      success: true,
      value: this.sessions.getSession(),
    });
  }

  isAuthenticated(): boolean {
    return this.sessions.isAuthenticated();
  }

  validateSession(): AuthenticationResult<boolean> {
    const session = this.sessions.getSession();
    if (!session) {
      return createAuthenticationResult({
        success: false,
        value: false,
        errorCode: "invalid_session",
        message: "No session",
      });
    }
    const validation = this.validator.validateSession(session);
    return createAuthenticationResult({
      success: validation.valid,
      value: validation.valid,
      errorCode: validation.valid ? null : "invalid_session",
      message: validation.valid ? null : validation.errors.join("; "),
    });
  }
}
