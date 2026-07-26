import type { WorkoutAgentService } from "../../../features/workout-agent/services/WorkoutAgentService";
import type { NutritionAgentService } from "../../../features/nutrition-agent/services/NutritionAgentService";
import type { RecoveryAgentService } from "../../../features/recovery-agent/services/RecoveryAgentService";
import type { WorkoutAgentPort as AthleteWorkoutPort } from "../../../features/athlete-state/contracts/WorkoutAgentPort";
import type { NutritionAgentPort as AthleteNutritionPort } from "../../../features/athlete-state/contracts/NutritionAgentPort";
import type { RecoveryAgentPort as AthleteRecoveryPort } from "../../../features/athlete-state/contracts/RecoveryAgentPort";
import { SpecialistSources } from "../../../features/athlete-state/models/SpecialistContribution";
import { EMPTY_ATHLETE_METADATA } from "../../../features/athlete-state/models/AthleteMetadata";
import { freezeContribution as freezeAthleteContribution } from "../../../features/athlete-state/utils/FreezeAthleteState";
import type { WorkoutAgentPort as FusionWorkoutPort } from "../../../features/context-fusion/contracts/WorkoutAgentPort";
import type { NutritionAgentPort as FusionNutritionPort } from "../../../features/context-fusion/contracts/NutritionAgentPort";
import type { RecoveryAgentPort as FusionRecoveryPort } from "../../../features/context-fusion/contracts/RecoveryAgentPort";
import type { AthleteStatePort as FusionAthleteStatePort } from "../../../features/context-fusion/contracts/AthleteStatePort";
import type { CoachingSessionPort as FusionSessionPort } from "../../../features/context-fusion/contracts/CoachingSessionPort";
import type { SupervisorPort as FusionSupervisorPort } from "../../../features/context-fusion/contracts/SupervisorPort";
import type { ConversationRuntimePort as FusionConversationPort } from "../../../features/context-fusion/contracts/ConversationRuntimePort";
import { ContextSourceKinds } from "../../../features/context-fusion/models/ContextSource";
import { EMPTY_CONTEXT_METADATA } from "../../../features/context-fusion/models/ContextMetadata";
import { freezeContribution as freezeFusionContribution } from "../../../features/context-fusion/utils/FreezeContext";
import type { AthleteStateService } from "../../../features/athlete-state/services/AthleteStateService";
import { AthleteStateRequestKinds } from "../../../features/athlete-state/models/AthleteStateRequest";
import type { CoachingSessionService } from "../../../features/coaching-session/services/CoachingSessionService";
import type { CoachSupervisorService } from "../../../features/coach-supervisor/services/CoachSupervisorService";

/**
 * Thin contribution adapters — structural mapping from live services only.
 */

export function createAthleteWorkoutAgentPortAdapter(
  workout: WorkoutAgentService,
): AthleteWorkoutPort {
  const port: AthleteWorkoutPort = {
    contribute(input) {
      const agent = workout.describeCapabilities();
      const at = input.at ?? new Date().toISOString();
      return freezeAthleteContribution({
        id: `contribution:workout:${input.athleteId}`,
        source: SpecialistSources.WORKOUT,
        agentId: input.agentId ?? agent.id,
        athleteId: input.athleteId,
        training: Object.freeze({
          phase: "active",
          focus: "strength",
          sessionsPerWeek: 0,
          lastSessionId: null,
          lastSessionAt: null,
          programId: null,
          notes: Object.freeze([`wired:${agent.id}`]),
          sourceAgentIds: Object.freeze([agent.id]),
        }),
        recovery: null,
        nutrition: null,
        performance: null,
        readiness: null,
        fatigue: null,
        sleep: null,
        stress: null,
        goals: null,
        preferences: null,
        constraints: null,
        progress: null,
        coaching: null,
        notes: Object.freeze(["composition workout agent port"]),
        metadata: EMPTY_ATHLETE_METADATA,
        contributedAt: at,
      });
    },
  };
  return port;
}

