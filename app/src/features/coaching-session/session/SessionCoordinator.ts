import { buildSessionCheckpoint } from "../context/SessionCheckpointBuilder";
import { buildSessionContext } from "../context/SessionContextBuilder";
import {
  createSessionContextManager,
  type SessionContextManager,
} from "../context/SessionContextManager";
import { buildEmptySessionHistory } from "../context/SessionHistoryBuilder";
import type {
  CoachSupervisorPort,
  CoachSupervisorPortResult,
} from "../contracts/CoachSupervisorPort";
import type { ConversationRuntimePort } from "../contracts/ConversationRuntimePort";
import { buildSessionResponse } from "../builders/ResponseBuilder";
import { buildCoachingSessionDescriptor } from "../builders/SessionBuilder";
import { buildSessionResult } from "../builders/SessionResultBuilder";
import { buildSessionSnapshot } from "../builders/SessionSnapshotBuilder";
import { buildSessionSummary } from "../builders/SummaryBuilder";
import { buildSessionTimeline } from "../builders/TimelineBuilder";
import {
  createSessionLifecycleManager,
  type SessionLifecycleManager,
} from "../lifecycle/SessionLifecycleManager";
import {
  createSessionStateMachine,
  type SessionStateMachine,
} from "../lifecycle/SessionStateMachine";
import { createSessionError } from "../models/SessionError";
import {
  SessionEventTypes,
  type SessionEvent,
} from "../models/SessionEvent";
import { EMPTY_SESSION_METADATA } from "../models/SessionMetadata";
import {
  SessionRequestKinds,
  type SessionRequest,
} from "../models/SessionRequest";
import {
  SessionOperationKinds,
  type SessionResult,
} from "../models/SessionResult";
import type { SessionValidation } from "../models/SessionValidation";
import { createContinuationPlanner } from "../planning/ContinuationPlanner";
import { createContextPlanner } from "../planning/ContextPlanner";
import { createInteractionPlanner } from "../planning/InteractionPlanner";
import { createResponsePlanner } from "../planning/ResponsePlanner";
import { createSessionPlanner } from "../planning/SessionPlanner";
import {
  createSessionManager,
  type SessionManager,
} from "./SessionManager";
import { freezeEvent, freezeRequest } from "../utils/FreezeSessionState";
import { nextTurnCount } from "../utils/SessionHelpers";
import { validateSessionIntegrity } from "../validators/validateSessionIntegrity";
import { validateSessionRequest } from "../validators/validateSessionRequest";
import { validateTransitions } from "../validators/validateTransitions";

export interface SessionCoordinatorDeps {
  readonly supervisorPort: CoachSupervisorPort;
  readonly conversationPort?: ConversationRuntimePort;
  readonly clock?: () => string;
}

/**
 * Coordinates session lifecycle ↔ Coach Supervisor.
 * No business / domain logic.
 */
export class SessionCoordinator {
  private readonly clock: () => string;
  private readonly supervisorPort: CoachSupervisorPort;
  private readonly conversationPort: ConversationRuntimePort | null;
  private readonly manager: SessionManager;
  private readonly stateMachine: SessionStateMachine;
  private readonly lifecycleManager: SessionLifecycleManager;
  private readonly contextManager: SessionContextManager;
  private readonly sessionPlanner = createSessionPlanner();
  private readonly interactionPlanner = createInteractionPlanner();
  private readonly continuationPlanner = createContinuationPlanner();
  private readonly contextPlanner = createContextPlanner();
  private readonly responsePlanner = createResponsePlanner();
  private sequence = 0;

  constructor(deps: SessionCoordinatorDeps) {
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.supervisorPort = deps.supervisorPort;
    this.conversationPort = deps.conversationPort ?? null;
    this.manager = createSessionManager();
    this.stateMachine = createSessionStateMachine();
    this.lifecycleManager = createSessionLifecycleManager();
    this.contextManager = createSessionContextManager();
  }

  describe(): SessionResult {
    const now = this.clock();
    const descriptor = buildCoachingSessionDescriptor({
      id: "runtime:coaching-session",
      createdAt: now,
    });
    return buildSessionResult({
      id: `result:describe:${++this.sequence}`,
      operation: SessionOperationKinds.DESCRIBE,
      success: true,
      message: "Coaching Session Runtime capabilities.",
      descriptor,
      startedAt: now,
      completedAt: now,
    });
  }

