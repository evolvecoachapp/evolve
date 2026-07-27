import { SessionRequestKinds } from "../../coaching-session/models/SessionRequest";
import { EMPTY_SESSION_METADATA } from "../../coaching-session/models/SessionMetadata";
import type { CoachingSessionService } from "../../coaching-session/services/CoachingSessionService";
import { EMPTY_SUPERVISOR_METADATA } from "../../coach-supervisor/models/CoachSupervisorMetadata";
import type { CoachSupervisorService } from "../../coach-supervisor/services/CoachSupervisorService";
import {
  createConversationMemoryService,
  type ConversationMemoryService,
} from "../../conversation-memory/services/ConversationMemoryService";
import { EMPTY_ROUTING_METADATA } from "../../supervisor-routing/models/RoutingMetadata";
import { RoutingPriorityLevels } from "../../supervisor-routing/models/RoutingPriority";
import type { SupervisorRoutingService } from "../../supervisor-routing/services/SupervisorRoutingService";
import { EMPTY_PLAN_METADATA } from "../../workout-generation-pipeline/models";
import type { WorkoutModificationResult } from "../../workout-generation-pipeline/models/WorkoutModificationResult";
import type { WorkoutPlan } from "../../workout-generation-pipeline/models/WorkoutPlan";
import type { WorkoutGenerationPipelineService } from "../../workout-generation-pipeline/services/WorkoutGenerationPipelineService";
import { buildCoachConversationContext } from "../builders/buildCoachConversationContext";
import { buildCoachConversationResponse } from "../builders/buildCoachConversationResponse";
import {
  loadCoachMemoryHints,
  recordCoachConversationMemory,
} from "../memory/recordCoachConversationMemory";
import { CoachConversationIntents } from "../models/CoachConversationIntent";
import type { CoachConversationRequest } from "../models/CoachConversationRequest";
import {
  CoachConversationStages,
  type CoachConversationResult,
  type CoachConversationStageTrace,
} from "../models/CoachConversationResult";
import { mapIntentToCapabilities } from "../routing/mapIntentToCapabilities";
import { routeCoachConversationIntent } from "../routing/routeCoachConversationIntent";
import {
  ActiveWorkoutPlanStore,
  createActiveWorkoutPlanStore,
} from "../store/ActiveWorkoutPlanStore";

export interface CoachConversationOrchestratorDeps {
  readonly coachingSession: CoachingSessionService;
  readonly coachSupervisor: CoachSupervisorService;
  readonly supervisorRouting: SupervisorRoutingService;
  readonly workoutPipeline?: WorkoutGenerationPipelineService | null;
  readonly conversationMemory?: ConversationMemoryService;
  readonly planStore?: ActiveWorkoutPlanStore;
  readonly clock?: () => string;
}

/**
 * Product orchestrator for Intelligent Coach Conversation.
 *
 * Conversation → Intent Routing → Coaching Session → Supervisor Routing
 * → Coach Supervisor → (optional Adaptive Modification) → Context
 * (WorkoutPlan + Recommendations + Memory) → Deterministic coaching response
 *
 * Orchestration only — no new engines.
 */
export class CoachConversationOrchestrator {
  private readonly coachingSession: CoachingSessionService;
  private readonly coachSupervisor: CoachSupervisorService;
  private readonly supervisorRouting: SupervisorRoutingService;
  private readonly workoutPipeline: WorkoutGenerationPipelineService | null;
  private readonly conversationMemory: ConversationMemoryService;
  private readonly planStore: ActiveWorkoutPlanStore;
  private readonly clock: () => string;
  private sequence = 0;

  constructor(deps: CoachConversationOrchestratorDeps) {
    this.coachingSession = deps.coachingSession;
    this.coachSupervisor = deps.coachSupervisor;
    this.supervisorRouting = deps.supervisorRouting;
    this.workoutPipeline = deps.workoutPipeline ?? null;
    this.conversationMemory =
      deps.conversationMemory ?? createConversationMemoryService();
    this.planStore = deps.planStore ?? createActiveWorkoutPlanStore();
    this.clock = deps.clock ?? (() => new Date().toISOString());
  }

  getPlanStore(): ActiveWorkoutPlanStore {
    return this.planStore;
  }

  getMemory(): ConversationMemoryService {
    return this.conversationMemory;
  }

