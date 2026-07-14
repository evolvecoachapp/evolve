import type {
  Subscription,
  User,
  UserPreferences,
  UserProfile,
} from "../models";

/** Read-only access to the authenticated user's domain identity and settings. */
export interface CurrentUserService {
  getUser(): User | null;

  getProfile(): UserProfile | null;

  getPreferences(): UserPreferences | null;

  getSubscription(): Subscription | null;

  isAuthenticated(): boolean;
}

export class CurrentUserServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CurrentUserServiceError";
  }
}