  validate(request: SessionRequest): SessionResult {
    const startedAt = this.clock();
    const frozen = freezeRequest(request);
    const existing = frozen.sessionId
      ? this.manager.get(frozen.sessionId)
      : null;
    const validation = validateSessionIntegrity({
      request: frozen,
      context: existing,
      response: null,
    });
    const completedAt = this.clock();
    return buildSessionResult({
      id: `result:validate:${++this.sequence}`,
      operation: SessionOperationKinds.VALIDATE,
      success: validation.valid,
      message: validation.valid
        ? "Session validation passed."
        : "Session validation failed.",
      sessionId: frozen.sessionId,
      request: frozen,
      context: existing,
      validation,
      error: validation.valid
        ? null
        : createSessionError({
            code: validation.issues[0]!.code,
            message: validation.issues[0]!.message,
            path: validation.issues[0]!.path,
          }),
      startedAt,
      completedAt,
    });
  }

  startSession(request: SessionRequest): SessionResult {
    return this.runTurn({
      request: freezeRequest({
        ...request,
        kind: SessionRequestKinds.START,
      }),
      operation: SessionOperationKinds.START,
    });
  }

  continueSession(request: SessionRequest): SessionResult {
    return this.runTurn({
      request: freezeRequest({
        ...request,
        kind: SessionRequestKinds.CONTINUE,
      }),
      operation: SessionOperationKinds.CONTINUE,
    });
  }

  endSession(request: SessionRequest): SessionResult {
    return this.runEnd(freezeRequest({
      ...request,
      kind: SessionRequestKinds.END,
    }));
  }

