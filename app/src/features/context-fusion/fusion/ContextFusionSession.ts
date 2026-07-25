import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import { freezeContext } from "../utils/FreezeContext";

/**
 * In-memory fusion session holding the latest immutable context.
 */
export class ContextFusionSession {
  private context: UnifiedCoachingContext | null = null;

  getContext(): UnifiedCoachingContext | null {
    return this.context;
  }

  put(context: UnifiedCoachingContext): UnifiedCoachingContext {
    this.context = freezeContext(context);
    return this.context;
  }

  clear(): void {
    this.context = null;
  }
}

export function createContextFusionSession(): ContextFusionSession {
  return new ContextFusionSession();
}