export function createAthleteNutritionAgentPortAdapter(
  nutrition: NutritionAgentService,
): AthleteNutritionPort {
  const port: AthleteNutritionPort = {
    contribute(input) {
      const agent = nutrition.describeCapabilities();
      const at = input.at ?? new Date().toISOString();
      return freezeAthleteContribution({
        id: `contribution:nutrition:${input.athleteId}`,
        source: SpecialistSources.NUTRITION,
        agentId: input.agentId ?? agent.id,
        athleteId: input.athleteId,
        training: null,
        recovery: null,
        nutrition: Object.freeze({
          planId: null,
          dietaryPattern: "balanced",
          lastLoggedAt: at,
          targetsPresent: false,
          notes: Object.freeze([`wired:${agent.id}`]),
          sourceAgentIds: Object.freeze([agent.id]),
        }),
        performance: null,
        readiness: null,
        fatigue: null,
        sleep: null,
        stress: null,
        goals: null,
        preferences: null,
        constraints: null,
        progress: null,
        coaching: null,
        notes: Object.freeze(["composition nutrition agent port"]),
        metadata: EMPTY_ATHLETE_METADATA,
        contributedAt: at,
      });
    },
  };
  return port;
}

export function createAthleteRecoveryAgentPortAdapter(
  recovery: RecoveryAgentService,
): AthleteRecoveryPort {
  const port: AthleteRecoveryPort = {
    contribute(input) {
      const agent = recovery.describeCapabilities();
      const at = input.at ?? new Date().toISOString();
      return freezeAthleteContribution({
        id: `contribution:recovery:${input.athleteId}`,
        source: SpecialistSources.RECOVERY,
        agentId: input.agentId ?? agent.id,
        athleteId: input.athleteId,
        training: null,
        recovery: Object.freeze({
          status: "adequate",
          lastRecoverySessionId: null,
          lastAssessedAt: at,
          modalities: Object.freeze([] as string[]),
          notes: Object.freeze([`wired:${agent.id}`]),
          sourceAgentIds: Object.freeze([agent.id]),
        }),
        nutrition: null,
        performance: null,
        readiness: null,
        fatigue: null,
        sleep: null,
        stress: null,
        goals: null,
        preferences: null,
        constraints: null,
        progress: null,
        coaching: null,
        notes: Object.freeze(["composition recovery agent port"]),
        metadata: EMPTY_ATHLETE_METADATA,
        contributedAt: at,
      });
    },
  };
  return port;
}

export function createFusionWorkoutAgentPortAdapter(
  workout: WorkoutAgentService,
): FusionWorkoutPort {
  const port: FusionWorkoutPort = {
    contribute(input) {
      const agent = workout.describeCapabilities();
      const at = input.at ?? new Date().toISOString();
      return freezeFusionContribution({
        id: `contribution:workout:${input.athleteId}`,
        sourceKind: ContextSourceKinds.WORKOUT,
        agentId: input.agentId ?? agent.id,
        athleteId: input.athleteId,
        sessionId: input.sessionId ?? null,
        conversationId: input.conversationId ?? null,
        slice: Object.freeze({
          id: `slice:workout:${input.athleteId}`,
          sourceKind: ContextSourceKinds.WORKOUT,
          referenceId: agent.id,
          label: "workout agent",
          facts: Object.freeze({ agentId: agent.id, wired: true }),
          notes: Object.freeze(["composition workout fusion port"]),
          metadata: EMPTY_CONTEXT_METADATA,
          contributedAt: at,
        }),
        version: null,
        notes: Object.freeze(["composition workout fusion port"]),
        metadata: EMPTY_CONTEXT_METADATA,
        contributedAt: at,
      });
    },
  };
  return port;
}

