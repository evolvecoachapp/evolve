import type { UserUpdate } from "../../../types/api";
import type { Subscription, User, UserPreferences, UserProfile } from "../models";
import { mockCurrentUserData } from "../mocks/currentUserData";
import {
  cloneUserPreferences,
} from "../utils/userAdapters";
import type { CurrentUserService } from "../services/CurrentUserService";

function buildDisplayName(firstName: string | null, lastName: string | null, username: string): string {
  if (firstName) {
    return `${firstName}${lastName ? ` ${lastName}` : ""}`;
  }
  return username;
}

function createMockSnapshot() {
  return {
    user: { ...mockCurrentUserData.user },
    profile: { ...mockCurrentUserData.profile },
    preferences: cloneUserPreferences(mockCurrentUserData.preferences),
    subscription: { ...mockCurrentUserData.subscription },
  };
}

function createMockCurrentUserService(): CurrentUserService {
  let snapshot = createMockSnapshot();

  return {
    providerId: "mock",

    async refresh(): Promise<void> {
      // Mock data is static unless updated through updateProfile.
    },

    getUser(): User | null {
      return { ...snapshot.user };
    },

    getProfile(): UserProfile | null {
      return { ...snapshot.profile };
    },

    getPreferences(): UserPreferences | null {
      return cloneUserPreferences(snapshot.preferences);
    },

    getSubscription(): Subscription | null {
      return { ...snapshot.subscription };
    },

    isAuthenticated(): boolean {
      return true;
    },

    async updateProfile(data: UserUpdate): Promise<void> {
      const nextProfile: UserProfile = {
        ...snapshot.profile,
        firstName: data.first_name !== undefined ? data.first_name : snapshot.profile.firstName,
        lastName: data.last_name !== undefined ? data.last_name : snapshot.profile.lastName,
        birthDate: data.birth_date !== undefined ? data.birth_date : snapshot.profile.birthDate,
        gender: data.gender !== undefined ? data.gender : snapshot.profile.gender,
        heightCm: data.height_cm !== undefined ? data.height_cm : snapshot.profile.heightCm,
        currentWeightKg:
          data.current_weight_kg !== undefined
            ? data.current_weight_kg
            : snapshot.profile.currentWeightKg,
        targetWeightKg:
          data.target_weight_kg !== undefined
            ? data.target_weight_kg
            : snapshot.profile.targetWeightKg,
        activityLevel:
          data.activity_level !== undefined ? data.activity_level : snapshot.profile.activityLevel,
        goal: data.goal !== undefined ? data.goal : snapshot.profile.goal,
        updatedAt: new Date().toISOString(),
      };

      nextProfile.displayName = buildDisplayName(
        nextProfile.firstName,
        nextProfile.lastName,
        snapshot.user.username,
      );

      snapshot = {
        ...snapshot,
        profile: nextProfile,
        user: {
          ...snapshot.user,
          email: data.email ?? snapshot.user.email,
          username: data.username ?? snapshot.user.username,
          updatedAt: nextProfile.updatedAt,
        },
      };
    },
  };
}

/** Default provider — returns the seeded local user snapshot. */
export const mockCurrentUserService = createMockCurrentUserService();
