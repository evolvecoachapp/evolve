import { EquipmentType } from "../../../enums/EquipmentType";
import { ExerciseCategory } from "../../../enums/ExerciseCategory";
import { ExperienceLevel } from "../../../enums/ExperienceLevel";
import { IntensityMetric } from "../../../enums/IntensityMetric";
import { MovementPattern } from "../../../enums/MovementPattern";
import { MuscleGroup } from "../../../enums/MuscleGroup";
import { SetType } from "../../../enums/SetType";
import { TrainingGoal } from "../../../enums/TrainingGoal";
import type { ExerciseDefinition } from "../../../models/ExerciseDefinition";
import type { ExerciseId } from "../../../types/ids";
import { createExerciseLookup } from "../../context/ExerciseLookup";
import type { PlanningContext } from "../../context/PlanningContext";
import type { SelectedExercise } from "../../contracts/ExerciseSelector";
import type { MuscleGroupVolumeTarget, VolumePlanningInput } from "../../contracts/VolumePlanner";
import { RuleBasedVolumePlanner } from "../RuleBasedVolumePlanner";

function id(value: string): ExerciseId {
  return value as ExerciseId;
}

function buildExercise(overrides: Partial<ExerciseDefinition> = {}): ExerciseDefinition {
  return {
    id: id("ex-generic"),
    name: "Generic Exercise",
    category: ExerciseCategory.Compound,
    movementPattern: MovementPattern.HorizontalPush,
    primaryMuscles: [],
    secondaryMuscles: [],
    equipment: [EquipmentType.Barbell],
    isUnilateral: false,
    isBodyweight: false,
    notes: null,
    ...overrides,
  };
}

function buildPlanningContext(
  catalogue: readonly ExerciseDefinition[],
  overrides: Partial<PlanningContext> = {},
): PlanningContext {
  return {
    goal: TrainingGoal.Hypertrophy,
    experienceLevel: ExperienceLevel.Intermediate,
    durationWeeks: 12,
    availableDaysPerWeek: 4,
    availableEquipment: [],
    preferredSplitType: null,
    exerciseLookup: createExerciseLookup(catalogue),
    excludedExerciseIds: [],
    ...overrides,
  };
}

function buildInput(
  planningContext: PlanningContext,
  volumeTargets: readonly MuscleGroupVolumeTarget[],
  selectedExercises: readonly SelectedExercise[],
): VolumePlanningInput {
  return { planningContext, volumeTargets, selectedExercises };
}

