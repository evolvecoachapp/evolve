import { useEffect, useState } from "react";
import {
  getCoachInsightsSnapshot,
  type CoachInsightsSnapshot,
} from "../application";
import {
  coachIntelligenceRepository,
  type CoachIntelligenceRepository,
} from "../repository";

interface UseCoachInsightsOptions {
  repository?: CoachIntelligenceRepository;
  referenceDate?: Date;
}

/**
 * Loads structured coach intelligence via the application layer.
 * Presentation must not talk to storage or compute insights inline.
 */
export function useCoachInsights({
  repository = coachIntelligenceRepository,
  referenceDate,
}: UseCoachInsightsOptions = {}) {
  const [snapshot, setSnapshot] = useState<CoachInsightsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getCoachInsightsSnapshot({ repository, referenceDate })
      .then((next) => {
        if (cancelled) {
          return;
        }
        setSnapshot(next);
        setLoading(false);
      })
      .catch((caughtError: unknown) => {
        if (cancelled) {
          return;
        }
        setSnapshot(null);
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to load coach insights.",
        );
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [repository, referenceDate]);

  return {
    summary: snapshot?.summary ?? null,
    insights: snapshot?.insights ?? Object.freeze([]),
    riskFlags: snapshot?.riskFlags ?? Object.freeze([]),
    recommendations: snapshot?.recommendations ?? Object.freeze([]),
    loading,
    error,
  };
}
