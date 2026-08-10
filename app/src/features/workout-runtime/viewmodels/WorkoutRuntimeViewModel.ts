import {
  completeWorkoutSet,
  finishWorkout,
  loadWorkoutRuntime,
  navigateWorkout,
  pauseRestTimer,
  refreshWorkoutRuntime,
  resumeRestTimer,
  startRestTimer,
  tickRestTimer,
  updateWorkoutSet,
} from "../application";
import { createWorkoutNotes } from "../models/experience/WorkoutNotes";
import type { WorkoutErrorState } from "../models/experience/WorkoutErrorState";
import { createWorkoutErrorState } from "../models/experience/WorkoutErrorState";
import type { WorkoutExercise } from "../models/experience/WorkoutExercise";
import type { WorkoutLoadingState } from "../models/experience/WorkoutLoadingState";
import {
  createWorkoutLoadingState,
  WorkoutLoadingStatuses,
} from "../models/experience/WorkoutLoadingState";
import type { WorkoutRuntime } from "../models/experience/WorkoutRuntime";
import type { WorkoutSet } from "../models/experience/WorkoutSet";
import { rebuildWorkoutRuntime } from "../mappers";
import {
  WorkoutRuntimeExperienceError,
  type WorkoutRuntimeExperienceService,
} from "../services/experience";

export interface WorkoutRuntimeViewModelDeps {
  readonly service?: WorkoutRuntimeExperienceService;
  readonly athleteId?: string;
  readonly now?: () => Date;
}

/**
 * Workout Runtime ViewModel — application orchestration only.
 * Production path applies hydrated workspace output via applyHydratedWorkout().
 */
export class WorkoutRuntimeViewModel {
  private readonly service: WorkoutRuntimeExperienceService | null;
  private readonly athleteId: string | null;
  private readonly now: () => Date;
  private readonly listeners = new Set<() => void>();

  private _runtime: WorkoutRuntime | null = null;
  private _loading: WorkoutLoadingState;
  private _error: WorkoutErrorState | null = null;
  private _finishDialogVisible = false;

  constructor(deps: WorkoutRuntimeViewModelDeps = {}) {
    this.service = deps.service ?? null;
    this.athleteId = deps.athleteId ?? null;
    this.now = deps.now ?? (() => new Date());
    this._loading = createWorkoutLoadingState(
      this.service
        ? WorkoutLoadingStatuses.IDLE
        : WorkoutLoadingStatuses.LOADING,
    );
  }

  /** True when the ViewModel is driven by hydrated workspace instead of WorkoutRuntimeExperienceService. */
  get isRuntimeDriven(): boolean {
    return this.service === null;
  }

  get runtime(): WorkoutRuntime | null {
    return this._runtime;
  }

  get loading(): WorkoutLoadingState {
    return this._loading;
  }

  get error(): WorkoutErrorState | null {
    return this._error;
  }

  get isEmpty(): boolean {
    return this._runtime?.isEmpty === true;
  }

  get finishDialogVisible(): boolean {
    return this._finishDialogVisible;
  }

  currentExercise(): WorkoutExercise | null {
    if (!this._runtime) {
      return null;
    }
    return this._runtime.exercises[this._runtime.currentExerciseIndex] ?? null;
  }

