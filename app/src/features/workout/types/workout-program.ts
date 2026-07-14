import type {
  ExperienceLevel,
  IntensityModel,
  ProgramGoal,
  TrainingStyle,
} from "./common";
import type { WorkoutWeek } from "./workout-week";

/**
 * Reference maxes keyed by exercise slug — used to derive percentage-based
 * target weights locally until API-backed profiles exist.
 */
export type OneRepMaxMap = Record<string, number>;

/** Program-level metadata reserved for future AI adaptation hooks. */
export interface WorkoutProgramMetadata {
  intensityModel: IntensityModel;
  oneRepMaxes: OneRepMaxMap;
  /** Optional coach/AI notes surfaced to the user or engines later. */
  coachingNotes?: string[];
  /** Mirrors top-level `WorkoutProgram.goal` for self-contained AI context bundles. */
  goal?: ProgramGoal;
  experienceLevel?: ExperienceLevel;
  trainingStyle?: TrainingStyle;
  /** Mesocycle length — may mirror `WorkoutProgram.durationWeeks`. */
  blockLengthWeeks?: number;
  author?: string;
  version?: string;
}
/** A multi-week training block with nested weeks, days, and exercises. */

export interface WorkoutProgram {
  id: string;
  name: string;
  description: string | null;
  goal: ProgramGoal;
  durationWeeks: number;
  weeks: WorkoutWeek[];
  metadata: WorkoutProgramMetadata;
}
