import { InMemoryExerciseKnowledgeRepository } from "../../../exercise-kb/repository";
import { createExerciseKnowledgeService } from "../../../exercise-kb/services";
import {
  explainSelection,
  previewExerciseCandidates,
  selectExercises,
} from "../index";
import { InMemorySelectionRepository } from "../../repository";
import { createExerciseSelectionService } from "../../services";
import {
  createSelectionCatalog,
  createUpperBodySelectionRequest,
} from "../../testSupport/fixtures";

function createService() {
  return createExerciseSelectionService({
    knowledgeService: createExerciseKnowledgeService(
      new InMemoryExerciseKnowledgeRepository(createSelectionCatalog()),
    ),
    repository: new InMemorySelectionRepository(),
  });
}

describe("exercise-selection application", () => {
  it("selectExercises returns a frozen selection result", async () => {
    const service = createService();
    const result = await selectExercises(
      createUpperBodySelectionRequest({
        availableEquipment: ["barbell", "dumbbell", "cable", "machine"],
      }),
      service,
    );

    expect(result.candidates.length).toBeGreaterThan(0);
    expect(Object.isFrozen(result)).toBe(true);
    expect(result.requestId).toContain("selection:");
  });

  it("previewExerciseCandidates widens the role cap", async () => {
    const service = createService();
    const preview = await previewExerciseCandidates(
      createUpperBodySelectionRequest({
        availableEquipment: ["barbell", "dumbbell", "cable", "machine"],
      }),
      service,
    );
    expect(preview.context.maxCandidatesPerRole).toBe(5);
  });

  it("explainSelection returns explanations for a cached result", async () => {
    const service = createService();
    const result = await selectExercises(
      createUpperBodySelectionRequest({
        availableEquipment: ["barbell", "dumbbell", "cable", "machine"],
      }),
      service,
    );

    const explanations = await explainSelection(result.requestId, service);
    expect(explanations.length).toBe(result.candidates.length);
    expect(explanations[0]?.summaryCode.startsWith("selected_as_")).toBe(true);
  });

  it("explainSelection accepts an in-hand result", async () => {
    const service = createService();
    const result = await selectExercises(
      createUpperBodySelectionRequest({
        availableEquipment: ["barbell", "dumbbell", "cable", "machine"],
        includeExplanations: false,
      }),
      service,
    );
    const explanations = await explainSelection(result, service);
    expect(explanations.length).toBe(result.candidates.length);
  });
});
