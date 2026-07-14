import type { WorkoutDay, WorkoutExercise, WorkoutProgram, WorkoutWeek } from "../types";

/** Locate a week by its 1-based week number. */
export function findWeek(program: WorkoutProgram, weekNumber: number): WorkoutWeek | undefined {
  return program.weeks.find((week) => week.weekNumber === weekNumber);
}

/** Locate a day within a week by its 1-based day number. */
export function findDay(week: WorkoutWeek, dayNumber: number): WorkoutDay | undefined {
  return week.days.find((day) => day.dayNumber === dayNumber);
}

/** Resolve a program day from week and day numbers. */
export function findProgramDay(
  program: WorkoutProgram,
  weekNumber: number,
  dayNumber: number,
): WorkoutDay | undefined {
  const week = findWeek(program, weekNumber);
  return week ? findDay(week, dayNumber) : undefined;
}

/** Count total working sets across all exercises in a day. */
export function countWorkingSets(day: WorkoutDay): number {
  return day.exercises.reduce((total, exercise) => total + exercise.workingSets.length, 0);
}

/** Count completed working sets across all exercises in a day. */
export function countCompletedWorkingSets(exercises: WorkoutExercise[]): number {
  return exercises.reduce(
    (total, exercise) =>
      total + exercise.workingSets.filter((set) => set.completed).length,
    0,
  );
}

/** Deep-clone exercises so session mutations do not alter program templates. */
export function cloneExercises(exercises: WorkoutExercise[]): WorkoutExercise[] {
  return exercises.map((exercise) => ({
    ...exercise,
    warmupSets: exercise.warmupSets.map((set) => ({ ...set })),
    workingSets: exercise.workingSets.map((set) => ({ ...set })),
  }));
}

/** Session completion ratio based on working sets only (0–1). */
export function sessionProgress(exercises: WorkoutExercise[]): number {
  const total = exercises.reduce((sum, exercise) => sum + exercise.workingSets.length, 0);
  if (total === 0) {
    return 0;
  }
  return countCompletedWorkingSets(exercises) / total;
}
