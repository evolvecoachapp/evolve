import { InMemoryExerciseKnowledgeRepository } from "../../../exercise-kb/repository";
import { createExerciseKnowledgeService } from "../../../exercise-kb/services";
import { InMemorySelectionRepository } from "../../repository";
import {
  createEmptyExerciseSelectionService,
  createExerciseSelectionService,
  ExerciseSelectionService,
} from "../index";
import {
  createSelectionCatalog,
  createUpperBodySelectionRequest,
} from "../../testSupport/fixtures";

describe("ExerciseSelectionService factory", () => {
  it("creates a wired service that can select", async () => {
    const service = createExerciseSelectionService({
      knowledgeService: createExerciseKnowledgeService(
        new InMemoryExerciseKnowledgeRepository(createSelectionCatalog()),
      ),
      repository: new InMemorySelectionRepository(),
    });

    expect(service).toBeInstanceOf(ExerciseSelectionService);
    const result = await service.selectExercises(
      createUpperBodySelectionRequest({
        availableEquipment: ["barbell", "dumbbell", "cable", "machine"],
      }),
    );
    expect(result.groups.length).toBe(3);
  });

  it("createEmptyExerciseSelectionService uses an empty catalog", async () => {
    const service = createEmptyExerciseSelectionService();
    const result = await service.selectExercises(
      createUpperBodySelectionRequest(),
    );
    expect(result.candidates).toEqual([]);
  });
});