  private runTurn(input: {
    readonly request: SessionRequest;
    readonly operation: typeof SessionOperationKinds.START | typeof SessionOperationKinds.CONTINUE;
  }): SessionResult {
    const startedAt = this.clock();
    const events: SessionEvent[] = [];
    const request = input.request;
    const requestValidation = validateSessionRequest(request);
    if (!requestValidation.valid) {
      return this.fail({
        operation: input.operation,
        request,
        validation: requestValidation,
        startedAt,
        message: "Invalid session request.",
      });
    }

    const existing =
      request.sessionId != null ? this.manager.get(request.sessionId) : null;
    const currentStatus = existing?.state.status ?? null;

    if (input.operation === SessionOperationKinds.START && existing) {
      return this.fail({
        operation: input.operation,
        request,
        validation: Object.freeze({
          valid: false,
          issues: Object.freeze([
            {
              code: "invalid_lifecycle",
              message: "Session already exists.",
              path: "sessionId",
            },
          ]),
        }),
        startedAt,
        message: "Session already exists.",
        sessionId: request.sessionId,
      });
    }

    const transitionValidation = validateTransitions({
      request,
      from: currentStatus,
    });
    if (!transitionValidation.valid) {
      return this.fail({
        operation: input.operation,
        request,
        validation: transitionValidation,
        startedAt,
        message: "Invalid session transition.",
        sessionId: request.sessionId,
        context: existing,
      });
    }

    const transition = this.stateMachine.transition({
      from: currentStatus,
      kind: request.kind,
    });
    if (!transition.allowed || !transition.nextStatus || !transition.nextPhase) {
      return this.fail({
        operation: input.operation,
        request,
        startedAt,
        message: transition.reason ?? "Transition rejected.",
        sessionId: request.sessionId,
        context: existing,
      });
    }

    const sessionId =
      request.sessionId ??
      `session:${++this.sequence}:${startedAt.replace(/[:.]/g, "")}`;

    if (this.conversationPort && request.conversationId) {
      this.conversationPort.describe(request.conversationId);
    }

    const decision =
      input.operation === SessionOperationKinds.CONTINUE
        ? this.continuationPlanner.plan({
            request,
            decisionId: `decision:${++this.sequence}`,
            createdAt: this.clock(),
          })
        : this.sessionPlanner.plan({
            request,
            decisionId: `decision:${++this.sequence}`,
            createdAt: this.clock(),
          });

    void decision;
    this.contextPlanner.plan({ request, sessionId });
    this.interactionPlanner.plan({
      actionId: `action:${++this.sequence}`,
      sessionId,
      request,
      createdAt: this.clock(),
    });

    const supervisor = this.invokeSupervisor(request, sessionId);
    this.responsePlanner.plan(supervisor);

    if (!supervisor.success) {
      return this.fail({
        operation: input.operation,
        request,
        startedAt,
        message: supervisor.errorMessage ?? "Supervisor invocation failed.",
        sessionId,
        context: existing,
      });
    }

    const now = this.clock();
    const baseState =
      existing?.state ??
      this.manager.createState({
        id: `state:${sessionId}`,
        sessionId,
        updatedAt: now,
      });
    const turnCount = nextTurnCount(baseState.turnCount);
    const state = this.manager.updateState({
      state: baseState,
      status: transition.nextStatus,
      phase: transition.nextPhase,
      turnCount,
      lastRequestId: request.id,
      errorMessage: null,
      updatedAt: now,
    });

    const baseLifecycle =
      existing?.lifecycle ??
      this.lifecycleManager.create({
        id: `life:${sessionId}`,
        sessionId,
        updatedAt: now,
      });
    const lifecycle = this.lifecycleManager.advance({
      lifecycle: baseLifecycle,
      status: state.status,
      phase: state.phase,
      updatedAt: now,
    });

    const response = buildSessionResponse({
      id: `response:${++this.sequence}`,
      sessionId,
      requestId: request.id,
      supervisor,
      createdAt: now,
    });

    events.push(
      this.event(
        input.operation === SessionOperationKinds.START
          ? SessionEventTypes.SESSION_STARTED
          : SessionEventTypes.SESSION_CONTINUED,
        sessionId,
        request.id,
        input.operation,
        now,
      ),
      this.event(
        SessionEventTypes.SUPERVISOR_INVOKED,
        sessionId,
        request.id,
        "supervisor_invoked",
        now,
      ),
      this.event(
        SessionEventTypes.RESPONSE_BUILT,
        sessionId,
        request.id,
        "response_built",
        now,
      ),
    );

    const checkpoint = buildSessionCheckpoint({
      id: `checkpoint:${++this.sequence}`,
      sessionId,
      turnCount,
      status: state.status,
      phase: state.phase,
      lastRequestId: request.id,
      lastResponseId: response.id,
      createdAt: now,
    });
    events.push(
      this.event(
        SessionEventTypes.CHECKPOINT_CREATED,
        sessionId,
        request.id,
        "checkpoint_created",
        now,
      ),
    );

    const baseContext =
      existing ??
      buildSessionContext({
        id: `ctx:${sessionId}`,
        sessionId,
        conversationId: request.conversationId,
        athleteId: request.athleteId,
        request,
        state,
        lifecycle,
        history: buildEmptySessionHistory({
          id: `hist:${sessionId}`,
          sessionId,
          createdAt: now,
        }),
        checkpoint: null,
        createdAt: now,
      });

    const context = this.contextManager.withTurn({
      context: {
        ...baseContext,
        conversationId: request.conversationId ?? baseContext.conversationId,
        athleteId: request.athleteId ?? baseContext.athleteId,
      },
      entryId: `entry:${++this.sequence}`,
      request: freezeRequest({ ...request, sessionId }),
      response,
      state,
      lifecycle,
      checkpoint,
      events,
      updatedAt: now,
    });

    const integrity = validateSessionIntegrity({
      request: freezeRequest({ ...request, sessionId }),
      context,
      response,
    });
    if (!integrity.valid) {
      return this.fail({
        operation: input.operation,
        request,
        validation: integrity,
        startedAt,
        message: "Session integrity validation failed.",
        sessionId,
        context,
        response,
      });
    }

    this.manager.put(context);

    const summary = buildSessionSummary({
      id: `summary:${++this.sequence}`,
      context,
      agentInvocationCount: 1,
      successCount: 1,
      failureCount: 0,
      createdAt: now,
    });
    const timeline = buildSessionTimeline({
      id: `timeline:${++this.sequence}`,
      sessionId,
      events: context.history.events,
      createdAt: now,
    });
    const snapshot = buildSessionSnapshot({
      id: `snapshot:${++this.sequence}`,
      sessionId,
      request: freezeRequest({ ...request, sessionId }),
      context,
      response,
      summary,
      timeline,
      createdAt: now,
    });

    const completedAt = this.clock();
    events.push(
      this.event(
        SessionEventTypes.COMPLETED,
        sessionId,
        request.id,
        "completed",
        completedAt,
      ),
    );

    return buildSessionResult({
      id: `result:${input.operation}:${this.sequence}`,
      operation: input.operation,
      success: true,
      message:
        input.operation === SessionOperationKinds.START
          ? "Coaching session started."
          : "Coaching session continued.",
      sessionId,
      request: freezeRequest({ ...request, sessionId }),
      context,
      response,
      summary,
      snapshot,
      validation: integrity,
      events: Object.freeze(events),
      startedAt,
      completedAt,
    });
  }

