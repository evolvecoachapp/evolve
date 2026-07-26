import type { WorkoutAgentService } from "../../../features/workout-agent/services/WorkoutAgentService";
import type { NutritionAgentService } from "../../../features/nutrition-agent/services/NutritionAgentService";
import type { RecoveryAgentService } from "../../../features/recovery-agent/services/RecoveryAgentService";
import type { CoachingSessionService } from "../../../features/coaching-session/services/CoachingSessionService";
import type { CoachSupervisorService } from "../../../features/coach-supervisor/services/CoachSupervisorService";
import {
  createAthleteStateService,
  type AthleteStateService,
} from "../../../features/athlete-state/services/AthleteStateService";
import {
  createContextFusionService,
  type ContextFusionService,
} from "../../../features/context-fusion/services/ContextFusionService";
import {
  createDecisionEngineService,
  type DecisionEngineService,
} from "../../../features/decision-engine/services/DecisionEngineService";
import {
  createRecommendationEngineService,
  type RecommendationEngineService,
} from "../../../features/recommendation-engine/services/RecommendationEngineService";
import {
  createAthleteWorkoutAgentPortAdapter,
  createAthleteNutritionAgentPortAdapter,
  createAthleteRecoveryAgentPortAdapter,
  createFusionWorkoutAgentPortAdapter,
  createFusionNutritionAgentPortAdapter,
  createFusionRecoveryAgentPortAdapter,
  createFusionAthleteStatePortAdapter,
  createFusionSessionPortAdapter,
  createFusionSupervisorPortAdapter,
  createFusionConversationPortAdapter,
  createDecisionContextFusionPortAdapter,
  createDecisionAthleteStatePortAdapter,
  createDecisionSupervisorPortAdapter,
  createRecommendationDecisionEnginePortAdapter,
  createRecommendationAthleteStatePortAdapter,
  createRecommendationSupervisorPortAdapter,
  createRecommendationContextFusionPortAdapter,
} from "../adapters";

export interface AthleteStateFactoryDeps {
  readonly workoutAgent: WorkoutAgentService;
  readonly nutritionAgent: NutritionAgentService;
  readonly recoveryAgent: RecoveryAgentService;
}

export const AthleteStateFactory = {
  create(deps: AthleteStateFactoryDeps): AthleteStateService {
    return createAthleteStateService({
      workoutPort: createAthleteWorkoutAgentPortAdapter(deps.workoutAgent),
      nutritionPort: createAthleteNutritionAgentPortAdapter(deps.nutritionAgent),
      recoveryPort: createAthleteRecoveryAgentPortAdapter(deps.recoveryAgent),
    });
  },
} as const;

export interface ContextFusionFactoryDeps {
  readonly athleteState: AthleteStateService;
  readonly coachingSession: CoachingSessionService;
  readonly supervisor: CoachSupervisorService;
  readonly workoutAgent: WorkoutAgentService;
  readonly nutritionAgent: NutritionAgentService;
  readonly recoveryAgent: RecoveryAgentService;
}

export const ContextFusionFactory = {
  create(deps: ContextFusionFactoryDeps): ContextFusionService {
    return createContextFusionService({
      conversationPort: createFusionConversationPortAdapter(),
      sessionPort: createFusionSessionPortAdapter(deps.coachingSession),
      athletePort: createFusionAthleteStatePortAdapter(deps.athleteState),
      workoutPort: createFusionWorkoutAgentPortAdapter(deps.workoutAgent),
      nutritionPort: createFusionNutritionAgentPortAdapter(deps.nutritionAgent),
      recoveryPort: createFusionRecoveryAgentPortAdapter(deps.recoveryAgent),
      supervisorPort: createFusionSupervisorPortAdapter(deps.supervisor),
    });
  },
} as const;

export interface DecisionEngineFactoryDeps {
  readonly contextFusion: ContextFusionService;
  readonly athleteState: AthleteStateService;
  readonly supervisor: CoachSupervisorService;
}

export const DecisionEngineFactory = {
  create(deps: DecisionEngineFactoryDeps): DecisionEngineService {
    return createDecisionEngineService({
      contextFusionPort: createDecisionContextFusionPortAdapter(
        deps.contextFusion,
      ),
      athleteStatePort: createDecisionAthleteStatePortAdapter(deps.athleteState),
      supervisorPort: createDecisionSupervisorPortAdapter(deps.supervisor),
    });
  },
} as const;

export interface RecommendationEngineFactoryDeps {
  readonly decisionEngine: DecisionEngineService;
  readonly contextFusion: ContextFusionService;
  readonly athleteState: AthleteStateService;
  readonly supervisor: CoachSupervisorService;
}

export const RecommendationEngineFactory = {
  create(deps: RecommendationEngineFactoryDeps): RecommendationEngineService {
    return createRecommendationEngineService({
      decisionEnginePort: createRecommendationDecisionEnginePortAdapter(
        deps.decisionEngine,
      ),
      contextFusionPort: createRecommendationContextFusionPortAdapter(
        deps.contextFusion,
      ),
      athleteStatePort: createRecommendationAthleteStatePortAdapter(
        deps.athleteState,
      ),
      supervisorPort: createRecommendationSupervisorPortAdapter(deps.supervisor),
    });
  },
} as const;
