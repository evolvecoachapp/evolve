import type { WorkoutPlan } from "../../workout-generation-pipeline/models/WorkoutPlan";

/**
 * In-memory attachment of the active WorkoutPlan to a coaching conversation.
 * Does not duplicate plan ownership — stores references only.
 */
export class ActiveWorkoutPlanStore {
  private readonly byConversation = new Map<string, WorkoutPlan>();
  private readonly bySession = new Map<string, WorkoutPlan>();

  attach(plan: WorkoutPlan): void {
    if (plan.conversationId) {
      this.byConversation.set(plan.conversationId, plan);
    }
    if (plan.sessionId) {
      this.bySession.set(plan.sessionId, plan);
    }
  }

  getByConversationId(conversationId: string | null): WorkoutPlan | null {
    if (!conversationId) return null;
    return this.byConversation.get(conversationId) ?? null;
  }

  getBySessionId(sessionId: string | null): WorkoutPlan | null {
    if (!sessionId) return null;
    return this.bySession.get(sessionId) ?? null;
  }

  resolve(options: {
    readonly conversationId: string | null;
    readonly sessionId: string | null;
  }): WorkoutPlan | null {
    return (
      this.getByConversationId(options.conversationId) ??
      this.getBySessionId(options.sessionId)
    );
  }

  clear(options: {
    readonly conversationId?: string | null;
    readonly sessionId?: string | null;
  } = {}): void {
    if (options.conversationId) {
      this.byConversation.delete(options.conversationId);
    }
    if (options.sessionId) {
      this.bySession.delete(options.sessionId);
    }
  }
}

export function createActiveWorkoutPlanStore(): ActiveWorkoutPlanStore {
  return new ActiveWorkoutPlanStore();
}
