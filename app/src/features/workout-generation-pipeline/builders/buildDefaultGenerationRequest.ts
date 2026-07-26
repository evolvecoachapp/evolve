import { createAthleteProfile } from "../../athlete-context/testSupport/fixtures";
import type { WorkoutGenerationRequest } from "../../program-generation/models/WorkoutGenerationRequest";
import {
  createUpperBodyBlueprintSource,
  createAthleteContext,
  createConversationContext,
  createWorkflowContext,
  FIXED_GENERATION_TIMESTAMP,
} from "../../program-generation/testSupport/fixtures";

/**
 * Build a deterministic WorkoutGenerationRequest for Coach / pipeline callers.
 * Uses existing domain fixtures as in-memory defaults (no mock generators).
 */
export function buildDefaultGenerationRequest(options: {
  readonly athleteId?: string;
  readonly conversationId?: string | null;
  readonly dayId?: string;
} = {}): WorkoutGenerationRequest {
  const athleteId = options.athleteId ?? "athlete:1";
  const athleteContext = createAthleteContext({
    profile: createAthleteProfile({ id: athleteId }),
  });
  return Object.freeze({
    athleteContext,
    conversationContext: createConversationContext({
      conversationId: options.conversationId ?? "conversation:coach",
    }),
    workflowContext: createWorkflowContext({
      athleteId,
      conversationId: options.conversationId ?? "conversation:coach",
      now: FIXED_GENERATION_TIMESTAMP,
    }),
    blueprintSource: createUpperBodyBlueprintSource(),
    dayId: options.dayId ?? "day-upper",
    availableEquipment: Object.freeze([
      "barbell",
      "dumbbell",
      "cable",
      "machine",
    ] as const),
  });
}
