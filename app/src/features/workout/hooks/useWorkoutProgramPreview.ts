import { useMemo, useState } from "react";
import type { AthleteProfile } from "../../training/application";
import {
  createWorkoutPreviewProvider,
  type WorkoutPreviewDay,
  type WorkoutPreviewProvider,
  type WorkoutProgramPreview,
} from "../../training/application";
import { HYPERTROPHY_ATHLETE } from "../../training/application/fixtures";

interface UseWorkoutProgramPreviewOptions {
  /** Athlete profile used for generation. Defaults to the hypertrophy fixture. */
  profile?: AthleteProfile;
  /** Injected provider — useful for tests. */
  provider?: WorkoutPreviewProvider;
}

interface UseWorkoutProgramPreviewResult {
  preview: WorkoutProgramPreview | null;
  selectedDay: WorkoutPreviewDay | null;
  selectDay: (dayId: string) => void;
  loading: boolean;
  error: string | null;
}

function pickDefaultDay(preview: WorkoutProgramPreview): WorkoutPreviewDay | null {
  const days = preview.weeklySchedule.days;
  return days.find((day) => !day.isRestDay) ?? days[0] ?? null;
}

/**
 * Thin React seam over `WorkoutPreviewProvider`.
 * Generation stays in the application layer; this hook only holds UI state.
 */
export function useWorkoutProgramPreview({
  profile = HYPERTROPHY_ATHLETE,
  provider,
}: UseWorkoutProgramPreviewOptions = {}): UseWorkoutProgramPreviewResult {
  const resolvedProvider = useMemo(
    () => provider ?? createWorkoutPreviewProvider(),
    [provider],
  );

  const { preview, error } = useMemo(() => {
    try {
      return {
        preview: resolvedProvider.getPreview(profile),
        error: null as string | null,
      };
    } catch (caughtError: unknown) {
      return {
        preview: null,
        error:
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to generate workout program preview.",
      };
    }
  }, [profile, resolvedProvider]);

  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  const selectedDay = useMemo(() => {
    if (!preview) {
      return null;
    }
    if (selectedDayId !== null) {
      return preview.weeklySchedule.days.find((day) => day.id === selectedDayId) ?? pickDefaultDay(preview);
    }
    return pickDefaultDay(preview);
  }, [preview, selectedDayId]);

  return {
    preview,
    selectedDay,
    selectDay: setSelectedDayId,
    loading: false,
    error,
  };
}