describe("RuleBasedVolumePlanner", () => {
  describe("determinism", () => {
    it("produces identical output for two independently constructed but equivalent inputs", () => {
      const planner = new RuleBasedVolumePlanner();
      const bench = buildExercise({ id: id("bench"), primaryMuscles: [MuscleGroup.Chest] });
      const squat = buildExercise({ id: id("squat"), primaryMuscles: [MuscleGroup.Quads] });
      const catalogue = [bench, squat];
      const selected: readonly SelectedExercise[] = [
        { exerciseId: id("bench"), order: 0, targetedMuscles: [MuscleGroup.Chest] },
        { exerciseId: id("squat"), order: 1, targetedMuscles: [MuscleGroup.Quads] },
      ];
      const targets: readonly MuscleGroupVolumeTarget[] = [
        { muscleGroup: MuscleGroup.Chest, weeklySets: 20, setsPerSession: 4 },
        { muscleGroup: MuscleGroup.Quads, weeklySets: 18, setsPerSession: 6 },
      ];

      const resultA = planner.planVolume(buildInput(buildPlanningContext(catalogue), targets, selected));
      const resultB = planner.planVolume(buildInput(buildPlanningContext(catalogue), targets, selected));

      expect(resultA).toEqual(resultB);
    });

    it("produces identical output across repeated calls with the exact same input object", () => {
      const planner = new RuleBasedVolumePlanner();
      const catalogue = [buildExercise({ id: id("row"), primaryMuscles: [MuscleGroup.UpperBack] })];
      const input = buildInput(
        buildPlanningContext(catalogue),
        [{ muscleGroup: MuscleGroup.UpperBack, weeklySets: 10, setsPerSession: 5 }],
        [{ exerciseId: id("row"), order: 0, targetedMuscles: [MuscleGroup.UpperBack] }],
      );

      const first = planner.planVolume(input);
      const second = planner.planVolume(input);

      expect(first).toEqual(second);
    });
  });

  describe("total allocated volume matches requested targets", () => {
    it("assigns a single, exclusive contributor exactly the muscle group's requested sets-per-session", () => {
      const planner = new RuleBasedVolumePlanner();
      const bench = buildExercise({
        id: id("bench-press"),
        name: "Bench Press",
        category: ExerciseCategory.Compound,
        primaryMuscles: [MuscleGroup.Chest],
      });
      const legPress = buildExercise({
        id: id("leg-press"),
        name: "Leg Press",
        category: ExerciseCategory.Compound,
        primaryMuscles: [MuscleGroup.Quads],
      });
      const curl = buildExercise({
        id: id("bicep-curl"),
        name: "Bicep Curl",
        category: ExerciseCategory.Isolation,
        primaryMuscles: [MuscleGroup.Biceps],
      });
      const catalogue = [bench, legPress, curl];

      const selected: readonly SelectedExercise[] = [
        { exerciseId: id("bench-press"), order: 0, targetedMuscles: [MuscleGroup.Chest] },
        { exerciseId: id("leg-press"), order: 1, targetedMuscles: [MuscleGroup.Quads] },
        { exerciseId: id("bicep-curl"), order: 2, targetedMuscles: [MuscleGroup.Biceps] },
      ];
      const targets: readonly MuscleGroupVolumeTarget[] = [
        { muscleGroup: MuscleGroup.Chest, weeklySets: 8, setsPerSession: 4 },
        { muscleGroup: MuscleGroup.Quads, weeklySets: 12, setsPerSession: 6 },
        { muscleGroup: MuscleGroup.Biceps, weeklySets: 6, setsPerSession: 3 },
      ];

      const result = planner.planVolume(buildInput(buildPlanningContext(catalogue), targets, selected));

      // A primary compound lift also receives one extra warm-up set; excluding it isolates
      // the muscle-group volume allocation itself from that unrelated scheme decision.
      const allocatedSetsByExercise = new Map(
        result.assignments.map((assignment) => [
          String(assignment.exerciseId),
          assignment.setPrescriptions.filter((prescription) => prescription.setType !== SetType.Warmup).length,
        ]),
      );

      expect(allocatedSetsByExercise.get("bench-press")).toBe(4);
      expect(allocatedSetsByExercise.get("leg-press")).toBe(6);
      expect(allocatedSetsByExercise.get("bicep-curl")).toBe(3);
    });

    it("splits a muscle group's sets-per-session across multiple contributors so their sum equals the target", () => {
      const planner = new RuleBasedVolumePlanner();
      const flye = buildExercise({
        id: id("cable-flye"),
        name: "Cable Flye",
        category: ExerciseCategory.Isolation,
        primaryMuscles: [MuscleGroup.Chest],
      });
      const pushup = buildExercise({
        id: id("push-up"),
        name: "Push Up",
        category: ExerciseCategory.Accessory,
        primaryMuscles: [MuscleGroup.Chest],
      });
      const catalogue = [flye, pushup];

      const selected: readonly SelectedExercise[] = [
        { exerciseId: id("cable-flye"), order: 0, targetedMuscles: [MuscleGroup.Chest] },
        { exerciseId: id("push-up"), order: 1, targetedMuscles: [MuscleGroup.Chest] },
      ];
      const targets: readonly MuscleGroupVolumeTarget[] = [
        { muscleGroup: MuscleGroup.Chest, weeklySets: 10, setsPerSession: 5 },
      ];

      const result = planner.planVolume(buildInput(buildPlanningContext(catalogue), targets, selected));

      const totalSets = result.assignments.reduce((sum, assignment) => sum + assignment.setPrescriptions.length, 0);
      expect(totalSets).toBe(5);
    });

    it("gives an orphan exercise that targets no requested muscle group the fixed fallback set count", () => {
      const planner = new RuleBasedVolumePlanner();
      const calfRaise = buildExercise({
        id: id("calf-raise"),
        name: "Calf Raise",
        primaryMuscles: [MuscleGroup.Calves],
      });
      const catalogue = [calfRaise];

      const selected: readonly SelectedExercise[] = [
        { exerciseId: id("calf-raise"), order: 0, targetedMuscles: [MuscleGroup.Calves] },
      ];
      const targets: readonly MuscleGroupVolumeTarget[] = [
        { muscleGroup: MuscleGroup.Chest, weeklySets: 8, setsPerSession: 4 },
      ];

      const result = planner.planVolume(buildInput(buildPlanningContext(catalogue), targets, selected));

      expect(result.assignments).toHaveLength(1);
      expect(result.assignments[0]?.setPrescriptions).toHaveLength(2);
    });
  });

  describe("no negative or invalid values", () => {
    it("never produces a negative set count, invalid rep range, or negative rest across a varied catalogue", () => {
      const planner = new RuleBasedVolumePlanner();
      const squat = buildExercise({
        id: id("back-squat"),
        name: "Back Squat",
        category: ExerciseCategory.Compound,
        movementPattern: MovementPattern.Squat,
        primaryMuscles: [MuscleGroup.Quads, MuscleGroup.Glutes],
        secondaryMuscles: [MuscleGroup.LowerBack],
      });
      const lunge = buildExercise({
        id: id("lunge"),
        name: "Lunge",
        category: ExerciseCategory.Accessory,
        movementPattern: MovementPattern.Lunge,
        primaryMuscles: [MuscleGroup.Quads, MuscleGroup.Glutes],
      });
      const legCurl = buildExercise({
        id: id("leg-curl"),
        name: "Leg Curl",
        category: ExerciseCategory.Isolation,
        movementPattern: MovementPattern.Isolation,
        primaryMuscles: [MuscleGroup.Hamstrings],
      });
      const farmerCarry = buildExercise({
        id: id("farmer-carry"),
        name: "Farmer Carry",
        category: ExerciseCategory.Accessory,
        movementPattern: MovementPattern.Carry,
        primaryMuscles: [MuscleGroup.Core, MuscleGroup.Forearms],
      });
      const catalogue = [squat, lunge, legCurl, farmerCarry];

      const selected: readonly SelectedExercise[] = [
        { exerciseId: id("back-squat"), order: 0, targetedMuscles: [MuscleGroup.Quads, MuscleGroup.Glutes] },
        { exerciseId: id("lunge"), order: 1, targetedMuscles: [MuscleGroup.Quads, MuscleGroup.Glutes] },
        { exerciseId: id("leg-curl"), order: 2, targetedMuscles: [MuscleGroup.Hamstrings] },
        { exerciseId: id("farmer-carry"), order: 3, targetedMuscles: [MuscleGroup.Core, MuscleGroup.Forearms] },
      ];
      const targets: readonly MuscleGroupVolumeTarget[] = [
        { muscleGroup: MuscleGroup.Quads, weeklySets: 14, setsPerSession: 7 },
        { muscleGroup: MuscleGroup.Glutes, weeklySets: 10, setsPerSession: 5 },
        { muscleGroup: MuscleGroup.Hamstrings, weeklySets: 6, setsPerSession: 3 },
        { muscleGroup: MuscleGroup.Core, weeklySets: 4, setsPerSession: 2 },
      ];

      for (const goal of Object.values(TrainingGoal)) {
        for (const experienceLevel of Object.values(ExperienceLevel)) {
          const result = planner.planVolume(
            buildInput(buildPlanningContext(catalogue, { goal, experienceLevel }), targets, selected),
          );

          expect(result.assignments).toHaveLength(selected.length);

          for (const assignment of result.assignments) {
            expect(assignment.setPrescriptions.length).toBeGreaterThanOrEqual(0);

            for (const prescription of assignment.setPrescriptions) {
              expect(prescription.id).toBeTruthy();

              if (typeof prescription.targetReps === "number") {
                expect(prescription.targetReps).toBeGreaterThan(0);
              } else {
                expect(prescription.targetReps.min).toBeGreaterThan(0);
                expect(prescription.targetReps.max).toBeGreaterThanOrEqual(prescription.targetReps.min);
              }

              if (prescription.restSeconds !== null) {
                expect(prescription.restSeconds).toBeGreaterThanOrEqual(0);
              }

              if (prescription.intensity !== null) {
                expect(Number.isFinite(prescription.intensity.value)).toBe(true);
              }

              if (prescription.tempo !== null) {
                expect(prescription.tempo.eccentricSeconds).toBeGreaterThanOrEqual(0);
                expect(prescription.tempo.bottomPauseSeconds).toBeGreaterThanOrEqual(0);
                expect(prescription.tempo.concentricSeconds).toBeGreaterThanOrEqual(0);
                expect(prescription.tempo.topPauseSeconds).toBeGreaterThanOrEqual(0);
              }
            }
          }
        }
      }
    });

    it("never allocates a negative set share even when many contributors compete for a small target", () => {
      const planner = new RuleBasedVolumePlanner();
      const catalogue = Array.from({ length: 6 }, (_, index) =>
        buildExercise({
          id: id(`accessory-${index}`),
          name: `Accessory ${index}`,
          category: ExerciseCategory.Accessory,
          primaryMuscles: [MuscleGroup.Core],
        }),
      );
      const selected: readonly SelectedExercise[] = catalogue.map((exercise, index) => ({
        exerciseId: exercise.id,
        order: index,
        targetedMuscles: [MuscleGroup.Core],
      }));
      const targets: readonly MuscleGroupVolumeTarget[] = [
        { muscleGroup: MuscleGroup.Core, weeklySets: 2, setsPerSession: 1 },
      ];

      const result = planner.planVolume(buildInput(buildPlanningContext(catalogue), targets, selected));

      const total = result.assignments.reduce((sum, assignment) => sum + assignment.setPrescriptions.length, 0);
      expect(total).toBe(1);
      for (const assignment of result.assignments) {
        expect(assignment.setPrescriptions.length).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("representative set-scheme behavior", () => {
    it("gives a primary compound lift under a heavy-strength goal a warmup plus top-set/back-off %1RM scheme", () => {
      const planner = new RuleBasedVolumePlanner();
      const squat = buildExercise({
        id: id("comp-squat"),
        name: "Competition Squat",
        category: ExerciseCategory.Compound,
        movementPattern: MovementPattern.Squat,
        primaryMuscles: [MuscleGroup.Quads],
      });
      const catalogue = [squat];
      const selected: readonly SelectedExercise[] = [
        { exerciseId: id("comp-squat"), order: 0, targetedMuscles: [MuscleGroup.Quads] },
      ];
      const targets: readonly MuscleGroupVolumeTarget[] = [
        { muscleGroup: MuscleGroup.Quads, weeklySets: 3, setsPerSession: 3 },
      ];

      const result = planner.planVolume(
        buildInput(
          buildPlanningContext(catalogue, { goal: TrainingGoal.Powerlifting, experienceLevel: ExperienceLevel.Advanced }),
          targets,
          selected,
        ),
      );

      const prescriptions = result.assignments[0]?.setPrescriptions ?? [];
      expect(prescriptions).toHaveLength(4);
      expect(prescriptions[0]?.setType).toBe(SetType.Warmup);
      expect(prescriptions[1]).toMatchObject({ setType: SetType.TopSet, intensity: { metric: IntensityMetric.PercentageOneRepMax, value: 87 } });
      expect(prescriptions[2]).toMatchObject({ setType: SetType.BackOff, intensity: { metric: IntensityMetric.PercentageOneRepMax, value: 77 } });
      expect(prescriptions[3]).toMatchObject({ setType: SetType.BackOff, intensity: { metric: IntensityMetric.PercentageOneRepMax, value: 77 } });
    });

    it("gives isolation work under a hypertrophy goal a slow controlled tempo and RIR-based working sets", () => {
      const planner = new RuleBasedVolumePlanner();
      const curl = buildExercise({
        id: id("bicep-curl"),
        name: "Bicep Curl",
        category: ExerciseCategory.Isolation,
        movementPattern: MovementPattern.Isolation,
        primaryMuscles: [MuscleGroup.Biceps],
      });
      const catalogue = [curl];
      const selected: readonly SelectedExercise[] = [
        { exerciseId: id("bicep-curl"), order: 0, targetedMuscles: [MuscleGroup.Biceps] },
      ];
      const targets: readonly MuscleGroupVolumeTarget[] = [
        { muscleGroup: MuscleGroup.Biceps, weeklySets: 3, setsPerSession: 3 },
      ];

      const result = planner.planVolume(
        buildInput(
          buildPlanningContext(catalogue, {
            goal: TrainingGoal.Hypertrophy,
            experienceLevel: ExperienceLevel.Intermediate,
          }),
          targets,
          selected,
        ),
      );

      const prescriptions = result.assignments[0]?.setPrescriptions ?? [];
      expect(prescriptions).toHaveLength(3);
      for (const prescription of prescriptions) {
        expect(prescription.setType).toBe(SetType.Working);
        expect(prescription.tempo).toEqual({
          eccentricSeconds: 3,
          bottomPauseSeconds: 1,
          concentricSeconds: 1,
          topPauseSeconds: 0,
        });
        expect(prescription.intensity).toEqual({ metric: IntensityMetric.Rir, value: 2 });
      }
    });
  });
});
