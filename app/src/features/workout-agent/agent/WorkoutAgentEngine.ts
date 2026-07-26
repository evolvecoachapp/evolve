import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { WorkoutGenerationRequest } from "../../program-generation/models/WorkoutGenerationRequest";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import type { TrainingAdaptationRequest } from "../../training-adaptation/models/TrainingAdaptationRequest";
import type { WorkoutAgent } from "../models/WorkoutAgent";
import type { WorkoutAgentGenerateResult } from "../models/WorkoutAgentGenerateResult";
import { EMPTY_WORKOUT_AGENT_METADATA } from "../models/WorkoutAgentMetadata";
import type { WorkoutAgentResult } from "../models/WorkoutAgentResult";
import type { WorkoutDomainPayloads } from "../models/WorkoutDomainPayloads";
import type { WorkoutPlanProposal } from "../models/WorkoutPlanProposal";
import type { WorkoutRequest } from "../models/WorkoutRequest";
import type { WorkoutValidation } from "../models/WorkoutValidation";
import { WorkoutPlanBuilder } from "../builders/WorkoutPlanBuilder";
import { WorkoutContextBuilder } from "../builders/WorkoutContextBuilder";
import { createDefaultReasoners } from "../reasoning";
import { createDefaultPlanners } from "../planning";
import { createDefaultStrategies } from "../strategies";
import {
  DefaultExercisePolicy,
  DefaultProgressionPolicy,
  DefaultRecoveryPolicy,
  DefaultSafetyPolicy,
  DefaultVolumePolicy,
} from "../policies";
import { validateWorkoutPlan as validatePlan } from "../validators/validateWorkoutPlan";
import { freezeAgent, freezeRequest } from "../utils/freezeAgentState";
import { formatCapabilities } from "../utils/formattingHelpers";
import {
  WorkoutAgentCoordinator,
  type WorkoutAgentCoordinatorDeps,
} from "./WorkoutAgentCoordinator";

export interface WorkoutAgentEngineDeps extends WorkoutAgentCoordinatorDeps {
  readonly agentId?: string;
}

/**
 * Top-level Workout Agent engine — orchestration only.
 */
export class WorkoutAgentEngine {
  readonly id: string;
  private readonly coordinator: WorkoutAgentCoordinator;
  private readonly clock: () => string;

  constructor(deps: WorkoutAgentEngineDeps = {}) {
    this.id = deps.agentId ?? "agent:workout:default";
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.coordinator = new WorkoutAgentCoordinator(deps);
  }

  describe(): WorkoutAgent {
    return freezeAgent({
      id: this.id,
      name: "Workout Agent",
      version: "1.2.0",
      capabilities: formatCapabilities([
        "workout_planning",
        "progression_reasoning",
        "exercise_selection_advice",
        "split_design",
        "recovery_guidance",
        "plan_evaluation",
        "workout_adaptation",
        "workout_generation",
        "domain_orchestration",
      ]),
      strategyIds: Object.freeze(
        createDefaultStrategies().map((s) => s.id),
      ),
      policyIds: Object.freeze([
        new DefaultSafetyPolicy().id,
        new DefaultRecoveryPolicy().id,
        new DefaultProgressionPolicy().id,
        new DefaultVolumePolicy().id,
        new DefaultExercisePolicy().id,
      ]),
      reasonerIds: Object.freeze(
        createDefaultReasoners().map((r) => r.id),
      ),
      plannerIds: Object.freeze(createDefaultPlanners().map((p) => p.id)),
      metadata: EMPTY_WORKOUT_AGENT_METADATA,
      createdAt: this.clock(),
    });
  }

  processRequest(input: {
    readonly request: WorkoutRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
  }): WorkoutAgentResult {
    return this.coordinator.process({
      ...input,
      request: freezeRequest(input.request),
    });
  }

  buildPlan(input: {
    readonly request: WorkoutRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
  }): WorkoutPlanProposal {
    const context = new WorkoutContextBuilder().build({
      ...input,
      request: freezeRequest(input.request),
      clock: this.clock,
    });
    const reasoning = createDefaultReasoners().map((r) => r.reason(context));
    return new WorkoutPlanBuilder().buildProposal({
      context,
      reasoning,
      clock: this.clock,
    });
  }

  evaluate(proposal: WorkoutPlanProposal): WorkoutValidation {
    return validatePlan(proposal);
  }

  generateWorkout(input: {
    readonly request: WorkoutRequest;
    readonly generationRequest: WorkoutGenerationRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
    readonly domainPayloads?: WorkoutDomainPayloads;
  }): Promise<WorkoutAgentGenerateResult> {
    return this.coordinator.generate({
      ...input,
      request: freezeRequest(input.request),
    });
  }

  adaptWorkout(input: {
    readonly request: WorkoutRequest;
    readonly adaptationRequest: TrainingAdaptationRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
    readonly domainPayloads?: WorkoutDomainPayloads;
  }): Promise<WorkoutAgentResult> {
    return this.coordinator.adapt({
      ...input,
      request: freezeRequest(input.request),
    });
  }
}
