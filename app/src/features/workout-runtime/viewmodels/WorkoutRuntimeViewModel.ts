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
import { mapWorkoutRuntime, rebuildWorkoutRuntime } from "../mappers";
import { WORKOUT_RUNTIME_REST_DAY_ID } from "../mappers/mapBackendWorkoutToExperienceDto";
import {
  WorkoutRuntimeExperienceError,
  type WorkoutRuntimeExperienceService,
} from "../services/experience";
import { persistWorkoutRuntimeMutation } from "../../../runtime/domain-persistence/application/persistWorkoutRuntimeMutation";
import type { WorkoutRuntimeDto } from "../types/workoutRuntimeDto";

export interface WorkoutRuntimeViewModelDeps {
  readonly service?: WorkoutRuntimeExperienceService;
  readonly athleteId?: string;
  readonly now?: () => Date;
}

/**
 * Workout Runtime ViewModel — application orchestration only.
 * Production path loads today's workout through WorkoutRuntimeExperienceService.
 * `applyHydratedWorkout` remains for workspace-hydration tests.
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
  private _mutating = false;

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

  get canStart(): boolean {
    return (
      !!this._runtime &&
      !this._runtime.isEmpty &&
      !this._runtime.startedAt &&
      !this._runtime.state.isCompleted &&
      this._runtime.id !== WORKOUT_RUNTIME_REST_DAY_ID
    );
  }

  get isRestDay(): boolean {
    return this._runtime?.id === WORKOUT_RUNTIME_REST_DAY_ID;
  }

  get canFinishSession(): boolean {
    return (
      !!this._runtime &&
      !this._runtime.isEmpty &&
      !!this._runtime.startedAt &&
      this._runtime.finishedAt === null
    );
  }

  private isBackendSession(): boolean {
    return this.service?.providerId === "backend";
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
    void this.completeSetAsync();
  }

  async completeSetAsync(): Promise<void> {
    if (!this._runtime || this._mutating) {
      return;
    }

    if (this.isBackendSession() && this.service?.saveSet && this._runtime.startedAt) {
      const exercise = this.currentExercise();
      const currentSet = this.currentSet();
      if (!exercise || !currentSet) {
        return;
      }

      this._mutating = true;
      this.notifyListeners();
      try {
        const dto = await this.service.saveSet({
          runtimeId: this._runtime.id,
          exerciseId: exercise.id,
          setId: currentSet.id,
          weight: currentSet.weight,
          repetitions: currentSet.repetitions,
          rpe: currentSet.rpe,
        });
        this.applyExperienceDto(dto, { startRest: true });
        this._error = null;
      } catch (caught: unknown) {
        this._error = this.toErrorState(caught);
      } finally {
        this._mutating = false;
        this.notify();
      }
      return;
    }

    this._runtime = completeWorkoutSet(this._runtime, {
      now: this.now(),
    });
    this.notify();
  }

  async startWorkout(): Promise<void> {
    if (!this.service?.startRuntime || this._mutating) {
      return;
    }

    this._mutating = true;
    this.notifyListeners();
    try {
      const dto = await this.service.startRuntime();
      this.applyExperienceDto(dto);
      this._error = null;
    } catch (caught: unknown) {
      this._error = this.toErrorState(caught);
    } finally {
      this._mutating = false;
      this.notify();
    }
  }

  async advanceRestDay(): Promise<void> {
    if (!this.service?.advanceRestDay || this._mutating) {
      return;
    }

    this._mutating = true;
    this.notifyListeners();
    try {
      const dto = await this.service.advanceRestDay();
      this.applyExperienceDto(dto);
      this._error = null;
    } catch (caught: unknown) {
      this._error = this.toErrorState(caught);
    } finally {
      this._mutating = false;
      this.notify();
    }
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

  /**
   * Ticks are driven by a 1-second interval (`useRestTimer`) for the entire
   * duration of an active workout — unlike every other mutation here, which
   * only fires on a discrete user/service action. Persisting on every tick
   * (via `notify()`) would trigger a full cross-domain write-through/SQLite
   * write every second a workout is running, which is unnecessary I/O for a
   * value that is not itself durable checkpoint data (Sprint 36.6
   * performance audit). Ticks still update local state and notify UI
   * listeners immediately; persistence still happens on every other
   * meaningful mutation (rest timer start/pause/resume, set completion,
   * navigation, finish, etc.), so at most the last few seconds of duration/
   * rest-timer progress since the previous meaningful mutation can be lost
   * on an abnormal termination — an acceptable trade-off, and not a
   * regression introduced by adding any debounce/batching/queue.
   */
  tickRestTimer(): void {
    if (!this._runtime) {
      return;
    }
    this._runtime = tickRestTimer(this._runtime);
    this.notifyListeners();
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
    this.notifyListeners();
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
      if (this.isBackendSession() && this.service) {
        if (!this._runtime.startedAt) {
          this._error = createWorkoutErrorState(
            "Start the workout before finishing.",
            "workout_runtime_not_started",
            true,
          );
          this.notify();
          return;
        }
        await this.service.finishRuntime({
          runtimeId: this._runtime.id,
          sessionNotes: this._runtime.notes.sessionNotes,
        });
        this._finishDialogVisible = false;
        this._error = null;
        await this.refresh();
        return;
      }

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

  private applyExperienceDto(
    dto: WorkoutRuntimeDto,
    options: { startRest?: boolean } = {},
  ): void {
    let runtime = mapWorkoutRuntime({ dto });
    if (options.startRest && !runtime.state.isCompleted && !runtime.isEmpty) {
      const exercise = runtime.exercises[runtime.currentExerciseIndex];
      const nextSet = exercise?.sets[runtime.currentSetIndex];
      if (nextSet && !nextSet.completed) {
        runtime = startRestTimer(runtime, nextSet.restSeconds);
      }
    }
    this._runtime = runtime;
    this._loading = createWorkoutLoadingState(WorkoutLoadingStatuses.IDLE);
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
    this.persistIfRuntimeDriven("mutation");
    this.notifyListeners();
  }

  /** Notifies subscribers without triggering write-through persistence. */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  private persistIfRuntimeDriven(kind: string): void {
    if (!this.isRuntimeDriven || !this.athleteId) {
      return;
    }

    persistWorkoutRuntimeMutation({
      athleteId: this.athleteId,
      requestId: `workout:runtime:${kind}:${this.athleteId}:${this.now().getTime()}`,
      runtime: this._runtime,
    });
  }
}
