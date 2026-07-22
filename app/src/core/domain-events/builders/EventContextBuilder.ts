import type { EventContext } from "../models/EventContext";
import { freezeContext } from "../utils/freezeEvents";

export interface BuildEventContextInput {
  readonly sessionId: string;
  readonly workoutRuntimeId?: string | null;
  readonly restRuntimeId?: string | null;
  readonly exerciseRuntimeId?: string | null;
  readonly setRuntimeId?: string | null;
  readonly athleteId?: string | null;
  readonly dayId?: string | null;
  readonly weekNumber?: number | null;
}

/**
 * Fluent builder for EventContext.
 */
export class EventContextBuilder {
  private sessionId = "";
  private workoutRuntimeId: string | null = null;
  private restRuntimeId: string | null = null;
  private exerciseRuntimeId: string | null = null;
  private setRuntimeId: string | null = null;
  private athleteId: string | null = null;
  private dayId: string | null = null;
  private weekNumber: number | null = null;

  withSessionId(sessionId: string): this {
    this.sessionId = sessionId;
    return this;
  }

  withWorkoutRuntimeId(id: string | null): this {
    this.workoutRuntimeId = id;
    return this;
  }

  withRestRuntimeId(id: string | null): this {
    this.restRuntimeId = id;
    return this;
  }

  withExerciseRuntimeId(id: string | null): this {
    this.exerciseRuntimeId = id;
    return this;
  }

  withSetRuntimeId(id: string | null): this {
    this.setRuntimeId = id;
    return this;
  }

  withAthleteId(id: string | null): this {
    this.athleteId = id;
    return this;
  }

  withDayId(id: string | null): this {
    this.dayId = id;
    return this;
  }

  withWeekNumber(weekNumber: number | null): this {
    this.weekNumber = weekNumber;
    return this;
  }

  from(input: BuildEventContextInput): this {
    this.sessionId = input.sessionId;
    this.workoutRuntimeId = input.workoutRuntimeId ?? null;
    this.restRuntimeId = input.restRuntimeId ?? null;
    this.exerciseRuntimeId = input.exerciseRuntimeId ?? null;
    this.setRuntimeId = input.setRuntimeId ?? null;
    this.athleteId = input.athleteId ?? null;
    this.dayId = input.dayId ?? null;
    this.weekNumber = input.weekNumber ?? null;
    return this;
  }

  build(): EventContext {
    return freezeContext({
      sessionId: this.sessionId,
      workoutRuntimeId: this.workoutRuntimeId,
      restRuntimeId: this.restRuntimeId,
      exerciseRuntimeId: this.exerciseRuntimeId,
      setRuntimeId: this.setRuntimeId,
      athleteId: this.athleteId,
      dayId: this.dayId,
      weekNumber: this.weekNumber,
    });
  }
}
