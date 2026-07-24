/**
 * Port for Coach Supervisor consumption.
 * Coaching Session Runtime never imports supervisor internals for orchestration.
 */

export interface CoachSupervisorInvocation {
  readonly requestId: string;
  readonly sessionId: string;
  readonly conversationId: string | null;
  readonly athleteId: string | null;
  readonly message: string;
  readonly intent: string;
  readonly requiredCapabilityIds: readonly string[];
}

export interface CoachSupervisorPortResult {
  readonly success: boolean;
  readonly message: string | null;
  readonly responseMessage: string | null;
  readonly sections: readonly string[];
  readonly agentIds: readonly string[];
  readonly capabilityIds: readonly string[];
  readonly confidenceScore: number;
  readonly errorMessage: string | null;
}

export interface CoachSupervisorPort {
  process(invocation: CoachSupervisorInvocation): CoachSupervisorPortResult;
}

export function createMockCoachSupervisorPort(): CoachSupervisorPort {
  return {
    process(invocation) {
      const caps = [...invocation.requiredCapabilityIds];
      const agents = caps.map((cap) => {
        if (cap.includes("workout")) return "agent:workout";
        if (cap.includes("recovery")) return "agent:recovery";
        if (cap.includes("nutrition")) return "agent:nutrition";
        return "agent:coach";
      });
      const uniqueAgents = Object.freeze([...new Set(agents)]);
      return Object.freeze({
        success: true,
        message: "Supervisor orchestration completed.",
        responseMessage: `Unified coach response for: ${invocation.message}`,
        sections: Object.freeze(["overview", "guidance"]),
        agentIds: uniqueAgents,
        capabilityIds: Object.freeze(caps),
        confidenceScore: caps.length > 0 ? 0.85 : 0.5,
        errorMessage: null,
      });
    },
  };
}
