import type { OneRepMaxMap, WorkoutDay, WorkoutExercise, WorkoutProgram, WorkoutWeek } from "../types";
import { buildSets } from "../utils";

/** Reference 1RMs (kg) for percentage-based prescriptions in the mock program. */
export const POWERBUILDING_ONE_REP_MAXES: OneRepMaxMap = {
  low_bar_squat: 180,
  bench_press: 120,
  competition_bench: 120,
  deadlift: 220,
  overhead_press: 70,
};

function createExercise(
  id: string,
  name: string,
  muscleGroup: WorkoutExercise["muscleGroup"],
  equipment: WorkoutExercise["equipment"],
  warmupSets: ReturnType<typeof buildSets>,
  workingSets: ReturnType<typeof buildSets>,
  notes: string | null = null,
): WorkoutExercise {
  return {
    id,
    name,
    muscleGroup,
    equipment,
    notes,
    warmupSets,
    workingSets,
  };
}

const week1Day1: WorkoutDay = {
  id: "pb-w1-d1",
  dayNumber: 1,
  label: "Day 1",
  focus: "Squat & Bench Strength",
  estimatedDurationMinutes: 75,
  isRestDay: false,
  exercises: [
    createExercise(
      "ex-low-bar-squat",
      "Low Bar Squat",
      "quads",
      "barbell",
      buildSets("lbs-wu", [
        { targetReps: 5, percentage: 60, oneRepMax: POWERBUILDING_ONE_REP_MAXES.low_bar_squat, restSeconds: 90 },
        { targetReps: 3, percentage: 70, oneRepMax: POWERBUILDING_ONE_REP_MAXES.low_bar_squat, restSeconds: 120 },
        { targetReps: 2, percentage: 80, oneRepMax: POWERBUILDING_ONE_REP_MAXES.low_bar_squat, restSeconds: 150 },
      ]),
      buildSets("lbs-wk", [
        {
          targetReps: 5,
          percentage: 75,
          oneRepMax: POWERBUILDING_ONE_REP_MAXES.low_bar_squat,
          rpe: 7,
          rir: 3,
          restSeconds: 180,
        },
        {
          targetReps: 5,
          percentage: 80,
          oneRepMax: POWERBUILDING_ONE_REP_MAXES.low_bar_squat,
          rpe: 8,
          rir: 2,
          restSeconds: 210,
        },
        {
          targetReps: 4,
          percentage: 82.5,
          oneRepMax: POWERBUILDING_ONE_REP_MAXES.low_bar_squat,
          rpe: 8.5,
          rir: 1.5,
          restSeconds: 240,
        },
      ]),
      "Brace hard, controlled descent, drive out of the hole.",
    ),
    createExercise(
      "ex-bench-press",
      "Bench Press",
      "chest",
      "barbell",
      buildSets("bp-wu", [
        { targetReps: 8, percentage: 50, oneRepMax: POWERBUILDING_ONE_REP_MAXES.bench_press, restSeconds: 60 },
        { targetReps: 5, percentage: 65, oneRepMax: POWERBUILDING_ONE_REP_MAXES.bench_press, restSeconds: 90 },
        { targetReps: 3, percentage: 75, oneRepMax: POWERBUILDING_ONE_REP_MAXES.bench_press, restSeconds: 120 },
      ]),
      buildSets("bp-wk", [
        {
          targetReps: 6,
          percentage: 70,
          oneRepMax: POWERBUILDING_ONE_REP_MAXES.bench_press,
          rpe: 7,
          rir: 3,
          restSeconds: 150,
        },
        {
          targetReps: 5,
          percentage: 75,
          oneRepMax: POWERBUILDING_ONE_REP_MAXES.bench_press,
          rpe: 8,
          rir: 2,
          restSeconds: 180,
        },
        {
          targetReps: 4,
          percentage: 77.5,
          oneRepMax: POWERBUILDING_ONE_REP_MAXES.bench_press,
          rpe: 8.5,
          rir: 1.5,
          restSeconds: 180,
        },
      ]),
      "Pause briefly on chest, leg drive, touch same spot each rep.",
    ),
    createExercise(
      "ex-chest-supported-row",
      "Chest Supported Row",
      "back",
      "machine",
      [],
      buildSets("csr-wk", [
        { targetReps: 10, targetWeight: 50, rpe: 7.5, rir: 2.5, restSeconds: 90 },
        { targetReps: 10, targetWeight: 50, rpe: 8, rir: 2, restSeconds: 90 },
        { targetReps: 10, targetWeight: 50, rpe: 8.5, rir: 1.5, restSeconds: 90 },
      ]),
      "Squeeze at the top, control the eccentric.",
    ),
    createExercise(
      "ex-leg-curl",
      "Leg Curl",
      "hamstrings",
      "machine",
      [],
      buildSets("lc-wk", [
        { targetReps: 12, targetWeight: 35, rpe: 7.5, rir: 2.5, restSeconds: 60 },
        { targetReps: 12, targetWeight: 35, rpe: 8, rir: 2, restSeconds: 60 },
        { targetReps: 12, targetWeight: 37.5, rpe: 8.5, rir: 1.5, restSeconds: 60 },
      ]),
    ),
    createExercise(
      "ex-dumbbell-curl",
      "Dumbbell Curl",
      "biceps",
      "dumbbell",
      [],
      buildSets("dbc-wk", [
        { targetReps: 12, targetWeight: 14, rpe: 7.5, rir: 2.5, restSeconds: 60 },
        { targetReps: 12, targetWeight: 14, rpe: 8, rir: 2, restSeconds: 60 },
        { targetReps: 12, targetWeight: 14, rpe: 8.5, rir: 1.5, restSeconds: 60 },
      ]),
    ),
  ],
};

