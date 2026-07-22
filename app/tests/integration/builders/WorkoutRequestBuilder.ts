import type { EquipmentCode } from "../../../src/features/exercise-kb/models/EquipmentRequirement";
import type { ExerciseDifficultyLevel } from "../../../src/features/exercise-kb/models/ExerciseDifficulty";
import type { ConversationContext } from "../../../src/features/ai/models/ConversationContext";
import type { ProgressionWindow } from "../../../src/features/progression/models/ProgressionWindow";
import type { WorkflowContext } from "../../../src/features/workflow/models/WorkflowContext";
import type { WorkoutBlueprintAIOutput } from "../../../src/features/workout-blueprint/models/WorkoutBlueprintAIOutput";
import {
  createUpperBodyBlueprintSource,
  createWorkoutGenerationRequest,
} from "../../../src/features/program-generation/testSupport/fixtures";
import type {
  AthleteContext,
  WorkoutGenerationRequest,
} from "../../../src/features/program-generation/models/WorkoutGenerationRequest";
import type { AthleteFixture } from "../shared/types";
import { buildConversation } from "./ConversationBuilder";
import { buildWorkflow } from "./WorkflowBuilder";

type RequestDraft = {
  athleteContext?: AthleteContext;
  conversationContext?: ConversationContext;
  workflowContext?: WorkflowContext;
  blueprintSource?: WorkoutBlueprintAIOutput | unknown;
  dayId?: string;
  weekNumber?: number;
  availableEquipment?: readonly EquipmentCode[];
  maxDifficulty?: ExerciseDifficultyLevel;
  excludedExerciseIds?: readonly string[];
  progressionWindow?: ProgressionWindow;
  includeExplanations?: boolean;
};

/**
 * Fluent builder for immutable WorkoutGenerationRequest values.
 */
export class WorkoutRequestBuilder {
  private athleteContext: AthleteContext | undefined;
  private conversationContext: ConversationContext | undefined | null;
  private workflowContext: WorkflowContext | undefined | null;
  private blueprintSource: WorkoutBlueprintAIOutput | unknown | undefined;
  private dayId: string | undefined = "day-upper";
  private weekNumber: number | undefined;
  private availableEquipment: readonly EquipmentCode[] | undefined;
  private maxDifficulty: ExerciseDifficultyLevel | undefined;
  private excludedExerciseIds: readonly string[] | undefined;
  private progressionWindow: ProgressionWindow | undefined;
  private includeExplanations: boolean | undefined = true;
  private omitConversation = false;
  private omitWorkflow = false;

  withAthlete(athlete: AthleteContext | AthleteFixture): this {
    this.athleteContext =
      "athleteContext" in athlete ? athlete.athleteContext : athlete;
    return this;
  }

  withConversation(conversation: ConversationContext | null): this {
    this.conversationContext = conversation;
    this.omitConversation = conversation === null;
    return this;
  }

  withWorkflow(workflow: WorkflowContext | null): this {
    this.workflowContext = workflow;
    this.omitWorkflow = workflow === null;
    return this;
  }

  withBlueprintSource(blueprintSource: WorkoutBlueprintAIOutput | unknown): this {
    this.blueprintSource = blueprintSource;
    return this;
  }

  withDefaultUpperBodyBlueprint(): this {
    this.blueprintSource = createUpperBodyBlueprintSource();
    this.dayId = "day-upper";
    return this;
  }

  withDayId(dayId: string): this {
    this.dayId = dayId;
    return this;
  }

  withWeekNumber(weekNumber: number): this {
    this.weekNumber = weekNumber;
    return this;
  }

  withEquipment(equipment: readonly EquipmentCode[]): this {
    this.availableEquipment = Object.freeze([...equipment]);
    return this;
  }

  withMaxDifficulty(maxDifficulty: ExerciseDifficultyLevel): this {
    this.maxDifficulty = maxDifficulty;
    return this;
  }

  withExcludedExercises(ids: readonly string[]): this {
    this.excludedExerciseIds = Object.freeze([...ids]);
    return this;
  }

  withProgressionWindow(window: ProgressionWindow): this {
    this.progressionWindow = window;
    return this;
  }

  withExplanations(include: boolean): this {
    this.includeExplanations = include;
    return this;
  }

  /**
   * Wire conversation + workflow ids to the athlete when present.
   */
  alignedContexts(): this {
    if (!this.athleteContext) {
      throw new Error(
        "WorkoutRequestBuilder.alignedContexts requires withAthlete() first",
      );
    }
    const athleteId = this.athleteContext.profile.id;
    const conversationId = `conversation:${athleteId}`;
    this.conversationContext = buildConversation().withId(conversationId).build();
    this.workflowContext = buildWorkflow()
      .withAthleteId(athleteId)
      .withConversationId(conversationId)
      .build();
    this.omitConversation = false;
    this.omitWorkflow = false;
    return this;
  }

  build(): WorkoutGenerationRequest {
    if (!this.athleteContext) {
      throw new Error("WorkoutRequestBuilder requires withAthlete()");
    }

    const draft: RequestDraft = {
      athleteContext: this.athleteContext,
      blueprintSource:
        this.blueprintSource ?? createUpperBodyBlueprintSource(),
      dayId: this.dayId,
      weekNumber: this.weekNumber,
      maxDifficulty: this.maxDifficulty,
      excludedExerciseIds: this.excludedExerciseIds,
      progressionWindow: this.progressionWindow,
      includeExplanations: this.includeExplanations,
    };

    if (this.availableEquipment !== undefined) {
      draft.availableEquipment = this.availableEquipment;
    }

    if (this.omitConversation) {
      draft.conversationContext = undefined;
    } else if (
      this.conversationContext !== undefined &&
      this.conversationContext !== null
    ) {
      draft.conversationContext = this.conversationContext;
    } else {
      draft.conversationContext = buildConversation()
        .withId(`conversation:${this.athleteContext.profile.id}`)
        .build();
    }

    if (this.omitWorkflow) {
      draft.workflowContext = undefined;
    } else if (
      this.workflowContext !== undefined &&
      this.workflowContext !== null
    ) {
      draft.workflowContext = this.workflowContext;
    } else {
      draft.workflowContext = buildWorkflow()
        .withAthleteId(this.athleteContext.profile.id)
        .withConversationId(
          draft.conversationContext?.conversationId ??
            `conversation:${this.athleteContext.profile.id}`,
        )
        .build();
    }

    return createWorkoutGenerationRequest(draft);
  }
}

export function buildWorkoutRequest(): WorkoutRequestBuilder {
  return new WorkoutRequestBuilder();
}
