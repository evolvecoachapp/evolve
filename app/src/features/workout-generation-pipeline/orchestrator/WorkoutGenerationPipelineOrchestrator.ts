import { WellKnownCapabilityIds } from "../../agent-capability/models/CapabilityId";
import { AthleteStateRequestKinds } from "../../athlete-state/models/AthleteStateRequest";
import { EMPTY_ATHLETE_METADATA } from "../../athlete-state/models/AthleteMetadata";
import type { AthleteStateService } from "../../athlete-state/services/AthleteStateService";
import { SessionRequestKinds } from "../../coaching-session/models/SessionRequest";
import { EMPTY_SESSION_METADATA } from "../../coaching-session/models/SessionMetadata";
import type { CoachingSessionService } from "../../coaching-session/services/CoachingSessionService";
import type { CoachSupervisorService } from "../../coach-supervisor/services/CoachSupervisorService";
import { EMPTY_SUPERVISOR_METADATA } from "../../coach-supervisor/models/CoachSupervisorMetadata";
import { ContextRequestKinds } from "../../context-fusion/models/ContextRequest";
import { EMPTY_CONTEXT_METADATA } from "../../context-fusion/models/ContextMetadata";
import type { ContextFusionService } from "../../context-fusion/services/ContextFusionService";
import { buildDecisionContext } from "../../decision-engine/builders/DecisionContextBuilder";
import { DecisionInputKinds } from "../../decision-engine/models/DecisionInput";
import { EMPTY_DECISION_METADATA } from "../../decision-engine/models/DecisionMetadata";
import type { DecisionEngineService } from "../../decision-engine/services/DecisionEngineService";
import { RecommendationInputKinds } from "../../recommendation-engine/models/RecommendationInput";
import { EMPTY_RECOMMENDATION_METADATA } from "../../recommendation-engine/models/RecommendationMetadata";
import type { RecommendationEngineService } from "../../recommendation-engine/services/RecommendationEngineService";
import { EMPTY_WORKOUT_AGENT_METADATA } from "../../workout-agent/models/WorkoutAgentMetadata";
import { WorkoutIntents } from "../../workout-agent/models/WorkoutIntent";
import type { WorkoutAgentService } from "../../workout-agent/services/WorkoutAgentService";
import { buildWorkoutPlan } from "../builders/WorkoutPlanBuilder";
import {
  applyWorkoutModification,
  routeWorkoutModificationKind,
  validateModifiedWorkoutPlan,
} from "../modification";
import {
  EMPTY_PLAN_METADATA,
  WorkoutModificationKinds,
  WorkoutModificationStages,
  WorkoutPipelineStages,
  type WorkoutModificationRequest,
  type WorkoutModificationResult,
  type WorkoutModificationStageTrace,
  type WorkoutPipelineRequest,
  type WorkoutPipelineStageTrace,
  type WorkoutResult,
} from "../models";
import { validateWorkoutPlanIntegrity } from "../validators/validateWorkoutPlanIntegrity";

export interface WorkoutGenerationPipelineDeps {
  readonly coachingSession: CoachingSessionService;
  readonly coachSupervisor: CoachSupervisorService;
  readonly workoutAgent: WorkoutAgentService;
  readonly athleteState: AthleteStateService;
  readonly contextFusion: ContextFusionService;
  readonly decisionEngine: DecisionEngineService;
  readonly recommendationEngine: RecommendationEngineService;
  readonly clock?: () => string;
}

/**
 * Deterministic Workout Generation Pipeline orchestrator.
 *
 * Wires existing runtimes/engines only — no new engine logic.
 *
 * Conversation → Coaching Session → Coach Supervisor → Workout Agent
 * → Athlete State → Context Fusion → Decision → Recommendation
 * → Workout Generation (via Workout Agent) → WorkoutPlan
 */