export function createFusionNutritionAgentPortAdapter(
  nutrition: NutritionAgentService,
): FusionNutritionPort {
  const port: FusionNutritionPort = {
    contribute(input) {
      const agent = nutrition.describeCapabilities();
      const at = input.at ?? new Date().toISOString();
      return freezeFusionContribution({
        id: `contribution:nutrition:${input.athleteId}`,
        sourceKind: ContextSourceKinds.NUTRITION,
        agentId: input.agentId ?? agent.id,
        athleteId: input.athleteId,
        sessionId: input.sessionId ?? null,
        conversationId: input.conversationId ?? null,
        slice: Object.freeze({
          id: `slice:nutrition:${input.athleteId}`,
          sourceKind: ContextSourceKinds.NUTRITION,
          referenceId: agent.id,
          label: "nutrition agent",
          facts: Object.freeze({ agentId: agent.id, wired: true }),
          notes: Object.freeze(["composition nutrition fusion port"]),
          metadata: EMPTY_CONTEXT_METADATA,
          contributedAt: at,
        }),
        version: null,
        notes: Object.freeze(["composition nutrition fusion port"]),
        metadata: EMPTY_CONTEXT_METADATA,
        contributedAt: at,
      });
    },
  };
  return port;
}

export function createFusionRecoveryAgentPortAdapter(
  recovery: RecoveryAgentService,
): FusionRecoveryPort {
  const port: FusionRecoveryPort = {
    contribute(input) {
      const agent = recovery.describeCapabilities();
      const at = input.at ?? new Date().toISOString();
      return freezeFusionContribution({
        id: `contribution:recovery:${input.athleteId}`,
        sourceKind: ContextSourceKinds.RECOVERY,
        agentId: input.agentId ?? agent.id,
        athleteId: input.athleteId,
        sessionId: input.sessionId ?? null,
        conversationId: input.conversationId ?? null,
        slice: Object.freeze({
          id: `slice:recovery:${input.athleteId}`,
          sourceKind: ContextSourceKinds.RECOVERY,
          referenceId: agent.id,
          label: "recovery agent",
          facts: Object.freeze({ agentId: agent.id, wired: true }),
          notes: Object.freeze(["composition recovery fusion port"]),
          metadata: EMPTY_CONTEXT_METADATA,
          contributedAt: at,
        }),
        version: null,
        notes: Object.freeze(["composition recovery fusion port"]),
        metadata: EMPTY_CONTEXT_METADATA,
        contributedAt: at,
      });
    },
  };
  return port;
}

export function createFusionAthleteStatePortAdapter(
  athleteState: AthleteStateService,
): FusionAthleteStatePort {
  const port: FusionAthleteStatePort = {
    contribute(input) {
      const at = input.at ?? new Date().toISOString();
      const built = athleteState.buildAthleteState({
        id: `request:athlete:${input.athleteId}`,
        kind: AthleteStateRequestKinds.BUILD,
        athleteId: input.athleteId,
        stateId: null,
        contributions: Object.freeze([]),
        sessionId: input.sessionId ?? null,
        reason: "context-fusion contribution",
        metadata: EMPTY_ATHLETE_METADATA,
        createdAt: at,
      });
      if (!built.success || !built.state) return null;
      return freezeFusionContribution({
        id: `contribution:athlete:${input.athleteId}`,
        sourceKind: ContextSourceKinds.ATHLETE,
        agentId: input.agentId ?? "engine:athlete-state",
        athleteId: input.athleteId,
        sessionId: input.sessionId ?? null,
        conversationId: input.conversationId ?? null,
        slice: Object.freeze({
          id: `slice:athlete:${input.athleteId}`,
          sourceKind: ContextSourceKinds.ATHLETE,
          referenceId: built.state.id,
          label: "athlete state",
          facts: Object.freeze({
            stateId: built.state.id,
            statusKind: built.state.status.kind,
          }),
          notes: Object.freeze(["composition athlete state fusion port"]),
          metadata: EMPTY_CONTEXT_METADATA,
          contributedAt: at,
        }),
        version: null,
        notes: Object.freeze(["composition athlete state fusion port"]),
        metadata: EMPTY_CONTEXT_METADATA,
        contributedAt: at,
      });
    },
  };
  return port;
}

