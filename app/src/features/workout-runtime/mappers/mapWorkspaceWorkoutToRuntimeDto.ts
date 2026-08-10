import type { WorkspaceWorkout } from "../../unified-workspace/models/WorkspaceWorkout";
import type { WorkoutRuntimeDto } from "../types/workoutRuntimeDto";

/** Maps a workspace workout projection without an assembled session (empty exercises). */
export function mapWorkspaceWorkoutToRuntimeDto(
  workout: WorkspaceWorkout,
): WorkoutRuntimeDto {
  const present = workout.present === true;
  const title = workout.planName?.trim() || workout.summary.trim() || "Workout";

  return Object.freeze({
    id: workout.planId ?? `workout:${workout.athleteId}`,
    title: present ? title : "No Workout",
    subtitle: workout.currentPhase?.trim() || "Today's workout",
    muscleGroups: workout.summary.trim(),
    exercises: Object.freeze([]),
    sessionNotes: "",
    startedAt: null,
    empty: !present,
  });
}