export class WorkoutGenerationPipelineOrchestrator {
  private readonly coachingSession: CoachingSessionService;
  private readonly coachSupervisor: CoachSupervisorService;
  private readonly workoutAgent: WorkoutAgentService;
  private readonly athleteState: AthleteStateService;
  private readonly contextFusion: ContextFusionService;
  private readonly decisionEngine: DecisionEngineService;
  private readonly recommendationEngine: RecommendationEngineService;
  private readonly clock: () => string;

  constructor(deps: WorkoutGenerationPipelineDeps) {
    this.coachingSession = deps.coachingSession;
    this.coachSupervisor = deps.coachSupervisor;
    this.workoutAgent = deps.workoutAgent;
    this.athleteState = deps.athleteState;
    this.contextFusion = deps.contextFusion;
    this.decisionEngine = deps.decisionEngine;
    this.recommendationEngine = deps.recommendationEngine;
    this.clock = deps.clock ?? (() => new Date().toISOString());
  }

  modify(request: WorkoutModificationRequest): WorkoutModificationResult {
    const startedAt = this.clock();
    const trace: WorkoutModificationStageTrace[] = [];
    const errors: string[] = [];
    const previousPlan = request.plan;

    const push = (
      stage: WorkoutModificationStageTrace["stage"],
      success: boolean,
      summary: string,
    ) => {
      trace.push(
        Object.freeze({
          stage,
          success,
          summary,
          completedAt: this.clock(),
        }),
      );
      if (!success) errors.push(`${stage}: ${summary}`);
    };

    const kind = routeWorkoutModificationKind(
      request.message,
      request.kindHint,
    );
    push(
      WorkoutModificationStages.REQUEST,
      kind !== WorkoutModificationKinds.UNKNOWN,
      kind === WorkoutModificationKinds.UNKNOWN
        ? "Unrecognized adaptive modification request"
        : `Modification kind ${kind}`,
    );

    if (kind === WorkoutModificationKinds.UNKNOWN) {
      const completedAt = this.clock();
      return Object.freeze({
        id: `mod-result:${request.id}`,
        success: false,
        kind,
        request,
        previousPlan,
        plan: null,
        changes: Object.freeze([]),
        preserved: Object.freeze([
          "weekly_progression",
          "workout_objectives",
          "recommendation_package",
          "decision_package",
          "exercise_ordering",
        ]),
        validation: Object.freeze({
          valid: false,
          issues: Object.freeze([
            Object.freeze({
              code: "integrity" as const,
              message: "Unknown adaptive modification request",
              blocking: true,
            }),
          ]),
        }),
        workoutAgent: null,
        explanation:
          "I could not match a supported adaptive modification. Try replace/remove/add exercise, duration, intensity, volume, equipment, injury, fatigue, recovery, or focus requests.",
        progressionImpact: "No progression changes applied.",
        recoveryImpact: "No recovery changes applied.",
        trace: Object.freeze([...trace]),
        errors: Object.freeze([...errors]),
        message: "Unknown adaptive modification request",
        startedAt,
        completedAt,
      });
    }

    // Workout Agent — adapt intelligence (no full regeneration)
    const workoutAgent = this.workoutAgent.processWorkoutRequest({
      request: Object.freeze({
        id: `workout-req:mod:${request.id}`,
        athleteId: request.athleteId,
        conversationId: request.conversationId,
        message: request.message,
        intentHint: WorkoutIntents.ADAPT_WORKOUT,
        objectiveHint: null,
        daysPerWeek: previousPlan.proposal.daysPerWeek,
        experienceLevel: null,
        constraints: Object.freeze([
          ...previousPlan.constraints.athleteConstraints,
          ...previousPlan.constraints.recoveryConstraints,
        ]),
        metadata: EMPTY_WORKOUT_AGENT_METADATA,
        createdAt: startedAt,
      }),
    });
    push(
      WorkoutModificationStages.WORKOUT_AGENT,
      workoutAgent.success,
      workoutAgent.success
        ? "Workout Agent evaluated adaptation request"
        : workoutAgent.message || "Workout Agent adaptation failed",
    );

    const applied = applyWorkoutModification({
      plan: previousPlan,
      kind,
      message: request.message,
      at: this.clock(),
      requestId: request.id,
    });
    push(
      WorkoutModificationStages.APPLY,
      applied !== null,
      applied
        ? `Applied ${applied.changes.length} change(s)`
        : "Failed to apply modification",
    );

    if (!applied) {
      const completedAt = this.clock();
      return Object.freeze({
        id: `mod-result:${request.id}`,
        success: false,
        kind,
        request,
        previousPlan,
        plan: null,
        changes: Object.freeze([]),
        preserved: Object.freeze([
          "weekly_progression",
          "workout_objectives",
          "recommendation_package",
          "decision_package",
          "exercise_ordering",
        ]),
        validation: Object.freeze({
          valid: false,
          issues: Object.freeze([
            Object.freeze({
              code: "integrity" as const,
              message: "Modification could not be applied to the active plan",
              blocking: true,
            }),
          ]),
        }),
        workoutAgent,
        explanation:
          "The adaptive modification could not be applied to the current WorkoutPlan while preserving validity.",
        progressionImpact: "No progression changes applied.",
        recoveryImpact: "No recovery changes applied.",
        trace: Object.freeze([...trace]),
        errors: Object.freeze([...errors]),
        message: "Adaptive modification apply failed",
        startedAt,
        completedAt,
      });
    }

    const validation = validateModifiedWorkoutPlan(
      applied.plan,
      previousPlan,
    );
    push(
      WorkoutModificationStages.VALIDATION,
      validation.valid,
      validation.valid
        ? "Modified WorkoutPlan validated"
        : validation.issues
            .filter((item) => item.blocking)
            .map((item) => item.message)
            .join("; ") || "Validation failed",
    );

    if (!validation.valid) {
      const completedAt = this.clock();
      return Object.freeze({
        id: `mod-result:${request.id}`,
        success: false,
        kind,
        request,
        previousPlan,
        plan: null,
        changes: applied.changes,
        preserved: applied.preserved,
        validation,
        workoutAgent,
        explanation: applied.explanation,
        progressionImpact: applied.progressionImpact,
        recoveryImpact: applied.recoveryImpact,
        trace: Object.freeze([...trace]),
        errors: Object.freeze([
          ...errors,
          ...validation.issues
            .filter((item) => item.blocking)
            .map((item) => item.message),
        ]),
        message: "Modified WorkoutPlan failed validation",
        startedAt,
        completedAt,
      });
    }

    push(
      WorkoutModificationStages.PLAN,
      true,
      `Updated WorkoutPlan ${applied.plan.id}`,
    );

    const completedAt = this.clock();
    return Object.freeze({
      id: `mod-result:${request.id}`,
      success: true,
      kind,
      request,
      previousPlan,
      plan: applied.plan,
      changes: applied.changes,
      preserved: applied.preserved,
      validation,
      workoutAgent,
      explanation: applied.explanation,
      progressionImpact: applied.progressionImpact,
      recoveryImpact: applied.recoveryImpact,
      trace: Object.freeze([...trace]),
      errors: Object.freeze([...errors]),
      message: applied.plan.summary.message,
      startedAt,
      completedAt,
    });
  }

