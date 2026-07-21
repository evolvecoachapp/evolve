import { useEffect, useState } from "react";
import { getAIConfiguration } from "../application";
import type { AIConfiguration } from "../models/AIConfiguration";
import type { ConfigurationValidationResult } from "../models/ConfigurationValidationResult";
import {
  aiConfigurationRepository,
  type AIConfigurationRepository,
} from "../repository";

interface UseAIConfigurationOptions {
  repository?: AIConfigurationRepository;
}

/**
 * Loads AI configuration and validation via the application layer.
 *
 * Returns raw configuration — no formatting.
 */
export function useAIConfiguration({
  repository = aiConfigurationRepository,
}: UseAIConfigurationOptions = {}) {
  const [configuration, setConfiguration] = useState<AIConfiguration | null>(
    null,
  );
  const [validation, setValidation] =
    useState<ConfigurationValidationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getAIConfiguration({ repository })
      .then((result) => {
        if (cancelled) {
          return;
        }
        setConfiguration(result.configuration);
        setValidation(result.validation);
        setLoading(false);
      })
      .catch((caughtError: unknown) => {
        if (cancelled) {
          return;
        }
        setConfiguration(null);
        setValidation(null);
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to load AI configuration.",
        );
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [repository]);

  return {
    configuration,
    validation,
    loading,
    error,
  };
}
