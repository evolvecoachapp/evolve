import type {
  Subscription,
  User,
  UserPreferences,
  UserProfile,
} from "../models";

export type CurrentUserProviderId = "mock" | "backend";

/** Read-only access to the authenticated user's domain identity and settings. */
export interface CurrentUserService {
  readonly providerId: CurrentUserProviderId;

  /** Loads or refreshes the provider's cached user snapshot from its source. */
  refresh(): Promise<void>;

  getUser(): User | null;

  getProfile(): UserProfile | null;

  getPreferences(): UserPreferences | null;

  getSubscription(): Subscription | null;

  isAuthenticated(): boolean;
}

export class CurrentUserServiceError extends Error {
  constructor(
    message: string,
    readonly providerId?: CurrentUserProviderId,
  ) {
    super(message);
    this.name = "CurrentUserServiceError";
  }
}
