import type { ConversationContext } from "../../ai/models/ConversationContext";
import { createAthleteProfile } from "../../athlete-context/testSupport/fixtures";
import { InMemoryExerciseKnowledgeRepository } from "../../exercise-kb/repository";
import { createExerciseKnowledgeService } from "../../exercise-kb/services";
import { InMemorySelectionRepository } from "../../exercise-selection/repository";
import { createExerciseSelectionService } from "../../exercise-selection/services";
import {
  createSelectionCatalog,
  createUpperBodySelectionRequest,
} from "../../exercise-selection/testSupport/fixtures";
import { InMemoryProgrammingRepository } from "../../programming/repository";
import { createProgrammingService } from "../../programming/services";
import { InMemoryProgressionRepository } from "../../progression/repository";
import { createProgressionService } from "../../progression/services";
import { InMemoryTrainingAdaptationRepository } from "../../training-adaptation/repository";
import { createTrainingAdaptationService } from "../../training-adaptation/services";
import type { WorkflowContext } from "../../workflow/models/WorkflowContext";
import { InMemoryWorkoutAssemblyRepository } from "../../workout-assembly/repository";
import { createWorkoutAssemblyService } from "../../workout-assembly/services";
import { InMemoryWorkoutBlueprintRepository } from "../../workout-blueprint/repository";
import { createWorkoutBlueprintService } from "../../workout-blueprint/services";
import {
  createWorkoutBlueprintAIOutput,
  createWorkoutDayBlueprint,
  createWorkoutBlueprint,
} from "../../workout-blueprint/testSupport/fixtures";
import type { AthleteContext } from "../models/WorkoutGenerationRequest";
import type { WorkoutGenerationRequest } from "../models/WorkoutGenerationRequest";
import { createProgramGenerationService } from "../services";
import type { ProgramGenerationService } from "../services";
import { FIXED_GENERATION_TIMESTAMP } from "../utils/buildExecutionContext";

export { FIXED_GENERATION_TIMESTAMP };

/**
 * Deterministic athlete context snapshot for program generation tests.
 */
export function createAthleteContext(
  overrides: {
    readonly profile?: Parameters<typeof createAthleteProfile>[0];
    readonly trainingAgeYears?: number | null;
    readonly capturedAt?: string;
  } = {},
): AthleteContext {
  const profile = createAthleteProfile(overrides.profile);
  return Object.freeze({
    profile,
    trainingAgeYears:
      overrides.trainingAgeYears !== undefined
        ? overrides.trainingAgeYears
        : profile.experience.yearsTraining,
    validation: Object.freeze({
      valid: true,
      issues: Object.freeze([]),
    }),
    capturedAt: overrides.capturedAt ?? FIXED_GENERATION_TIMESTAMP,
  });
}

export function createConversationContext(
  overrides: Partial<ConversationContext> = {},
): ConversationContext {
  return Object.freeze({
    conversationId: overrides.conversationId ?? "conversation-1",
    messages: Object.freeze(overrides.messages ? [...overrides.messages] : []),
  });
}

export function createWorkflowContext(
  overrides: Partial<WorkflowContext> = {},
): WorkflowContext {
  return Object.freeze({
    conversationId: overrides.conversationId ?? "conversation-1",
    athleteId: overrides.athleteId ?? "athlete-1",
    now: overrides.now ?? FIXED_GENERATION_TIMESTAMP,
    metadata: overrides.metadata
      ? Object.freeze({ ...overrides.metadata })
      : undefined,
  });
}

/**
 * Upper-body blueprint AI source aligned with exercise-selection fixtures.
 */
export function createUpperBodyBlueprintSource() {
  const selectionRequest = createUpperBodySelectionRequest({
    availableEquipment: ["barbell", "dumbbell", "cable", "machine"],
  });
  return createWorkoutBlueprintAIOutput({
    id: selectionRequest.blueprint.id,
    split: selectionRequest.blueprint.split,
    priority: selectionRequest.blueprint.priority,
    focus: selectionRequest.blueprint.focus,
    constraints: selectionRequest.blueprint.constraints,
    blocks: selectionRequest.blueprint.blocks,
    days: selectionRequest.blueprint.days,
    weeklyFrequency: selectionRequest.blueprint.weeklyFrequency,
    metadata: selectionRequest.blueprint.metadata,
  });
}

export function createWorkoutGenerationRequest(
  overrides: Partial<WorkoutGenerationRequest> = {},
): WorkoutGenerationRequest {
  const athleteContext = overrides.athleteContext ?? createAthleteContext();
  const blueprintSource =
    overrides.blueprintSource ?? createUpperBodyBlueprintSource();

  return Object.freeze({
    athleteContext,
    conversationContext:
      overrides.conversationContext !== undefined
        ? overrides.conversationContext
        : createConversationContext(),
    workflowContext:
      overrides.workflowContext !== undefined
        ? overrides.workflowContext
        : createWorkflowContext({
            athleteId: athleteContext.profile.id,
          }),
    blueprintSource,
    dayId: overrides.dayId ?? "day-upper",
    weekNumber: overrides.weekNumber,
    availableEquipment: Object.prototype.hasOwnProperty.call(
      overrides,
      "availableEquipment",
    )
      ? overrides.availableEquipment
      : Object.freeze([
          "barbell",
          "dumbbell",
          "cable",
          "machine",
        ] as const),
    maxDifficulty: overrides.maxDifficulty,
    excludedExerciseIds: overrides.excludedExerciseIds,
    progressionWindow: overrides.progressionWindow,
    includeExplanations: overrides.includeExplanations,
  });
}

/**
 * Isolated ProgramGenerationService wired with the selection test catalog.
 */
export function createTestProgramGenerationService(): ProgramGenerationService {
  return createProgramGenerationService({
    blueprintService: createWorkoutBlueprintService(
      new InMemoryWorkoutBlueprintRepository(),
    ),
    selectionService: createExerciseSelectionService({
      knowledgeService: createExerciseKnowledgeService(
        new InMemoryExerciseKnowledgeRepository(createSelectionCatalog()),
      ),
      repository: new InMemorySelectionRepository(),
    }),
    programmingService: createProgrammingService({
      repository: new InMemoryProgrammingRepository(),
    }),
    progressionService: createProgressionService({
      repository: new InMemoryProgressionRepository(),
    }),
    adaptationService: createTrainingAdaptationService({
      repository: new InMemoryTrainingAdaptationRepository(),
    }),
    assemblyService: createWorkoutAssemblyService({
      repository: new InMemoryWorkoutAssemblyRepository(),
    }),
  });
}

/** Re-export blueprint helpers for validator unit tests. */
export {
  createWorkoutBlueprint,
  createWorkoutDayBlueprint,
  createWorkoutBlueprintAIOutput,
};