  currentSet(): WorkoutSet | null {
    const exercise = this.currentExercise();
    if (!exercise || !this._runtime) {
      return null;
    }
    return exercise.sets[this._runtime.currentSetIndex] ?? null;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async loadWorkout(): Promise<void> {
    if (!this.service) {
      return;
    }

    this._loading = createWorkoutLoadingState(WorkoutLoadingStatuses.LOADING);
    this._error = null;
    this.notify();

    try {
      this._runtime = await loadWorkoutRuntime({ service: this.service });
      this._loading = createWorkoutLoadingState(WorkoutLoadingStatuses.IDLE);
      this._error = null;
    } catch (caught: unknown) {
      this._runtime = null;
      this._loading = createWorkoutLoadingState(WorkoutLoadingStatuses.IDLE);
      this._error = this.toErrorState(caught);
    }

    this.notify();
  }

  async refresh(): Promise<void> {
    if (!this.service) {
      return;
    }

    this._loading = createWorkoutLoadingState(WorkoutLoadingStatuses.REFRESHING);
    this._error = null;
    this.notify();

    try {
      this._runtime = await refreshWorkoutRuntime({ service: this.service });
      this._loading = createWorkoutLoadingState(WorkoutLoadingStatuses.IDLE);
      this._error = null;
    } catch (caught: unknown) {
      this._loading = createWorkoutLoadingState(WorkoutLoadingStatuses.IDLE);
      this._error = this.toErrorState(caught);
    }

    this.notify();
  }

  /** Applies a workout projected from hydrated Unified Workspace output. */
  applyHydratedWorkout(runtime: WorkoutRuntime): void {
    this._runtime = runtime;
    this._loading = createWorkoutLoadingState(WorkoutLoadingStatuses.IDLE);
    this._error = null;
    this.notify();
  }

  /** Re-applies hydrated workspace output (runtime production refresh path). */
  refreshFromHydratedWorkout(runtime: WorkoutRuntime | null): void {
    this._loading = createWorkoutLoadingState(WorkoutLoadingStatuses.REFRESHING);
    this._error = null;
    this.notify();

    if (runtime) {
      this.applyHydratedWorkout(runtime);
      return;
    }

    this._runtime = null;
    this._loading = createWorkoutLoadingState(WorkoutLoadingStatuses.IDLE);
    this._error = createWorkoutErrorState(
      "Workout runtime unavailable.",
      "workout_runtime_unavailable",
    );
    this.notify();
  }

  /** Surfaces missing or unavailable hydrated workout output to the Workout UI. */
  applyWorkoutFailure(message: string): void {
    this._runtime = null;
    this._loading = createWorkoutLoadingState(WorkoutLoadingStatuses.IDLE);
    this._error = createWorkoutErrorState(message, "workout_runtime_unavailable");
    this.notify();
  }

  completeSet(): void {
    if (!this._runtime) {
      return;
    }
    this._runtime = completeWorkoutSet(this._runtime, {
      now: this.now(),
    });
    this.notify();
  }

  skipExercise(): void {
    if (!this._runtime) {
      return;
    }
    this._runtime = navigateWorkout(this._runtime, "skip");
    this.notify();
  }

  nextExercise(): void {
    if (!this._runtime) {
      return;
    }
    this._runtime = navigateWorkout(this._runtime, "next");
    this.notify();
  }

  previousExercise(): void {
    if (!this._runtime) {
      return;
    }
    this._runtime = navigateWorkout(this._runtime, "previous");
    this.notify();
  }

  goToExercise(index: number): void {
    if (!this._runtime) {
      return;
    }
    this._runtime = navigateWorkout(this._runtime, index);
    this.notify();
  }

  updateWeight(weight: number | null): void {
    if (!this._runtime) {
      return;
    }
    this._runtime = updateWorkoutSet(this._runtime, { weight });
    this.notify();
  }

  updateRepetitions(repetitions: number | null): void {
    if (!this._runtime) {
      return;
    }
    this._runtime = updateWorkoutSet(this._runtime, { repetitions });
    this.notify();
  }

  updateRPE(rpe: number | null): void {
    if (!this._runtime) {
      return;
    }
    this._runtime = updateWorkoutSet(this._runtime, { rpe });
    this.notify();
  }

  updateNotes(sessionNotes: string): void {
    if (!this._runtime) {
      return;
    }
    this._runtime = rebuildWorkoutRuntime(this._runtime, {
      notes: createWorkoutNotes(sessionNotes, this.now().toISOString()),
    });
    this.notify();
  }

  startRestTimer(targetSeconds?: number): void {
    if (!this._runtime) {
      return;
    }
    const seconds =
      targetSeconds ?? this.currentSet()?.restSeconds ?? 90;
    this._runtime = startRestTimer(this._runtime, seconds);
    this.notify();
  }

  pauseRestTimer(): void {
    if (!this._runtime) {
      return;
    }
    this._runtime = pauseRestTimer(this._runtime);
    this.notify();
  }

  resumeRestTimer(): void {
    if (!this._runtime) {
      return;
    }
    this._runtime = resumeRestTimer(this._runtime);
    this.notify();
  }

  tickRestTimer(): void {
    if (!this._runtime) {
      return;
    }
    this._runtime = tickRestTimer(this._runtime);
    this.notify();
  }

  tickDuration(): void {
    if (!this._runtime || this._runtime.state.isCompleted) {
      return;
    }
    if (!this._runtime.startedAt && this._runtime.progress.completedSets === 0) {
      return;
    }
    this._runtime = rebuildWorkoutRuntime(this._runtime, {
      durationSeconds: this._runtime.progress.durationSeconds + 1,
      startedAt: this._runtime.startedAt ?? this.now().toISOString(),
    });
    this.notify();
  }

  openFinishDialog(): void {
    this._finishDialogVisible = true;
    this.notify();
  }

  closeFinishDialog(): void {
    this._finishDialogVisible = false;
    this.notify();
  }

  async finishWorkout(): Promise<void> {
    if (!this._runtime) {
      return;
    }

    try {
      this._runtime = await finishWorkout(this._runtime, {
        service: this.service ?? undefined,
        now: this.now(),
        athleteId: this.athleteId ?? undefined,
        programName: this._runtime.subtitle,
        publishProgress: this.isRuntimeDriven && !!this.athleteId,
      });
      this._finishDialogVisible = false;
      this._error = null;
    } catch (caught: unknown) {
      this._error = this.toErrorState(caught);
    }

    this.notify();
  }

  private toErrorState(caught: unknown): WorkoutErrorState {
    if (caught instanceof WorkoutRuntimeExperienceError) {
      return createWorkoutErrorState(
        caught.message,
        "workout_runtime_service_error",
        true,
      );
    }
    if (caught instanceof Error) {
      return createWorkoutErrorState(caught.message);
    }
    return createWorkoutErrorState("Failed to load workout runtime.");
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}
