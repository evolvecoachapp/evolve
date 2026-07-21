import { useEffect, useState } from "react";
import {
  getRecordsSnapshot,
  type RecordsSnapshot,
} from "../application";
import {
  workoutRecordsRepository,
  type WorkoutRecordsRepository,
} from "../repository";

interface UseWorkoutRecordsOptions {
  repository?: WorkoutRecordsRepository;
}

/**
 * Loads personal records via the application layer.
 * Presentation must not talk to storage or compute records inline.
 */
export function useWorkoutRecords({
  repository = workoutRecordsRepository,
}: UseWorkoutRecordsOptions = {}) {
  const [snapshot, setSnapshot] = useState<RecordsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getRecordsSnapshot({ repository })
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
            : "Failed to load workout records.",
        );
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [repository]);

  return {
    workoutRecord: snapshot?.workoutRecord ?? null,
    exercises: snapshot?.exercises ?? Object.freeze([]),
    summary: snapshot?.summary ?? null,
    loading,
    error,
  };
}
