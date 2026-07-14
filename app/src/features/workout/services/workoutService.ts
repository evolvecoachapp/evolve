import { powerbuildingProgram } from "../mocks";
import type { WorkoutDay, WorkoutProgram, WorkoutSession, WorkoutWeek } from "../types";
import { cloneExercises, findProgramDay, findWeek } from "../utils";

let sessionIdCounter = 0;

function createSessionId(): string {
  sessionIdCounter += 1;
  return `session-${sessionIdCounter}`;
}

/**
 * Local mock workout service.
 * Swap implementations behind this interface when wiring the backend in Sprint 5.3.
 */
export const workoutService = {
  /** Returns the user's active program (mock: always the powerbuilding block). */
  getActiveProgram(): WorkoutProgram {
    return powerbuildingProgram;
  },

  /** Fetch a program by ID from the local mock catalog. */
  getProgramById(programId: string): WorkoutProgram | undefined {
    if (programId === powerbuildingProgram.id) {
      return powerbuildingProgram;
    }
    return undefined;
  },

  /** Resolve a specific week within a program. */
  getWeek(programId: string, weekNumber: number): WorkoutWeek | undefined {
    const program = this.getProgramById(programId);
    return program ? findWeek(program, weekNumber) : undefined;
  },

  /** Resolve a specific training day within a program week. */
  getDay(programId: string, weekNumber: number, dayNumber: number): WorkoutDay | undefined {
    const program = this.getProgramById(programId);
    return program ? findProgramDay(program, weekNumber, dayNumber) : undefined;
  },

  /**
   * Create a new in-progress session from a day template.
   * Exercises are cloned so set completion never mutates the program prescription.
   */
  createSession(programId: string, weekNumber: number, dayNumber: number): WorkoutSession | undefined {
    const day = this.getDay(programId, weekNumber, dayNumber);
    if (!day || day.isRestDay) {
      return undefined;
    }

    return {
      id: createSessionId(),
      programId,
      weekNumber,
      dayNumber,
      dayLabel: day.label,
      status: "in_progress",
      startedAt: new Date().toISOString(),
      completedAt: null,
      exercises: cloneExercises(day.exercises),
    };
  },
};

export type WorkoutService = typeof workoutService;