  async generate(request: WorkoutPipelineRequest): Promise<WorkoutResult> {
    const startedAt = this.clock();
    const trace: WorkoutPipelineStageTrace[] = [];
    const errors: string[] = [];

    const push = (
      stage: WorkoutPipelineStageTrace["stage"],
      success: boolean,
      summary: string,
    ) => {
      trace.push(
        Object.freeze({
          stage,
          success,
          summary,
          completedAt: this.clock(),
        }),
      );
      if (!success) errors.push(`${stage}: ${summary}`);
    };

    push(
      WorkoutPipelineStages.CONVERSATION,
      true,
      `Conversation context ${request.conversationId ?? "none"}`,
    );

    // 1) Coaching Session Runtime
    const sessionResult = this.coachingSession.startSession({
      id: `session-req:${request.id}`,
      kind: SessionRequestKinds.START,
      sessionId: request.sessionId,
      conversationId: request.conversationId,
      athleteId: request.athleteId,
      message: request.message,
      intent: request.intent,
      requiredCapabilityIds: Object.freeze([
        WellKnownCapabilityIds.GENERATE_WORKOUT,
      ]),
      metadata: EMPTY_SESSION_METADATA,
      createdAt: startedAt,
    });
    push(
      WorkoutPipelineStages.COACHING_SESSION,
      sessionResult.success,
      sessionResult.response?.message ??
        (sessionResult.success
          ? "Coaching session started"
          : "Coaching session failed"),
    );
    if (!sessionResult.success) {
      return this.fail(request, startedAt, trace, errors, {
        session: sessionResult,
      });
    }

    const sessionId = sessionResult.sessionId ?? request.sessionId;

    // 2) Coach Supervisor (explicit coordination for workout generation)
    const supervisorResult = this.coachSupervisor.processCoachRequest({
      id: `supervisor-req:${request.id}`,
      message: request.message,
      intent: request.intent,
      requiredCapabilityIds: Object.freeze([
        WellKnownCapabilityIds.GENERATE_WORKOUT,
      ]),
      athleteId: request.athleteId,
      conversationId: request.conversationId,
      sessionId,
      preferredAgentIds: Object.freeze(["agent:workout"]),
      metadata: EMPTY_SUPERVISOR_METADATA,
      createdAt: this.clock(),
    });
    push(
      WorkoutPipelineStages.COACH_SUPERVISOR,
      supervisorResult.success,
      supervisorResult.response?.message ??
        (supervisorResult.success
          ? "Supervisor coordinated workout agent"
          : "Supervisor coordination failed"),
    );
    if (!supervisorResult.success) {
      return this.fail(request, startedAt, trace, errors, {
        session: sessionResult,
        supervisor: supervisorResult,
      });
    }

    // 3) Workout Agent — planning intelligence (pre-fusion contribution)
    const workoutRequest = Object.freeze({
      id: `wreq:${request.id}`,
      athleteId: request.athleteId,
      conversationId: request.conversationId,
      message: request.message,
      intentHint: "plan_workout" as const,
      objectiveHint: null,
      daysPerWeek: null,
      experienceLevel: null,
      constraints: Object.freeze([] as string[]),
      metadata: EMPTY_WORKOUT_AGENT_METADATA,
      createdAt: this.clock(),
    });
    const agentPlanResult = this.workoutAgent.processWorkoutRequest({
      request: workoutRequest,
    });
    push(
      WorkoutPipelineStages.WORKOUT_AGENT,
      agentPlanResult.success,
      agentPlanResult.message ?? "Workout agent planned",
    );
    if (!agentPlanResult.success) {
      return this.fail(request, startedAt, trace, errors, {
        session: sessionResult,
        supervisor: supervisorResult,
        workoutAgent: agentPlanResult,
      });
    }

    // 4) Athlete State
    const athleteStateResult = this.athleteState.buildAthleteState({
      id: `athlete-req:${request.id}`,
      kind: AthleteStateRequestKinds.BUILD,
      athleteId: request.athleteId,
      stateId: `state:${request.athleteId}`,
      contributions: Object.freeze([]),
      sessionId,
      reason: "workout_generation_pipeline",
      metadata: EMPTY_ATHLETE_METADATA,
      createdAt: this.clock(),
    });
    push(
      WorkoutPipelineStages.ATHLETE_STATE,
      athleteStateResult.success,
      athleteStateResult.message ||
        (athleteStateResult.success
          ? "Athlete state built"
          : "Athlete state failed"),
    );
    if (!athleteStateResult.success) {
      return this.fail(request, startedAt, trace, errors, {
        session: sessionResult,
        supervisor: supervisorResult,
        workoutAgent: agentPlanResult,
        athleteState: athleteStateResult,
      });
    }

    // 5) Context Fusion → UnifiedCoachingContext
    const fusionResult = this.contextFusion.buildUnifiedContext({
      id: `fusion-req:${request.id}`,
      kind: ContextRequestKinds.BUILD,
      athleteId: request.athleteId,
      sessionId,
      conversationId: request.conversationId,
      contextId: `context:${request.athleteId}`,
      base: null,
      contributions: Object.freeze([]),
      reason: "workout_generation_pipeline",
      metadata: EMPTY_CONTEXT_METADATA,
      createdAt: this.clock(),
    });
    push(
      WorkoutPipelineStages.CONTEXT_FUSION,
      fusionResult.success && fusionResult.context != null,
      fusionResult.message ||
        (fusionResult.success ? "Context fused" : "Context fusion failed"),
    );
    if (!fusionResult.success || !fusionResult.context) {
      return this.fail(request, startedAt, trace, errors, {
        session: sessionResult,
        supervisor: supervisorResult,
        workoutAgent: agentPlanResult,
        athleteState: athleteStateResult,
        fusion: fusionResult,
      });
    }

    const unified = fusionResult.context;
    const at = this.clock();
    const decisionContext = buildDecisionContext({
      id: `decision-context:${request.id}`,
      unified,
      handoff: fusionResult.decisionEngineContext,
      at,
    });

    // 6) Decision Engine
    const decisionResult = this.decisionEngine.buildDecision({
      id: `decision-req:${request.id}`,
      kind: DecisionInputKinds.BUILD,
      athleteId: request.athleteId,
      sessionId,
      conversationId: request.conversationId,
      contextId: unified.id,
      decisionContext,
      decisions: Object.freeze([]),
      reason: "workout_generation_pipeline",
      metadata: EMPTY_DECISION_METADATA,
      createdAt: at,
    });
    push(
      WorkoutPipelineStages.DECISION,
      decisionResult.success,
      decisionResult.success
        ? `Built ${decisionResult.decisions.length} decision(s)`
        : decisionResult.errors[0]?.message ?? "Decision failed",
    );
    if (!decisionResult.success) {
      return this.fail(request, startedAt, trace, errors, {
        session: sessionResult,
        supervisor: supervisorResult,
        workoutAgent: agentPlanResult,
        athleteState: athleteStateResult,
        fusion: fusionResult,
        decision: decisionResult,
      });
    }

    // 7) Recommendation Engine
    const recommendationResult = this.recommendationEngine.buildRecommendations({
      id: `reco-req:${request.id}`,
      kind: RecommendationInputKinds.BUILD,
      athleteId: request.athleteId,
      sessionId,
      conversationId: request.conversationId,
      contextId: unified.id,
      recommendationContext: null,
      decisionHandoff: decisionResult.recommendationInput,
      decisions: decisionResult.decisions,
      recommendations: Object.freeze([]),
      reason: "workout_generation_pipeline",
      metadata: EMPTY_RECOMMENDATION_METADATA,
      createdAt: this.clock(),
    });
    push(
      WorkoutPipelineStages.RECOMMENDATION,
      recommendationResult.success,
      recommendationResult.success
        ? `Built ${recommendationResult.recommendations.length} recommendation(s)`
        : recommendationResult.errors[0]?.message ?? "Recommendation failed",
    );
    if (!recommendationResult.success) {
      return this.fail(request, startedAt, trace, errors, {
        session: sessionResult,
        supervisor: supervisorResult,
        workoutAgent: agentPlanResult,
        athleteState: athleteStateResult,
        fusion: fusionResult,
        decision: decisionResult,
        recommendation: recommendationResult,
      });
    }

    // 8) Workout Generation via Workout Agent (owns workout intelligence)
    const generation = await this.workoutAgent.generateWorkout({
      request: workoutRequest,
      generationRequest: request.generationRequest,
    });
    push(
      WorkoutPipelineStages.WORKOUT_GENERATION,
      generation.success,
      generation.message ?? "Workout generation completed",
    );
    if (!generation.success) {
      return this.fail(request, startedAt, trace, errors, {
        session: sessionResult,
        supervisor: supervisorResult,
        workoutAgent: generation.agent,
        athleteState: athleteStateResult,
        fusion: fusionResult,
        decision: decisionResult,
        recommendation: recommendationResult,
        generation,
      });
    }

    // 9) Assemble canonical WorkoutPlan
    const plan = buildWorkoutPlan({
      id: `plan:${request.id}`,
      athleteId: request.athleteId,
      sessionId,
      conversationId: request.conversationId,
      contextId: unified.id,
      proposal: generation.proposal,
      generation: generation.generation,
      unifiedContext: unified,
      decisionPackage: decisionResult.package,
      recommendationPackage: recommendationResult.package,
      decisions: decisionResult.decisions,
      recommendations: recommendationResult.recommendations,
      metadata: request.metadata ?? EMPTY_PLAN_METADATA,
      at: this.clock(),
    });
    push(
      WorkoutPipelineStages.WORKOUT_PLAN,
      true,
      plan.summary.message,
    );

    const validation = validateWorkoutPlanIntegrity(
      plan,
      recommendationResult.package,
    );
    push(
      WorkoutPipelineStages.VALIDATION,
      validation.valid,
      validation.valid
        ? "WorkoutPlan validation passed"
        : validation.issues.map((item) => item.message).join("; "),
    );

    const completedAt = this.clock();
    return Object.freeze({
      id: `result:${request.id}`,
      success: validation.valid,
      plan: validation.valid ? plan : null,
      validation,
      session: sessionResult,
      supervisor: supervisorResult,
      workoutAgent: generation.agent,
      athleteState: athleteStateResult,
      fusion: fusionResult,
      decision: decisionResult,
      recommendation: recommendationResult,
      generation,
      trace: Object.freeze([...trace]),
      errors: Object.freeze(
        validation.valid
          ? [...errors]
          : [
              ...errors,
              ...validation.issues
                .filter((item) => item.blocking)
                .map((item) => item.message),
            ],
      ),
      message: validation.valid
        ? plan.summary.message
        : "WorkoutPlan validation failed",
      startedAt,
      completedAt,
    });
  }