const week1Day2: WorkoutDay = {
  id: "pb-w1-d2",
  dayNumber: 2,
  label: "Day 2",
  focus: "Deadlift & Overhead Strength",
  estimatedDurationMinutes: 70,
  isRestDay: false,
  exercises: [
    createExercise(
      "ex-deadlift",
      "Deadlift",
      "hamstrings",
      "barbell",
      buildSets("dl-wu", [
        { targetReps: 5, percentage: 50, oneRepMax: POWERBUILDING_ONE_REP_MAXES.deadlift, restSeconds: 90 },
        { targetReps: 3, percentage: 60, oneRepMax: POWERBUILDING_ONE_REP_MAXES.deadlift, restSeconds: 120 },
        { targetReps: 2, percentage: 70, oneRepMax: POWERBUILDING_ONE_REP_MAXES.deadlift, restSeconds: 150 },
      ]),
      buildSets("dl-wk", [
        {
          targetReps: 5,
          percentage: 70,
          oneRepMax: POWERBUILDING_ONE_REP_MAXES.deadlift,
          rpe: 7,
          rir: 3,
          restSeconds: 210,
        },
        {
          targetReps: 4,
          percentage: 75,
          oneRepMax: POWERBUILDING_ONE_REP_MAXES.deadlift,
          rpe: 8,
          rir: 2,
          restSeconds: 240,
        },
        {
          targetReps: 3,
          percentage: 77.5,
          oneRepMax: POWERBUILDING_ONE_REP_MAXES.deadlift,
          rpe: 9,
          rir: 1,
          restSeconds: 270,
        },
      ]),
      "Wedge in, lats tight, bar close on the way up.",
    ),
    createExercise(
      "ex-overhead-press",
      "Overhead Press",
      "shoulders",
      "barbell",
      buildSets("ohp-wu", [
        { targetReps: 8, percentage: 50, oneRepMax: POWERBUILDING_ONE_REP_MAXES.overhead_press, restSeconds: 60 },
        { targetReps: 5, percentage: 65, oneRepMax: POWERBUILDING_ONE_REP_MAXES.overhead_press, restSeconds: 90 },
      ]),
      buildSets("ohp-wk", [
        {
          targetReps: 6,
          percentage: 70,
          oneRepMax: POWERBUILDING_ONE_REP_MAXES.overhead_press,
          rpe: 7.5,
          rir: 2.5,
          restSeconds: 150,
        },
        {
          targetReps: 5,
          percentage: 75,
          oneRepMax: POWERBUILDING_ONE_REP_MAXES.overhead_press,
          rpe: 8,
          rir: 2,
          restSeconds: 180,
        },
        {
          targetReps: 4,
          percentage: 77.5,
          oneRepMax: POWERBUILDING_ONE_REP_MAXES.overhead_press,
          rpe: 8.5,
          rir: 1.5,
          restSeconds: 180,
        },
      ]),
    ),
    createExercise(
      "ex-pull-up",
      "Pull Up",
      "back",
      "bodyweight",
      [],
      buildSets("pu-wk", [
        { targetReps: 8, targetWeight: 0, rpe: 7.5, rir: 2.5, restSeconds: 120 },
        { targetReps: 7, targetWeight: 0, rpe: 8, rir: 2, restSeconds: 120 },
        { targetReps: 6, targetWeight: 0, rpe: 8.5, rir: 1.5, restSeconds: 120 },
      ]),
      "Full ROM, avoid excessive kipping.",
    ),
    createExercise(
      "ex-bulgarian-split-squat",
      "Bulgarian Split Squat",
      "quads",
      "dumbbell",
      [],
      buildSets("bss-wk", [
        { targetReps: 10, targetWeight: 24, rpe: 7.5, rir: 2.5, restSeconds: 90 },
        { targetReps: 10, targetWeight: 24, rpe: 8, rir: 2, restSeconds: 90 },
        { targetReps: 10, targetWeight: 26, rpe: 8.5, rir: 1.5, restSeconds: 90 },
      ]),
      "Per leg — hold dumbbells at sides.",
    ),
    createExercise(
      "ex-triceps-pushdown",
      "Triceps Pushdown",
      "triceps",
      "cable",
      [],
      buildSets("tp-wk", [
        { targetReps: 15, targetWeight: 25, rpe: 7.5, rir: 2.5, restSeconds: 60 },
        { targetReps: 15, targetWeight: 27.5, rpe: 8, rir: 2, restSeconds: 60 },
        { targetReps: 12, targetWeight: 30, rpe: 8.5, rir: 1.5, restSeconds: 60 },
      ]),
    ),
  ],
};

