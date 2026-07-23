/**
 * Immutable capability keys shared by every agent.
 * Domain agents declare which keys they support — no domain logic here.
 */
export type AgentCapabilityKey =
  | "workout_planning"
  | "nutrition_planning"
  | "recovery_analysis"
  | "goal_planning"
  | "conversation_analysis"
  | "progress_tracking"
  | "education"
  | "explanation"
  | "reasoning"
  | "action_planning";

export const AgentCapabilityKeys = Object.freeze({
  WORKOUT_PLANNING: "workout_planning",
  NUTRITION_PLANNING: "nutrition_planning",
  RECOVERY_ANALYSIS: "recovery_analysis",
  GOAL_PLANNING: "goal_planning",
  CONVERSATION_ANALYSIS: "conversation_analysis",
  PROGRESS_TRACKING: "progress_tracking",
  EDUCATION: "education",
  EXPLANATION: "explanation",
  REASONING: "reasoning",
  ACTION_PLANNING: "action_planning",
} as const satisfies Record<string, AgentCapabilityKey>);

export const ALL_AGENT_CAPABILITY_KEYS: readonly AgentCapabilityKey[] =
  Object.freeze([
    AgentCapabilityKeys.WORKOUT_PLANNING,
    AgentCapabilityKeys.NUTRITION_PLANNING,
    AgentCapabilityKeys.RECOVERY_ANALYSIS,
    AgentCapabilityKeys.GOAL_PLANNING,
    AgentCapabilityKeys.CONVERSATION_ANALYSIS,
    AgentCapabilityKeys.PROGRESS_TRACKING,
    AgentCapabilityKeys.EDUCATION,
    AgentCapabilityKeys.EXPLANATION,
    AgentCapabilityKeys.REASONING,
    AgentCapabilityKeys.ACTION_PLANNING,
  ]);