  attachWorkoutPlan(plan: WorkoutPlan): void {
    this.planStore.attach(plan);
    if (plan.conversationId) {
      recordCoachConversationMemory({
        memory: this.conversationMemory,
        context: buildCoachConversationContext({
          id: `ctx:attach:${plan.id}`,
          request: Object.freeze({
            id: `req:attach:${plan.id}`,
            conversationId: plan.conversationId,
            sessionId: plan.sessionId,
            athleteId: plan.athleteId,
            message: "attach_workout_plan",
            intentHint: null,
            metadata: Object.freeze({
              tags: Object.freeze(["attach"]),
              attributes: Object.freeze({ planId: plan.id }),
            }),
            createdAt: this.clock(),
          }),
          intent: CoachConversationIntents.WORKOUT_SUMMARY,
          sessionId: plan.sessionId,
          workoutPlan: plan,
          session: null,
          createdAt: this.clock(),
        }),
        response: Object.freeze({
          id: `resp:attach:${plan.id}`,
          intent: CoachConversationIntents.WORKOUT_SUMMARY,
          message: plan.summary.message,
          referencesWorkoutPlan: true,
          planId: plan.id,
          topics: Object.freeze(["workout_plan"]),
          createdAt: this.clock(),
        }),
        clock: this.clock,
      });
    }
  }