const week1Day3: WorkoutDay = {
  id: "pb-w1-d3",
  dayNumber: 3,
  label: "Day 3",
  focus: "Bench Variation & Hypertrophy",
  estimatedDurationMinutes: 65,
  isRestDay: false,
  exercises: [
    createExercise(
      "ex-competition-bench",
      "Competition Bench",
      "chest",
      "barbell",
      buildSets("cb-wu", [
        {
          targetReps: 6,
          percentage: 55,
          oneRepMax: POWERBUILDING_ONE_REP_MAXES.competition_bench,
          restSeconds: 60,
        },
        {
          targetReps: 4,
          percentage: 70,
          oneRepMax: POWERBUILDING_ONE_REP_MAXES.competition_bench,
          restSeconds: 120,
        },
      ]),
      buildSets("cb-wk", [
        {
          targetReps: 4,
          percentage: 78,
          oneRepMax: POWERBUILDING_ONE_REP_MAXES.competition_bench,
          rpe: 7.5,
          rir: 2.5,
          restSeconds: 180,
        },
        {
          targetReps: 3,
          percentage: 82.5,
          oneRepMax: POWERBUILDING_ONE_REP_MAXES.competition_bench,
          rpe: 8,
          rir: 2,
          restSeconds: 210,
        },
        {
          targetReps: 2,
          percentage: 85,
          oneRepMax: POWERBUILDING_ONE_REP_MAXES.competition_bench,
          rpe: 8.5,
          rir: 1.5,
          restSeconds: 240,
        },
      ]),
      "Competition pause — 1 second on chest.",
    ),
    createExercise(
      "ex-incline-db-press",
      "Incline DB Press",
      "chest",
      "dumbbell",
      [],
      buildSets("idp-wk", [
        { targetReps: 10, targetWeight: 32, rpe: 7.5, rir: 2.5, restSeconds: 90 },
        { targetReps: 10, targetWeight: 32, rpe: 8, rir: 2, restSeconds: 90 },
        { targetReps: 8, targetWeight: 34, rpe: 8.5, rir: 1.5, restSeconds: 90 },
      ]),
      "30° incline, controlled stretch at bottom.",
    ),
    createExercise(
      "ex-lat-pulldown",
      "Lat Pulldown",
      "back",
      "cable",
      [],
      buildSets("lpd-wk", [
        { targetReps: 12, targetWeight: 55, rpe: 7.5, rir: 2.5, restSeconds: 90 },
        { targetReps: 12, targetWeight: 57.5, rpe: 8, rir: 2, restSeconds: 90 },
        { targetReps: 10, targetWeight: 60, rpe: 8.5, rir: 1.5, restSeconds: 90 },
      ]),
    ),
    createExercise(
      "ex-lateral-raise",
      "Lateral Raise",
      "shoulders",
      "dumbbell",
      [],
      buildSets("lr-wk", [
        { targetReps: 15, targetWeight: 10, rpe: 7.5, rir: 2.5, restSeconds: 60 },
        { targetReps: 15, targetWeight: 10, rpe: 8, rir: 2, restSeconds: 60 },
        { targetReps: 12, targetWeight: 12, rpe: 8.5, rir: 1.5, restSeconds: 60 },
      ]),
    ),
    createExercise(
      "ex-face-pull",
      "Face Pull",
      "shoulders",
      "cable",
      [],
      buildSets("fp-wk", [
        { targetReps: 20, targetWeight: 15, rpe: 7, rir: 3, restSeconds: 60 },
        { targetReps: 20, targetWeight: 17.5, rpe: 7.5, rir: 2.5, restSeconds: 60 },
        { targetReps: 15, targetWeight: 20, rpe: 8, rir: 2, restSeconds: 60 },
      ]),
      "External rotation at end range.",
    ),
  ],
};

