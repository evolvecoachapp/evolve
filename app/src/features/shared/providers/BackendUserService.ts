import { getCurrentUser } from "../../../api/auth";
import { updateCurrentUser } from "../../../api/users";
import { ApiError } from "../../../api/client";
import type { UserUpdate } from "../../../types/api";
import type { Subscription, User, UserPreferences, UserProfile } from "../models";
import { mockCurrentUserData } from "../mocks/currentUserData";
import {
  CurrentUserServiceError,
  type CurrentUserService,
} from "../services/CurrentUserService";
import {
  cloneUserPreferences,
  mapUserPublicToProfile,
  mapUserPublicToUser,
  mapUserToDefaultSubscription,
} from "../utils/userAdapters";

interface CachedUserState {
  user: User | null;
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  subscription: Subscription | null;
}

const emptyState: CachedUserState = {
  user: null,
  profile: null,
  preferences: null,
  subscription: null,
};

function createBackendUserService(): CurrentUserService & {
  updateProfile(data: UserUpdate): Promise<void>;
} {
  let cache: CachedUserState = { ...emptyState };

  const service: CurrentUserService & { updateProfile(data: UserUpdate): Promise<void> } = {
    providerId: "backend",

    async refresh(): Promise<void> {
      try {
        const dto = await getCurrentUser();
        const user = mapUserPublicToUser(dto);
        cache = {
          user,
          profile: mapUserPublicToProfile(dto),
          preferences: cloneUserPreferences(mockCurrentUserData.preferences),
          subscription: mapUserToDefaultSubscription(user),
        };
      } catch (error) {
        cache = { ...emptyState };
        if (error instanceof ApiError) {
          throw new CurrentUserServiceError(error.message, "backend");
        }
        throw new CurrentUserServiceError(
          error instanceof Error ? error.message : "Failed to load the current user.",
          "backend",
        );
      }
    },

    getUser(): User | null {
      return cache.user ? { ...cache.user } : null;
    },

    getProfile(): UserProfile | null {
      return cache.profile ? { ...cache.profile } : null;
    },

    getPreferences(): UserPreferences | null {
      return cache.preferences ? cloneUserPreferences(cache.preferences) : null;
    },

    getSubscription(): Subscription | null {
      return cache.subscription ? { ...cache.subscription } : null;
    },

    isAuthenticated(): boolean {
      return cache.user !== null;
    },

    async updateProfile(data: UserUpdate): Promise<void> {
      try {
        const dto = await updateCurrentUser(data);
        const user = mapUserPublicToUser(dto);
        cache = {
          user,
          profile: mapUserPublicToProfile(dto),
          preferences: cache.preferences ?? cloneUserPreferences(mockCurrentUserData.preferences),
          subscription: mapUserToDefaultSubscription(user),
        };
      } catch (error) {
        if (error instanceof ApiError) {
          throw new CurrentUserServiceError(error.message, "backend");
        }
        throw new CurrentUserServiceError(
          error instanceof Error ? error.message : "Failed to update the current user.",
          "backend",
        );
      }
    },
  };

  return service;
}

/** Backend provider — fetches the authenticated user from the EVOLVE API. */
export const backendUserService = createBackendUserService();