  private fail(
    request: WorkoutPipelineRequest,
    startedAt: string,
    trace: readonly WorkoutPipelineStageTrace[],
    errors: readonly string[],
    partial: Partial<
      Omit<
        WorkoutResult,
        | "id"
        | "success"
        | "plan"
        | "validation"
        | "trace"
        | "errors"
        | "message"
        | "startedAt"
        | "completedAt"
      >
    >,
  ): WorkoutResult {
    const completedAt = this.clock();
    return Object.freeze({
      id: `result:${request.id}`,
      success: false,
      plan: null,
      validation: Object.freeze({
        valid: false,
        issues: Object.freeze([
          Object.freeze({
            code: "integrity" as const,
            message: errors[errors.length - 1] ?? "Pipeline failed",
            blocking: true,
          }),
        ]),
      }),
      session: partial.session ?? null,
      supervisor: partial.supervisor ?? null,
      workoutAgent: partial.workoutAgent ?? null,
      athleteState: partial.athleteState ?? null,
      fusion: partial.fusion ?? null,
      decision: partial.decision ?? null,
      recommendation: partial.recommendation ?? null,
      generation: partial.generation ?? null,
      trace: Object.freeze([...trace]),
      errors: Object.freeze([...errors]),
      message: errors[errors.length - 1] ?? "Workout generation pipeline failed",
      startedAt,
      completedAt,
    });
  }
}

export function createWorkoutGenerationPipelineOrchestrator(
  deps: WorkoutGenerationPipelineDeps,
): WorkoutGenerationPipelineOrchestrator {
  return new WorkoutGenerationPipelineOrchestrator(deps);
}
