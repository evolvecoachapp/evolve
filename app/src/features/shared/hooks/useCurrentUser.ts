import { useCallback, useEffect, useState } from "react";
import type { Subscription, User, UserPreferences, UserProfile } from "../models";
import {
  currentUserService,
  CurrentUserServiceError,
  type CurrentUserService,
} from "../services";

interface UseCurrentUserOptions {
  service?: CurrentUserService;
}

function formatMemberSince(isoDate: string | null | undefined): string {
  if (!isoDate) {
    return "—";
  }
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatSubscriptionTier(tier: Subscription["tier"] | undefined): string {
  if (!tier) {
    return "Free";
  }
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

export function useCurrentUser({ service = currentUserService }: UseCurrentUserOptions = {}) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<CurrentUserServiceError | null>(null);

  const syncFromService = useCallback(() => {
    setUser(service.getUser());
    setProfile(service.getProfile());
    setPreferences(service.getPreferences());
    setSubscription(service.getSubscription());
  }, [service]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await service.refresh();
      syncFromService();
    } catch (nextError) {
      setUser(null);
      setProfile(null);
      setPreferences(null);
      setSubscription(null);
      setError(
        nextError instanceof CurrentUserServiceError
          ? nextError
          : new CurrentUserServiceError(
              nextError instanceof Error ? nextError.message : "Failed to load the current user.",
              service.providerId,
            ),
      );
    } finally {
      setLoading(false);
    }
  }, [service, syncFromService]);

  useEffect(() => {
    let cancelled = false;

    void refresh().then(() => {
      if (cancelled) {
        return;
      }
    });

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const displayName =
    profile?.displayName ?? profile?.firstName ?? user?.username ?? "User";
  const email = user?.email ?? "user@example.com";
  const memberSince = formatMemberSince(subscription?.memberSince ?? user?.createdAt);
  const subscriptionTier = formatSubscriptionTier(subscription?.tier);

  return {
    user,
    profile,
    preferences,
    subscription,
    displayName,
    email,
    memberSince,
    subscriptionTier,
    loading,
    error,
    isAuthenticated: service.isAuthenticated(),
    refresh,
  };
}
