import { useEffect, useState } from "react";
import { getCoachPrompt } from "../application";
import type { PromptContext } from "../models/coach/PromptContext";
import {
  promptBuilderRepository,
  type PromptBuilderRepository,
} from "../repository";

interface UseCoachPromptOptions {
  repository?: PromptBuilderRepository;
  referenceDate?: Date;
}

/**
 * Loads a structured prompt context via the application layer.
 * Presentation must not talk to storage or format prompts inline.
 */
export function useCoachPrompt({
  repository = promptBuilderRepository,
  referenceDate,
}: UseCoachPromptOptions = {}) {
  const [promptContext, setPromptContext] = useState<PromptContext | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getCoachPrompt({ repository, referenceDate })
      .then((next) => {
        if (cancelled) {
          return;
        }
        setPromptContext(next);
        setLoading(false);
      })
      .catch((caughtError: unknown) => {
        if (cancelled) {
          return;
        }
        setPromptContext(null);
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to load coach prompt.",
        );
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [repository, referenceDate]);

  return {
    promptContext,
    loading,
    error,
  };
}
