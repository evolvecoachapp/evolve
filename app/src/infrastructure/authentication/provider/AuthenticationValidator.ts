import {
  createAuthenticationValidation,
  type AuthenticatedUser,
  type AuthenticationSession,
  type AuthenticationValidation,
} from "../models";

/**
 * Deterministic authentication validation.
 * Validates missing immutable fields, invalid session, invalid user.
 */
export class AuthenticationValidator {
  validateUser(user: AuthenticatedUser | null | undefined): AuthenticationValidation {
    const errors: string[] = [];

    if (!user || typeof user !== "object") {
      errors.push("invalid user");
      return createAuthenticationValidation(errors);
    }

    if (typeof user.userId !== "string" || user.userId.trim().length === 0) {
      errors.push("missing immutable fields: userId");
    }

    if (user.email !== null && typeof user.email !== "string") {
      errors.push("invalid user: email");
    }

    if (user.displayName !== null && typeof user.displayName !== "string") {
      errors.push("invalid user: displayName");
    }

    if (
      !user.metadata ||
      typeof user.metadata !== "object" ||
      Array.isArray(user.metadata)
    ) {
      errors.push("missing immutable fields: metadata");
    }

    return createAuthenticationValidation(errors);
  }

  validateSession(
    session: AuthenticationSession | null | undefined,
  ): AuthenticationValidation {
    const errors: string[] = [];

    if (!session || typeof session !== "object") {
      errors.push("invalid session");
      return createAuthenticationValidation(errors);
    }

    if (
      typeof session.sessionId !== "string" ||
      session.sessionId.trim().length === 0
    ) {
      errors.push("missing immutable fields: sessionId");
    }

    if (
      typeof session.createdAt !== "string" ||
      session.createdAt.trim().length === 0
    ) {
      errors.push("missing immutable fields: createdAt");
    }

    if (
      !session.accessToken ||
      typeof session.accessToken.value !== "string" ||
      session.accessToken.value.trim().length === 0
    ) {
      errors.push("missing immutable fields: accessToken");
    }

    if (
      !session.refreshToken ||
      typeof session.refreshToken.value !== "string" ||
      session.refreshToken.value.trim().length === 0
    ) {
      errors.push("missing immutable fields: refreshToken");
    }

    if (
      session.state !== "authenticated" &&
      session.state !== "anonymous" &&
      session.state !== "signed_out" &&
      session.state !== "invalid"
    ) {
      errors.push("invalid session: state");
    }

    if (
      !session.metadata ||
      typeof session.metadata !== "object" ||
      Array.isArray(session.metadata)
    ) {
      errors.push("missing immutable fields: metadata");
    }

    const userValidation = this.validateUser(session.user);
    errors.push(...userValidation.errors);

    return createAuthenticationValidation(errors);
  }
}
