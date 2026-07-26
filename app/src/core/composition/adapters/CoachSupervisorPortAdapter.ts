import type {
  CoachSupervisorInvocation,
  CoachSupervisorPort,
  CoachSupervisorPortResult,
} from "../../../features/coaching-session/contracts/CoachSupervisorPort";
import { EMPTY_SUPERVISOR_METADATA } from "../../../features/coach-supervisor/models/CoachSupervisorMetadata";
import type { CoachSupervisorService } from "../../../features/coach-supervisor/services/CoachSupervisorService";

/**
 * Thin adapter: Coach Supervisor Service → Coaching Session CoachSupervisorPort.
 */
export function createCoachSupervisorPortAdapter(
  supervisor: CoachSupervisorService,
): CoachSupervisorPort {
  return Object.freeze({
    process(invocation: CoachSupervisorInvocation): CoachSupervisorPortResult {
      const result = supervisor.processCoachRequest({
        id: invocation.requestId,
        message: invocation.message,
        intent: invocation.intent,
        requiredCapabilityIds: Object.freeze([
          ...invocation.requiredCapabilityIds,
        ]),
        athleteId: invocation.athleteId,
        conversationId: invocation.conversationId,
        sessionId: invocation.sessionId,
        preferredAgentIds: Object.freeze([] as string[]),
        metadata: EMPTY_SUPERVISOR_METADATA,
        createdAt: new Date().toISOString(),
      });

      return Object.freeze({
        success: result.success,
        message: result.message,
        responseMessage: result.response?.message ?? null,
        sections: Object.freeze([...(result.response?.sections ?? [])]),
        agentIds: Object.freeze([...(result.response?.agentIds ?? [])]),
        capabilityIds: Object.freeze([
          ...(result.response?.capabilityIds ?? []),
        ]),
        confidenceScore: result.response?.confidence.score ?? 0,
        errorMessage: result.error?.message ?? null,
      });
    },
  });
}