const week1: WorkoutWeek = {
  id: "pb-w1",
  weekNumber: 1,
  label: "Week 1",
  theme: "Accumulation — moderate volume, RPE 7–8.5",
  days: [week1Day1, week1Day2, week1Day3],
};

/** Full mock powerbuilding program with Week 1 fully prescribed. */
export const powerbuildingProgram: WorkoutProgram = {
  id: "program-powerbuilding-block-1",
  name: "EVOLVE Powerbuilding Block 1",
  description:
    "A 4-week powerbuilding mesocycle blending heavy compound work with hypertrophy accessories. Week 1 establishes baseline RPE and percentage targets.",
  goal: "powerbuilding",
  durationWeeks: 4,
  weeks: [week1],
  metadata: {
    intensityModel: "hybrid",
    oneRepMaxes: POWERBUILDING_ONE_REP_MAXES,
    coachingNotes: [
      "Primary lifts use percentage + RPE double progression.",
      "Accessories are RPE-driven — add load when all sets hit top of rep range at target RPE.",
      "Warmup sets are non-fatiguing — stop well short of failure.",
    ],
    goal: "powerbuilding",
    experienceLevel: "intermediate",
    trainingStyle: "powerbuilding",
    blockLengthWeeks: 4,
    author: "EVOLVE",
    version: "1.0.0",
  },
};

/** Convenience export for screens that only need the first training day. */
export const powerbuildingWeek1Day1 = week1Day1;