export function createFusionSessionPortAdapter(
  session: CoachingSessionService,
): FusionSessionPort {
  const port: FusionSessionPort = {
    contribute(input) {
      const described = session.describeSession();
      const at = input.at ?? new Date().toISOString();
      const sessionId = input.sessionId ?? described.id;
      return freezeFusionContribution({
        id: `contribution:session:${input.athleteId}`,
        sourceKind: ContextSourceKinds.SESSION,
        agentId: input.agentId ?? described.id,
        athleteId: input.athleteId,
        sessionId,
        conversationId: input.conversationId ?? null,
        slice: Object.freeze({
          id: `slice:session:${input.athleteId}`,
          sourceKind: ContextSourceKinds.SESSION,
          referenceId: sessionId,
          label: "coaching session",
          facts: Object.freeze({
            status: described.status,
            phase: described.phase,
          }),
          notes: Object.freeze(["composition session fusion port"]),
          metadata: EMPTY_CONTEXT_METADATA,
          contributedAt: at,
        }),
        version: null,
        notes: Object.freeze(["composition session fusion port"]),
        metadata: EMPTY_CONTEXT_METADATA,
        contributedAt: at,
      });
    },
  };
  return port;
}

export function createFusionSupervisorPortAdapter(
  supervisor: CoachSupervisorService,
): FusionSupervisorPort {
  const port: FusionSupervisorPort = {
    contribute(input) {
      const described = supervisor.describeCapabilities();
      const at = input.at ?? new Date().toISOString();
      return freezeFusionContribution({
        id: `contribution:supervisor:${input.athleteId}`,
        sourceKind: ContextSourceKinds.SUPERVISOR,
        agentId: input.agentId ?? described.id,
        athleteId: input.athleteId,
        sessionId: input.sessionId ?? null,
        conversationId: input.conversationId ?? null,
        slice: Object.freeze({
          id: `slice:supervisor:${input.athleteId}`,
          sourceKind: ContextSourceKinds.SUPERVISOR,
          referenceId: described.id,
          label: "coach supervisor",
          facts: Object.freeze({
            role: described.role,
            domains: described.supportedDomains.join(","),
          }),
          notes: Object.freeze(["composition supervisor fusion port"]),
          metadata: EMPTY_CONTEXT_METADATA,
          contributedAt: at,
        }),
        version: null,
        notes: Object.freeze(["composition supervisor fusion port"]),
        metadata: EMPTY_CONTEXT_METADATA,
        contributedAt: at,
      });
    },
  };
  return port;
}

export function createFusionConversationPortAdapter(): FusionConversationPort {
  const port: FusionConversationPort = {
    contribute(input) {
      const at = input.at ?? new Date().toISOString();
      return freezeFusionContribution({
        id: `contribution:conversation:${input.athleteId}`,
        sourceKind: ContextSourceKinds.CONVERSATION,
        agentId: input.agentId ?? "runtime:conversation",
        athleteId: input.athleteId,
        sessionId: input.sessionId ?? null,
        conversationId: input.conversationId ?? null,
        slice: Object.freeze({
          id: `slice:conversation:${input.athleteId}`,
          sourceKind: ContextSourceKinds.CONVERSATION,
          referenceId: input.conversationId ?? null,
          label: "conversation runtime",
          facts: Object.freeze({
            conversationId: input.conversationId ?? null,
            active: true,
          }),
          notes: Object.freeze(["composition conversation fusion port"]),
          metadata: EMPTY_CONTEXT_METADATA,
          contributedAt: at,
        }),
        version: null,
        notes: Object.freeze(["composition conversation fusion port"]),
        metadata: EMPTY_CONTEXT_METADATA,
        contributedAt: at,
      });
    },
  };
  return port;
}
