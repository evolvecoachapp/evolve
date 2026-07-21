import { useCallback, useEffect, useState } from "react";
import {
  getAthleteContext,
  updateAthleteContext,
} from "../application";
import type { AthleteProfile } from "../models/AthleteProfile";
import {
  athleteContextRepository,
  type AthleteContextRepository,
} from "../repository";

interface UseAthleteContextOptions {
  repository?: AthleteContextRepository;
  referenceDate?: Date;
}

/**
 * Presentation adapter for Athlete Context.
 *
 * Returns domain state and update action only — no formatting.
 * Screens must not import the repository directly.
 */
export function useAthleteContext({
  repository = athleteContextRepository,
  referenceDate,
}: UseAthleteContextOptions = {}) {
  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const snapshot = await getAthleteContext({ repository, referenceDate });
      setProfile(snapshot.profile);
      setLoading(false);
    } catch (caughtError: unknown) {
      setProfile(null);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to load athlete context.",
      );
      setLoading(false);
    }
  }, [repository, referenceDate]);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    getAthleteContext({ repository, referenceDate })
      .then((snapshot) => {
        if (cancelled) {
          return;
        }
        setProfile(snapshot.profile);
        setLoading(false);
      })
      .catch((caughtError: unknown) => {
        if (cancelled) {
          return;
        }
        setProfile(null);
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to load athlete context.",
        );
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [repository, referenceDate]);

  const updateProfile = useCallback(
    async (next: AthleteProfile): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const updated = await updateAthleteContext({
          repository,
          profile: next,
        });
        setProfile(updated);
        setLoading(false);
      } catch (caughtError: unknown) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to update athlete context.",
        );
        await reload();
      }
    },
    [repository, reload],
  );

  return {
    profile,
    loading,
    error,
    updateProfile,
  };
}
