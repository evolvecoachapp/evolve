import type { IAgentCapability } from "../contracts/IAgentCapability";
import type { AgentCapabilities } from "../models/AgentCapabilities";
import type { AgentCapabilityKey } from "../models/AgentCapabilityKey";
import { AgentCapabilityKeys } from "../models/AgentCapabilityKey";

function createCapabilityDefinition(options: {
  readonly key: AgentCapabilityKey;
  readonly name: string;
  readonly description: string;
  readonly category: string;
}): IAgentCapability {
  return Object.freeze({
    key: options.key,
    name: options.name,
    description: options.description,
    category: options.category,
    isEnabled(capabilities: AgentCapabilities): boolean {
      return capabilities[options.key] === true;
    },
  });
}

export const WorkoutPlanning: IAgentCapability = createCapabilityDefinition({
  key: AgentCapabilityKeys.WORKOUT_PLANNING,
  name: "Workout Planning",
  description: "Plan and organize workout programs",
  category: "training",
});

export const NutritionPlanning: IAgentCapability = createCapabilityDefinition({
  key: AgentCapabilityKeys.NUTRITION_PLANNING,
  name: "Nutrition Planning",
  description: "Plan nutrition guidance",
  category: "nutrition",
});

export const RecoveryAnalysis: IAgentCapability = createCapabilityDefinition({
  key: AgentCapabilityKeys.RECOVERY_ANALYSIS,
  name: "Recovery Analysis",
  description: "Analyze recovery state",
  category: "recovery",
});

export const GoalPlanning: IAgentCapability = createCapabilityDefinition({
  key: AgentCapabilityKeys.GOAL_PLANNING,
  name: "Goal Planning",
  description: "Plan athlete goals",
  category: "goals",
});

export const ConversationAnalysis: IAgentCapability =
  createCapabilityDefinition({
    key: AgentCapabilityKeys.CONVERSATION_ANALYSIS,
    name: "Conversation Analysis",
    description: "Analyze conversation intent and context",
    category: "conversation",
  });

export const ProgressTracking: IAgentCapability = createCapabilityDefinition({
  key: AgentCapabilityKeys.PROGRESS_TRACKING,
  name: "Progress Tracking",
  description: "Track athlete progress signals",
  category: "progress",
});

export const Education: IAgentCapability = createCapabilityDefinition({
  key: AgentCapabilityKeys.EDUCATION,
  name: "Education",
  description: "Provide educational coaching content",
  category: "education",
});

export const Explanation: IAgentCapability = createCapabilityDefinition({
  key: AgentCapabilityKeys.EXPLANATION,
  name: "Explanation",
  description: "Explain agent decisions",
  category: "explanation",
});

export const Reasoning: IAgentCapability = createCapabilityDefinition({
  key: AgentCapabilityKeys.REASONING,
  name: "Reasoning",
  description: "Deterministic reasoning support",
  category: "reasoning",
});

export const ActionPlanning: IAgentCapability = createCapabilityDefinition({
  key: AgentCapabilityKeys.ACTION_PLANNING,
  name: "Action Planning",
  description: "Prepare action planning envelopes",
  category: "actions",
});

export const ALL_CAPABILITY_DEFINITIONS: readonly IAgentCapability[] =
  Object.freeze([
    WorkoutPlanning,
    NutritionPlanning,
    RecoveryAnalysis,
    GoalPlanning,
    ConversationAnalysis,
    ProgressTracking,
    Education,
    Explanation,
    Reasoning,
    ActionPlanning,
  ]);

export function registerDefaultCapabilities(
  register: (capability: IAgentCapability) => void,
): void {
  for (const capability of ALL_CAPABILITY_DEFINITIONS) {
    register(capability);
  }
}
