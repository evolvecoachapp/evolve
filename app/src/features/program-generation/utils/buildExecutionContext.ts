import type { EquipmentItem } from "../../athlete-context/models/EquipmentProfile";
import type { EquipmentCode } from "../../exercise-kb/models/EquipmentRequirement";
import type { ConversationContext } from "../../ai/models/ConversationContext";
import type { WorkflowContext } from "../../workflow/models/WorkflowContext";
import type { AthleteContext } from "../models/WorkoutGenerationRequest";
import type { PipelineExecutionContext } from "../models/PipelineExecutionContext";
import type { WorkoutGenerationRequest } from "../models/WorkoutGenerationRequest";

/** Fixed timestamp keeps generation results deterministic across runs. */
export const FIXED_GENERATION_TIMESTAMP = "2026-07-22T12:00:00.000Z";

/**
 * Build the initial pipeline execution context from a generation request.
 */
export function buildExecutionContext(
  request: WorkoutGenerationRequest,
  generationId: string,
): PipelineExecutionContext {
  const athleteId = request.athleteContext.profile.id;
  const conversationId = resolveConversationId(
    request.conversationContext,
    request.workflowContext,
  );

  return Object.freeze({
    generationId,
    athleteId,
    conversationId,
    workflowNow: request.workflowContext?.now ?? null,
    dayId: request.dayId ?? null,
    weekNumber: request.weekNumber ?? null,
    includeExplanations: request.includeExplanations === true,
    blueprintId: null,
    selectionRequestId: null,
    programmingRequestId: null,
    progressionRequestId: null,
    adaptationRequestId: null,
    assemblyRequestId: null,
    sessionId: null,
  });
}

/**
 * Derive a stable generation id from athlete + conversation identifiers.
 */
export function buildGenerationId(
  athleteContext: AthleteContext,
  conversationContext?: ConversationContext,
  workflowContext?: WorkflowContext,
): string {
  const athleteId = athleteContext.profile.id;
  const conversationId =
    resolveConversationId(conversationContext, workflowContext) ?? "none";
  return `generation:${athleteId}:${conversationId}`;
}

function resolveConversationId(
  conversationContext?: ConversationContext,
  workflowContext?: WorkflowContext,
): string | null {
  if (conversationContext?.conversationId) {
    return conversationContext.conversationId;
  }
  if (workflowContext?.conversationId) {
    return workflowContext.conversationId;
  }
  return null;
}

/**
 * Resolve equipment for selection: explicit request override, else athlete inventory.
 */
export function resolveAvailableEquipment(
  request: WorkoutGenerationRequest,
): readonly EquipmentCode[] | undefined {
  if (request.availableEquipment !== undefined) {
    return request.availableEquipment;
  }
  return mapAthleteEquipment(request.athleteContext.profile.equipment.available);
}

function mapAthleteEquipment(
  items: readonly EquipmentItem[],
): readonly EquipmentCode[] {
  const mapped = items
    .map(mapEquipmentItem)
    .filter((code): code is EquipmentCode => code !== null);
  return Object.freeze([...new Set(mapped)]);
}

function mapEquipmentItem(item: EquipmentItem): EquipmentCode | null {
  switch (item) {
    case "barbell":
    case "dumbbell":
    case "kettlebell":
    case "machine":
    case "cable":
    case "smith_machine":
    case "bodyweight":
    case "other":
      return item;
    case "resistance_band":
      return "band";
    case "specialty_bar":
      return "other";
    default:
      return null;
  }
}
