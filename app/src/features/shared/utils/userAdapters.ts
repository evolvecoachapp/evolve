import type { UserPublic } from "../../../types/api";
import type { Subscription, User, UserPreferences, UserProfile } from "../models";

function buildDisplayName(dto: UserPublic): string {
  if (dto.first_name) {
    return `${dto.first_name}${dto.last_name ? ` ${dto.last_name}` : ""}`;
  }
  return dto.username;
}

/** Maps the API transport shape to the shared domain `User` model. */
export function mapUserPublicToUser(dto: UserPublic): User {
  return {
    id: dto.id,
    email: dto.email,
    username: dto.username,
    isActive: dto.is_active,
    isVerified: dto.is_verified,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

/** Maps the API transport shape to the shared domain `UserProfile` model. */
export function mapUserPublicToProfile(dto: UserPublic): UserProfile {
  return {
    userId: dto.id,
    firstName: dto.first_name,
    lastName: dto.last_name,
    displayName: buildDisplayName(dto),
    avatarUrl: null,
    birthDate: dto.birth_date,
    gender: dto.gender,
    heightCm: dto.height_cm,
    currentWeightKg: dto.current_weight_kg,
    targetWeightKg: dto.target_weight_kg,
    activityLevel: dto.activity_level,
    goal: dto.goal,
    updatedAt: dto.updated_at,
  };
}

/** Builds a default free-tier subscription from the authenticated user. */
export function mapUserToDefaultSubscription(user: User): Subscription {
  return {
    tier: "free",
    status: "active",
    currentPeriodStart: null,
    currentPeriodEnd: null,
    trialEndsAt: null,
    autoRenew: false,
    memberSince: user.createdAt,
  };
}

/** Returns a deep clone of user preferences for provider isolation. */
export function cloneUserPreferences(preferences: UserPreferences): UserPreferences {
  return structuredClone(preferences);
}
