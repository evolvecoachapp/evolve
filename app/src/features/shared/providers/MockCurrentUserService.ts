import type { Subscription, User, UserPreferences, UserProfile } from "../models";
import { mockCurrentUserData } from "../mocks/currentUserData";
import {
  cloneUserPreferences,
  mapUserToDefaultSubscription,
} from "../utils/userAdapters";
import type { CurrentUserService } from "../services/CurrentUserService";

/** Default provider — returns the seeded local user snapshot. */
export const mockCurrentUserService: CurrentUserService = {
  providerId: "mock",

  async refresh(): Promise<void> {
    // Mock data is static; refresh is a no-op.
  },

  getUser(): User | null {
    return { ...mockCurrentUserData.user };
  },

  getProfile(): UserProfile | null {
    return { ...mockCurrentUserData.profile };
  },

  getPreferences(): UserPreferences | null {
    return cloneUserPreferences(mockCurrentUserData.preferences);
  },

  getSubscription(): Subscription | null {
    return { ...mockCurrentUserData.subscription };
  },

  isAuthenticated(): boolean {
    return true;
  },
};