  private runEnd(request: SessionRequest): SessionResult {
    const startedAt = this.clock();
    const requestValidation = validateSessionRequest(request);
    if (!requestValidation.valid || !request.sessionId) {
      return this.fail({
        operation: SessionOperationKinds.END,
        request,
        validation: requestValidation.valid
          ? Object.freeze({
              valid: false,
              issues: Object.freeze([
                {
                  code: "invalid_request",
                  message: "sessionId is required to end a session.",
                  path: "sessionId",
                },
              ]),
            })
          : requestValidation,
        startedAt,
        message: "Invalid end-session request.",
      });
    }

    const existing = this.manager.get(request.sessionId);
    const transitionValidation = validateTransitions({
      request,
      from: existing?.state.status ?? null,
    });
    if (!existing || !transitionValidation.valid) {
      return this.fail({
        operation: SessionOperationKinds.END,
        request,
        validation: transitionValidation,
        startedAt,
        message: existing
          ? "Invalid session transition."
          : "Session not found.",
        sessionId: request.sessionId,
        context: existing,
      });
    }

    const transition = this.stateMachine.transition({
      from: existing.state.status,
      kind: request.kind,
    });
    if (!transition.allowed || !transition.nextStatus || !transition.nextPhase) {
      return this.fail({
        operation: SessionOperationKinds.END,
        request,
        startedAt,
        message: transition.reason ?? "End transition rejected.",
        sessionId: request.sessionId,
        context: existing,
      });
    }

    const now = this.clock();
    const state = this.manager.updateState({
      state: existing.state,
      status: transition.nextStatus,
      phase: transition.nextPhase,
      updatedAt: now,
    });
    const lifecycle = this.lifecycleManager.advance({
      lifecycle: existing.lifecycle,
      status: state.status,
      phase: state.phase,
      updatedAt: now,
    });

    const events: SessionEvent[] = [
      this.event(
        SessionEventTypes.SESSION_ENDED,
        request.sessionId,
        request.id,
        "session_ended",
        now,
      ),
    ];

    const context = this.contextManager.withTurn({
      context: existing,
      entryId: `entry:${++this.sequence}`,
      request,
      response: null,
      state,
      lifecycle,
      checkpoint: existing.checkpoint,
      events,
      updatedAt: now,
    });
    this.manager.put(context);

    const summary = buildSessionSummary({
      id: `summary:${++this.sequence}`,
      context,
      agentInvocationCount: context.history.entries.filter((e) => e.response).length,
      successCount: 1,
      failureCount: 0,
      createdAt: now,
    });
    const timeline = buildSessionTimeline({
      id: `timeline:${++this.sequence}`,
      sessionId: request.sessionId,
      events: context.history.events,
      createdAt: now,
    });
    const snapshot = buildSessionSnapshot({
      id: `snapshot:${++this.sequence}`,
      sessionId: request.sessionId,
      request,
      context,
      response: null,
      summary,
      timeline,
      createdAt: now,
    });

    const completedAt = this.clock();
    return buildSessionResult({
      id: `result:end:${this.sequence}`,
      operation: SessionOperationKinds.END,
      success: true,
      message: "Coaching session ended.",
      sessionId: request.sessionId,
      request,
      context,
      summary,
      snapshot,
      events: Object.freeze(events),
      startedAt,
      completedAt,
    });
  }

  private invokeSupervisor(
    request: SessionRequest,
    sessionId: string,
  ): CoachSupervisorPortResult {
    return this.supervisorPort.process({
      requestId: request.id,
      sessionId,
      conversationId: request.conversationId,
      athleteId: request.athleteId,
      message: request.message,
      intent: request.intent,
      requiredCapabilityIds: request.requiredCapabilityIds,
    });
  }

  private event(
    type: SessionEvent["type"],
    sessionId: string,
    requestId: string | null,
    message: string | null,
    occurredAt: string,
  ): SessionEvent {
    return freezeEvent({
      id: `event:${++this.sequence}:${type}`,
      type,
      sessionId,
      requestId,
      message,
      metadata: EMPTY_SESSION_METADATA,
      occurredAt,
    });
  }

  private fail(input: {
    readonly operation: SessionResult["operation"];
    readonly request: SessionRequest;
    readonly startedAt: string;
    readonly message: string;
    readonly validation?: SessionValidation;
    readonly sessionId?: string | null;
    readonly context?: SessionResult["context"];
    readonly response?: SessionResult["response"];
  }): SessionResult {
    const completedAt = this.clock();
    const validation =
      input.validation ??
      Object.freeze({
        valid: false,
        issues: Object.freeze([
          {
            code: "failed",
            message: input.message,
            path: null as string | null,
          },
        ]),
      });
    return buildSessionResult({
      id: `result:fail:${++this.sequence}`,
      operation: input.operation,
      success: false,
      message: input.message,
      sessionId: input.sessionId ?? input.request.sessionId,
      request: input.request,
      context: input.context ?? null,
      response: input.response ?? null,
      validation,
      error: createSessionError({
        code: validation.issues[0]?.code ?? "failed",
        message: input.message,
        path: validation.issues[0]?.path ?? null,
      }),
      events: Object.freeze([
        this.event(
          SessionEventTypes.FAILED,
          input.sessionId ?? input.request.sessionId ?? "session:unknown",
          input.request.id,
          input.message,
          completedAt,
        ),
      ]),
      startedAt: input.startedAt,
      completedAt,
    });
  }
}

export function createSessionCoordinator(
  deps: SessionCoordinatorDeps,
): SessionCoordinator {
  return new SessionCoordinator(deps);
}
