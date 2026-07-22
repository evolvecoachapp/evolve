import { InMemoryExerciseKnowledgeRepository } from "../../../exercise-kb/repository";
import { createExerciseKnowledgeService } from "../../../exercise-kb/services";
import { createWorkoutBlueprint } from "../../../workout-blueprint/testSupport/fixtures";
import { ExerciseSelectionError } from "../../models/ExerciseSelectionError";
import { InMemorySelectionRepository } from "../../repository";
import { createExerciseSelectionService } from "../../services";
import {
  createLowerBodySelectionRequest,
  createSelectionCatalog,
  createUpperBodySelectionRequest,
} from "../../testSupport/fixtures";
import { ExerciseSelectionEngine } from "../ExerciseSelectionEngine";

function createEngine() {
  const repository = new InMemoryExerciseKnowledgeRepository(
    createSelectionCatalog(),
  );
  const knowledge = createExerciseKnowledgeService(repository);
  return new ExerciseSelectionEngine(knowledge);
}

describe("ExerciseSelectionEngine", () => {
  it("selects deterministic candidates for an upper-body day", async () => {
    const engine = createEngine();
    const request = createUpperBodySelectionRequest({
      availableEquipment: ["barbell", "dumbbell", "cable", "machine"],
      maxCandidatesPerRole: 2,
    });

    const first = await engine.select(request);
    const second = await engine.select(request);

    expect(first.candidates.length).toBeGreaterThan(0);
    expect(first.candidates.map((c) => c.exerciseId)).toEqual(
      second.candidates.map((c) => c.exerciseId),
    );
    expect(first.candidates.map((c) => c.score.total)).toEqual(
      second.candidates.map((c) => c.score.total),
    );
    expect(first.groups.map((g) => g.role)).toEqual([
      "primary",
      "secondary",
      "accessory",
    ]);
  });

  it("never includes sets, reps, or RPE fields on candidates", async () => {
    const engine = createEngine();
    const result = await engine.select(createUpperBodySelectionRequest());
    for (const candidate of result.candidates) {
      expect(candidate).not.toHaveProperty("sets");
      expect(candidate).not.toHaveProperty("reps");
      expect(candidate).not.toHaveProperty("rpe");
      expect(candidate.exercise).not.toHaveProperty("sets");
    }
  });

  it("hard-rejects knee-contraindicated squats on lower-body injury constraint", async () => {
    const engine = createEngine();
    const result = await engine.select(
      createLowerBodySelectionRequest({
        availableEquipment: ["barbell", "dumbbell", "machine"],
      }),
    );

    expect(
      result.rejected.some((entry) => entry.exerciseId === "back-squat"),
    ).toBe(true);
    expect(
      result.candidates.some((entry) => entry.exerciseId === "back-squat"),
    ).toBe(false);
  });

  it("filters unavailable equipment", async () => {
    const engine = createEngine();
    const result = await engine.select(
      createUpperBodySelectionRequest({
        availableEquipment: ["dumbbell"],
      }),
    );

    expect(
      result.candidates.every((candidate) =>
        candidate.exercise.equipment.every(
          (entry) => !entry.required || entry.equipment === "dumbbell",
        ),
      ),
    ).toBe(true);
    expect(
      result.rejected.some((entry) => entry.exerciseId === "bench-press"),
    ).toBe(true);
  });

  it("throws when selecting a rest day", async () => {
    const engine = createEngine();
    await expect(
      engine.select(
        createUpperBodySelectionRequest({
          dayId: "day-rest",
        }),
      ),
    ).rejects.toBeInstanceOf(ExerciseSelectionError);
  });

  it("throws on incompatible blueprint with no training days", async () => {
    const engine = createEngine();
    const blueprint = createWorkoutBlueprint({
      id: "bp-rest-only",
      days: [
        {
          id: "rest-1",
          dayIndex: 0,
          name: "Rest",
          isRestDay: true,
          focus: { primary: "full_body", secondary: null },
          sessionGoal: "rest",
          estimatedDurationMinutes: null,
        },
      ],
    });

    await expect(engine.select({ blueprint })).rejects.toBeInstanceOf(
      ExerciseSelectionError,
    );
  });

  it("omits explanations when includeExplanations is false", async () => {
    const engine = createEngine();
    const result = await engine.select(
      createUpperBodySelectionRequest({ includeExplanations: false }),
    );
    expect(result.explanations).toEqual([]);
    expect(engine.explain(result).length).toBeGreaterThan(0);
  });
});

describe("ExerciseSelectionService", () => {
  it("caches selection results in the repository", async () => {
    const knowledgeRepo = new InMemoryExerciseKnowledgeRepository(
      createSelectionCatalog(),
    );
    const cache = new InMemorySelectionRepository();
    const service = createExerciseSelectionService({
      knowledgeService: createExerciseKnowledgeService(knowledgeRepo),
      repository: cache,
    });

    const result = await service.selectExercises(
      createUpperBodySelectionRequest({
        availableEquipment: ["barbell", "dumbbell", "cable"],
      }),
    );

    const cached = await service.loadCached(result.requestId);
    expect(cached?.requestId).toBe(result.requestId);
    expect(Object.isFrozen(cached)).toBe(true);
  });

  it("previews with a broader candidate cap", async () => {
    const knowledgeRepo = new InMemoryExerciseKnowledgeRepository(
      createSelectionCatalog(),
    );
    const service = createExerciseSelectionService({
      knowledgeService: createExerciseKnowledgeService(knowledgeRepo),
      repository: new InMemorySelectionRepository(),
    });

    const preview = await service.previewExerciseCandidates(
      createUpperBodySelectionRequest({
        availableEquipment: ["barbell", "dumbbell", "cable", "machine"],
      }),
    );

    expect(preview.context.maxCandidatesPerRole).toBe(5);
  });
});
