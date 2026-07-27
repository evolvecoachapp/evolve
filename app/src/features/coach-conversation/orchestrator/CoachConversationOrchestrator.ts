import { SessionRequestKinds } from "../../coaching-session/models/SessionRequest";
import { EMPTY_SESSION_METADATA } from "../../coaching-session/models/SessionMetadata";
import type { CoachingSessionService } from "../../coaching-session/services/CoachingSessionService";
import { EMPTY_SUPERVISOR_METADATA } from "../../coach-supervisor/models/CoachSupervisorMetadata";
import type { CoachSupervisorService } from "../../coach-supervisor/services/CoachSupervisorService";
import {
  createConversationMemoryService,
  type ConversationMemoryService,
} from "../../conversation-memory/services/ConversationMemoryService";
import { PlanChangeReasons } from "../../plan-history/models/PlanChangeReason";
import type { PlanHistoryService } from "../../plan-history/services/PlanHistoryService";
import type { PlanRestoreResult } from "../../plan-restore/models/PlanRestoreResult";
import { buildPlanRestoreRequest } from "../../plan-restore/routing/routePlanRestoreIntent";
import type { PlanRestoreService } from "../../plan-restore/services/PlanRestoreService";
import {
  appendUserRequest,
  appendWorkoutCreated,
  appendWorkoutModified,
} from "../../coach-timeline/builders/timelineIntegration";
import { buildTimelineGroundedReply } from "../../coach-timeline/builders/buildTimelineGroundedReply";
import type { TimelineResult } from "../../coach-timeline/models/TimelineResult";
import type { CoachTimelineService } from "../../coach-timeline/services/CoachTimelineService";
import { buildInsightGroundedReply } from "../../proactive-insights/builders/buildInsightGroundedReply";
import type { InsightAnalysisResult } from "../../proactive-insights/models/InsightAnalysisResult";
import type { ProactiveInsightsService } from "../../proactive-insights/services/ProactiveInsightsService";
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
  publishWorkoutPlanVersion,
  resolveWorkoutLineageId,
} from "../history/publishWorkoutPlanHistory";
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
  readonly planHistory?: PlanHistoryService | null;
  readonly planRestore?: PlanRestoreService | null;
  readonly coachTimeline?: CoachTimelineService | null;
  readonly proactiveInsights?: ProactiveInsightsService | null;
  readonly conversationMemory?: ConversationMemoryService;
  readonly planStore?: ActiveWorkoutPlanStore;
  readonly clock?: () => string;
}


/**
 * Product orchestrator for Intelligent Coach Conversation.
 *
 * Conversation → Intent Routing → Coaching Session → Supervisor Routing
 * → Coach Supervisor → (optional Adaptive Modification | Plan Restore)
 * → Context (WorkoutPlan + Recommendations + Memory) → Deterministic coaching response
 *
 * Orchestration only — no new engines.
 */
export class CoachConversationOrchestrator {
  private readonly coachingSession: CoachingSessionService;
  private readonly coachSupervisor: CoachSupervisorService;
  private readonly supervisorRouting: SupervisorRoutingService;
  private readonly workoutPipeline: WorkoutGenerationPipelineService | null;
  private readonly planHistory: PlanHistoryService | null;
  private readonly planRestore: PlanRestoreService | null;
  private readonly coachTimeline: CoachTimelineService | null;
  private readonly proactiveInsights: ProactiveInsightsService | null;
  private readonly conversationMemory: ConversationMemoryService;
  private readonly planStore: ActiveWorkoutPlanStore;
  private readonly clock: () => string;
  private sequence = 0;