  processTurn(request: CoachConversationRequest): CoachConversationResult {
    const startedAt = this.clock();
    const trace: CoachConversationStageTrace[] = [];
    const errors: string[] = [];
    this.sequence += 1;

    const push = (
      stage: CoachConversationStageTrace["stage"],
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

    const intent = routeCoachConversationIntent(
      request.message,
      request.intentHint,
    );
    push(
      CoachConversationStages.INTENT_ROUTING,
      true,
      `Intent ${intent}`,
    );

    const capabilityIds = mapIntentToCapabilities(intent);

    const baseSessionFields = Object.freeze({
      id: `session-req:coach-conv:${request.id}`,
      conversationId: request.conversationId,
      athleteId: request.athleteId,
      message: request.message,
      intent,
      requiredCapabilityIds: capabilityIds,
      metadata: EMPTY_SESSION_METADATA,
      createdAt: startedAt,
    });

    let sessionResult = request.sessionId
      ? this.coachingSession.continueSession(
          Object.freeze({
            ...baseSessionFields,
            kind: SessionRequestKinds.CONTINUE,
            sessionId: request.sessionId,
          }),
        )
      : this.coachingSession.startSession(
          Object.freeze({
            ...baseSessionFields,
            kind: SessionRequestKinds.START,
            sessionId: null,
          }),
        );

    if (!sessionResult.success && request.sessionId) {
      sessionResult = this.coachingSession.startSession(
        Object.freeze({
          ...baseSessionFields,
          id: `session-req:coach-conv:${request.id}:restart`,
          kind: SessionRequestKinds.START,
          sessionId: null,
        }),
      );
    }

    push(
      CoachConversationStages.COACHING_SESSION,
      sessionResult.success,
      sessionResult.response?.message ??
        (sessionResult.success
          ? "Coaching session continued"
          : "Coaching session failed"),
    );

    const sessionId = sessionResult.sessionId ?? request.sessionId;

    const routingCapabilities = capabilityIds.map((capabilityId, index) =>
      Object.freeze({
        id: `cap:${request.id}:${index}`,
        capabilityId,
        required: true,
        priority: RoutingPriorityLevels.HIGH,
        dependsOn: Object.freeze([] as string[]),
        metadata: EMPTY_ROUTING_METADATA,
      }),
    );

    const routingResult = this.supervisorRouting.buildRoutingPlan(
      Object.freeze({
        id: `routing-req:${request.id}`,
        coachAgentId: "agent:coach",
        intent,
        requiredCapabilities: Object.freeze(routingCapabilities),
        dependencies: Object.freeze([]),
        constraints: Object.freeze([]),
        athleteId: request.athleteId,
        conversationId: request.conversationId,
        sessionId,
        metadata: EMPTY_ROUTING_METADATA,
        createdAt: this.clock(),
      }),
    );
    push(
      CoachConversationStages.SUPERVISOR_ROUTING,
      routingResult.success,
      routingResult.message ??
        (routingResult.success ? "Routing plan built" : "Routing failed"),
    );

    const supervisorResult = this.coachSupervisor.processCoachRequest(
      Object.freeze({
        id: `supervisor-req:${request.id}`,
        message: request.message,
        intent,
        requiredCapabilityIds: capabilityIds,
        athleteId: request.athleteId,
        conversationId: request.conversationId,
        sessionId,
        preferredAgentIds: Object.freeze(
          intent.includes("recovery")
            ? (["agent:recovery"] as string[])
            : (["agent:workout"] as string[]),
        ),
        metadata: EMPTY_SUPERVISOR_METADATA,
        createdAt: this.clock(),
      }),
    );
    push(
      CoachConversationStages.COACH_SUPERVISOR,
      supervisorResult.success,
      supervisorResult.response?.message ??
        (supervisorResult.success
          ? "Supervisor coordinated"
          : "Supervisor failed"),
    );

    let workoutPlan = this.planStore.resolve({
      conversationId: request.conversationId,
      sessionId,
    });
    let previousWorkoutPlan: WorkoutPlan | null = null;
    let modification: WorkoutModificationResult | null = null;

    if (intent === CoachConversationIntents.WORKOUT_MODIFICATION) {
      if (!workoutPlan) {
        push(
          CoachConversationStages.WORKOUT_MODIFICATION,
          false,
          "No active WorkoutPlan to modify — generate a workout first",
        );
      } else if (!this.workoutPipeline) {
        push(
          CoachConversationStages.WORKOUT_MODIFICATION,
          false,
          "Workout pipeline not wired for adaptive modification",
        );
      } else {
        previousWorkoutPlan = workoutPlan;
        modification = this.workoutPipeline.modifyWorkoutPlan(
          Object.freeze({
            id: `mod-req:${request.id}`,
            plan: workoutPlan,
            athleteId: request.athleteId,
            conversationId: request.conversationId,
            sessionId,
            message: request.message,
            kindHint: null,
            metadata: EMPTY_PLAN_METADATA,
            createdAt: this.clock(),
          }),
        );
        push(
          CoachConversationStages.WORKOUT_MODIFICATION,
          modification.success,
          modification.success
            ? `Applied ${modification.kind} → plan ${modification.plan?.id}`
            : modification.message,
        );
        if (modification.success && modification.plan) {
          const updated = Object.freeze({
            ...modification.plan,
            conversationId:
              modification.plan.conversationId ?? request.conversationId,
            sessionId: modification.plan.sessionId ?? sessionId,
          });
          this.attachWorkoutPlan(updated);
          workoutPlan = updated;
        }
      }
    }

    const memoryHints = loadCoachMemoryHints({
      memory: this.conversationMemory,
      conversationId: request.conversationId,
    });

    const context = buildCoachConversationContext({
      id: `ctx:${request.id}`,
      request,
      intent,
      sessionId,
      workoutPlan,
      previousWorkoutPlan,
      modification,
      session: sessionResult,
      memoryHints,
      createdAt: this.clock(),
    });
    push(
      CoachConversationStages.CONTEXT_ASSEMBLY,
      true,
      workoutPlan
        ? `Context assembled with plan ${workoutPlan.id}`
        : "Context assembled without WorkoutPlan",
    );

    const response = buildCoachConversationResponse(
      context,
      `resp:${request.id}`,
      this.clock(),
    );
    push(CoachConversationStages.RESPONSE, true, `Response for ${intent}`);

    const memoryResult = recordCoachConversationMemory({
      memory: this.conversationMemory,
      context,
      response,
      clock: this.clock,
    });
    push(
      CoachConversationStages.MEMORY,
      memoryResult.success,
      memoryResult.message ?? "Memory recorded",
    );

    // Response is always produced; soft-fail upstream stages stay in trace/errors.
    const success = sessionResult.success && response.message.length > 0;

    const completedAt = this.clock();
    return Object.freeze({
      id: `result:coach-conv:${request.id}:${this.sequence}`,
      success,
      message: response.message,
      intent,
      request,
      response,
      context,
      sessionId,
      conversationId: request.conversationId,
      workoutPlan,
      modification,
      session: sessionResult,
      routing: routingResult,
      supervisor: supervisorResult,
      memory: memoryResult,
      trace: Object.freeze([...trace]),
      errors: Object.freeze([...errors]),
      startedAt,
      completedAt,
    });
  }
}

export function createCoachConversationOrchestrator(
  deps: CoachConversationOrchestratorDeps,
): CoachConversationOrchestrator {
  return new CoachConversationOrchestrator(deps);
}
