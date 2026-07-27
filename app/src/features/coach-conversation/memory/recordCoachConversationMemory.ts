import { buildMemoryEntry } from "../../conversation-memory/builders/MemoryEntryBuilder";
import { MemoryCategories } from "../../conversation-memory/models/MemoryCategory";
import type { MemoryResult } from "../../conversation-memory/models/MemoryResult";
import { MemoryPriorities } from "../../conversation-memory/models/MemoryPriority";
import { MemoryScopes } from "../../conversation-memory/models/MemoryScope";
import type { ConversationMemoryService } from "../../conversation-memory/services/ConversationMemoryService";
import type { CoachConversationContext } from "../models/CoachConversationContext";
import type { CoachConversationResponse } from "../models/CoachConversationResponse";

/**
 * Records coaching turn facts into existing Conversation Memory — no duplicated context.
 */
export function recordCoachConversationMemory(options: {
  readonly memory: ConversationMemoryService;
  readonly context: CoachConversationContext;
  readonly response: CoachConversationResponse;
  readonly clock: () => string;
}): MemoryResult {
  const { memory, context, response, clock } = options;
  const now = clock();

  memory.saveMemory(
    buildMemoryEntry({
      id: `mem:ctx:${context.id}`,
      category: MemoryCategories.CONTEXT,
      key: "active_coach_intent",
      value: context.intent,
      summary: `Last coaching intent: ${context.intent}`,
      athleteId: context.athleteId,
      conversationId: context.conversationId,
      sessionId: context.sessionId,
      scope: MemoryScopes.CONVERSATION,
      priority: MemoryPriorities.NORMAL,
      createdAt: now,
    }),
  );

  if (context.workoutPlan) {
    memory.saveMemory(
      buildMemoryEntry({
        id: `mem:plan:${context.conversationId}`,
        category: MemoryCategories.CONTEXT,
        key: "active_workout_plan",
        value: context.workoutPlan.id,
        summary: context.workoutPlan.summary.message,
        athleteId: context.athleteId,
        conversationId: context.conversationId,
        sessionId: context.sessionId,
        scope: MemoryScopes.CONVERSATION,
        priority: MemoryPriorities.HIGH,
        createdAt: now,
      }),
    );
  }

  return memory.saveMemory(
    buildMemoryEntry({
      id: `mem:summary:${response.id}`,
      category: MemoryCategories.SUMMARY,
      key: "last_coach_reply",
      value: response.message.slice(0, 500),
      summary: `Coach reply (${response.intent})`,
      athleteId: context.athleteId,
      conversationId: context.conversationId,
      sessionId: context.sessionId,
      scope: MemoryScopes.CONVERSATION,
      priority: MemoryPriorities.NORMAL,
      createdAt: now,
    }),
  );
}

export function loadCoachMemoryHints(options: {
  readonly memory: ConversationMemoryService;
  readonly conversationId: string;
}): readonly string[] {
  const snapshot = options.memory.buildMemorySnapshot({
    snapshotId: `snap:${options.conversationId}`,
  });
  const entries = snapshot.snapshot?.entries ?? [];
  return Object.freeze(
    entries
      .filter(
        (entry) =>
          entry.conversationId === options.conversationId &&
          (entry.key === "active_workout_plan" ||
            entry.key === "last_coach_reply" ||
            entry.key === "active_coach_intent"),
      )
      .map((entry) => entry.summary ?? entry.value)
      .slice(0, 5),
  );
}