  constructor(deps: CoachConversationOrchestratorDeps) {
    this.coachingSession = deps.coachingSession;
    this.coachSupervisor = deps.coachSupervisor;
    this.supervisorRouting = deps.supervisorRouting;
    this.workoutPipeline = deps.workoutPipeline ?? null;
    this.planHistory = deps.planHistory ?? null;
    this.planRestore = deps.planRestore ?? null;
    this.coachTimeline = deps.coachTimeline ?? null;
    this.proactiveInsights = deps.proactiveInsights ?? null;
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

  getTimeline(): CoachTimelineService | null {
    return this.coachTimeline;
  }

  getProactiveInsights(): ProactiveInsightsService | null {
    return this.proactiveInsights;
  }

  attachWorkoutPlan(plan: WorkoutPlan): void {
    let next = plan;
    let versionNumber: number | null = null;
    const lineageId = resolveWorkoutLineageId(plan);
    if (this.planHistory) {
      const existing = this.planHistory.getHistory(lineageId);
      next = publishWorkoutPlanVersion({
        planHistory: this.planHistory,
        plan,
        changeReason: existing
          ? PlanChangeReasons.MODIFIED
          : PlanChangeReasons.INITIAL,
        changeSummary: existing
          ? `Attached updated workout plan ${plan.id}`
          : `Initial workout plan ${plan.id}`,
        requestId: `attach:${plan.id}:${this.clock()}`,
        at: this.clock(),
      });
      versionNumber =
        this.planHistory.getHistory(lineageId)?.currentVersionNumber ?? null;
      if (existing) {
        appendWorkoutModified({
          timeline: this.coachTimeline,
          athleteId: next.athleteId,
          planId: next.id,
          lineageId,
          versionNumber,
          conversationId: next.conversationId,
          sessionId: next.sessionId,
          summary: `Workout plan modified (${next.summary.title})`,
          explanation: `Attached updated workout plan ${next.id}`,
          impact: "Active workout plan replaced with updated version",
          expectedOutcome: "Athlete trains with the updated plan",
          at: this.clock(),
        });
      } else {
        appendWorkoutCreated({
          timeline: this.coachTimeline,
          athleteId: next.athleteId,
          planId: next.id,
          lineageId,
          versionNumber,
          conversationId: next.conversationId,
          sessionId: next.sessionId,
          summary: `Workout plan created (${next.summary.title})`,
          explanation: `Initial workout plan ${next.id} attached to conversation`,
          at: this.clock(),
        });
      }
    } else {
      appendWorkoutCreated({
        timeline: this.coachTimeline,
        athleteId: next.athleteId,
        planId: next.id,
        lineageId,
        versionNumber: null,
        conversationId: next.conversationId,
        sessionId: next.sessionId,
        summary: `Workout plan created (${next.summary.title})`,
        explanation: `Workout plan ${next.id} attached to conversation`,
        at: this.clock(),
      });
    }
    this.planStore.attach(next);
    if (next.conversationId) {
      recordCoachConversationMemory({
        memory: this.conversationMemory,
        context: buildCoachConversationContext({
          id: `ctx:attach:${next.id}`,
          request: Object.freeze({
            id: `req:attach:${next.id}`,
            conversationId: next.conversationId,
            sessionId: next.sessionId,
            athleteId: next.athleteId,
            message: "attach_workout_plan",
            intentHint: null,
            metadata: Object.freeze({
              tags: Object.freeze(["attach"]),
              attributes: Object.freeze({ planId: next.id }),
            }),
            createdAt: this.clock(),
          }),
          intent: CoachConversationIntents.WORKOUT_SUMMARY,
          sessionId: next.sessionId,
          workoutPlan: next,
          session: null,
          createdAt: this.clock(),
        }),
        response: Object.freeze({
          id: `resp:attach:${next.id}`,
          intent: CoachConversationIntents.WORKOUT_SUMMARY,
          message: next.summary.message,
          referencesWorkoutPlan: true,
          planId: next.id,
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
    let restore: PlanRestoreResult | null = null;
    let timelineResult: TimelineResult | null = null;
    let insightResult: InsightAnalysisResult | null = null;

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
          let updated: WorkoutPlan = Object.freeze({
            ...modification.plan,
            conversationId:
              modification.plan.conversationId ?? request.conversationId,
            sessionId: modification.plan.sessionId ?? sessionId,
          });
          let versionNumber: number | null = null;
          const lineageId = resolveWorkoutLineageId(updated);
          if (this.planHistory) {
            updated = publishWorkoutPlanVersion({
              planHistory: this.planHistory,
              plan: updated,
              changeReason: PlanChangeReasons.MODIFIED,
              changeSummary: modification.explanation || modification.message,
              requestId: request.id,
              at: this.clock(),
            });
            versionNumber =
              this.planHistory.getHistory(lineageId)?.currentVersionNumber ??
              null;
          }
          this.planStore.attach(updated);
          workoutPlan = updated;
          const changeHints = modification.changes
            .map((item) => item.summary)
            .join(" ");
          appendWorkoutModified({
            timeline: this.coachTimeline,
            athleteId: request.athleteId,
            planId: updated.id,
            lineageId,
            versionNumber,
            conversationId: request.conversationId,
            sessionId,
            summary: `Workout modified (${modification.kind})`,
            explanation: modification.explanation || modification.message,
            impact: `${modification.progressionImpact} ${modification.recoveryImpact}`,
            expectedOutcome: "Athlete trains with the surgically updated plan",
            at: this.clock(),
            searchHints: `${changeHints} volume intensity`,
          });
        }
      }
    }

    if (intent === CoachConversationIntents.PLAN_RESTORE) {
      if (!this.planRestore || !this.planHistory) {
        push(
          CoachConversationStages.PLAN_RESTORE,
          false,
          "Plan restore / history services not wired",
        );
      } else if (!workoutPlan) {
        push(
          CoachConversationStages.PLAN_RESTORE,
          false,
          "No active WorkoutPlan lineage to restore — generate a workout first",
        );
      } else {
        previousWorkoutPlan = workoutPlan;
        const lineageId = resolveWorkoutLineageId(workoutPlan);
        const restoreRequest = buildPlanRestoreRequest({
          id: `restore-req:${request.id}`,
          athleteId: workoutPlan.athleteId,
          conversationId: request.conversationId,
          sessionId,
          message: request.message,
          lineageId,
          planType: "workout",
          createdAt: this.clock(),
          clock: this.clock,
        });
        restore = this.planRestore.restore(restoreRequest);
        push(
          CoachConversationStages.PLAN_RESTORE,
          restore.success,
          restore.success
            ? `Restored → v${restore.publishedVersion?.versionNumber}`
            : restore.message,
        );
        if (restore.success && restore.workoutPlan) {
          const updated = Object.freeze({
            ...restore.workoutPlan,
            conversationId:
              restore.workoutPlan.conversationId ?? request.conversationId,
            sessionId: restore.workoutPlan.sessionId ?? sessionId,
          });
          // Already published by applyRestore — attach without double-publish.
          this.planStore.attach(updated);
          workoutPlan = updated;
        }
      }
    }

    const memoryHints = loadCoachMemoryHints({
      memory: this.conversationMemory,
      conversationId: request.conversationId,
    });

    if (intent === CoachConversationIntents.TIMELINE_QUERY) {
      if (!this.coachTimeline) {
        timelineResult = Object.freeze({
          query: Object.freeze({
            athleteId: request.athleteId,
            filter: null,
            summaryKind: null,
            limit: 0,
            order: "desc" as const,
          }),
          timeline: null,
          entries: Object.freeze([]),
          summary: null,
          matchedCount: 0,
          success: true,
          message:
            "I have no Coach Timeline entries available for that question, so I will not invent a reason.",
        });
      } else {
        timelineResult = buildTimelineGroundedReply({
          timeline: this.coachTimeline,
          athleteId: request.athleteId,
          message: request.message,
        }).result;
      }
      push(
        CoachConversationStages.CONTEXT_ASSEMBLY,
        true,
        `Timeline query matched ${timelineResult.matchedCount} entries`,
      );
    }

    if (intent === CoachConversationIntents.COACH_INSIGHT) {
      if (!this.proactiveInsights) {
        insightResult = Object.freeze({
          query: null,
          insights: Object.freeze([]),
          snapshot: null,
          summary: null,
          matchedCount: 0,
          success: true,
          message:
            "I have no proactive coach insights available for that question, so I will not invent observations.",
          generatedAt: this.clock(),
        });
      } else {
        insightResult = buildInsightGroundedReply({
          insights: this.proactiveInsights,
          athleteId: request.athleteId,
          message: request.message,
        }).result;
      }
      push(
        CoachConversationStages.CONTEXT_ASSEMBLY,
        true,
        `Coach insight query matched ${insightResult.matchedCount} insights`,
      );
    }

    const context = buildCoachConversationContext({
      id: `ctx:${request.id}`,
      request,
      intent,
      sessionId,
      workoutPlan,
      previousWorkoutPlan,
      modification,
      restore,
      timelineResult,
      insightResult,
      session: sessionResult,
      memoryHints,
      createdAt: this.clock(),
    });
    if (
      intent !== CoachConversationIntents.TIMELINE_QUERY &&
      intent !== CoachConversationIntents.COACH_INSIGHT
    ) {
      push(
        CoachConversationStages.CONTEXT_ASSEMBLY,
        true,
        workoutPlan
          ? `Context assembled with plan ${workoutPlan.id}`
          : "Context assembled without WorkoutPlan",
      );
    }

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

    const importantUserRequest =
      intent === CoachConversationIntents.WORKOUT_MODIFICATION ||
      intent === CoachConversationIntents.PLAN_RESTORE ||
      intent === CoachConversationIntents.TIMELINE_QUERY ||
      intent === CoachConversationIntents.COACH_INSIGHT ||
      intent === CoachConversationIntents.GENERAL_COACHING;
    if (importantUserRequest) {
      appendUserRequest({
        timeline: this.coachTimeline,
        athleteId: request.athleteId,
        requestId: request.id,
        message: request.message,
        intent,
        conversationId: request.conversationId,
        sessionId,
        at: this.clock(),
      });
    }

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
      restore,
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
