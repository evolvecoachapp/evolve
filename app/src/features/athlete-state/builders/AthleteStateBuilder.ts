import { EMPTY_ATHLETE_METADATA } from "../models/AthleteMetadata";
import { AthleteStatusKinds } from "../models/AthleteStatus";
import type { AthleteState } from "../models/AthleteState";
import {
  AthleteStateCapabilityKinds,
  type AthleteStateDescriptor,
} from "../models/AthleteStateDescriptor";
import { INITIAL_STATE_VERSION } from "../models/StateVersion";
import {
  freezeDescriptor,
  freezeState,
} from "../utils/FreezeAthleteState";

export function buildEmptyAthleteState(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly displayName?: string | null;
  readonly at: string;
}): AthleteState {
  const identity = Object.freeze({
    athleteId: input.athleteId,
    displayName: input.displayName ?? null,
    externalIds: Object.freeze({} as Record<string, string>),
  });
  const status = Object.freeze({
    kind: AthleteStatusKinds.UNKNOWN,
    label: null,
    notes: Object.freeze([] as string[]),
  });
  const emptyNotes = Object.freeze([] as string[]);
  const emptyAgents = Object.freeze([] as string[]);
  const measurements = Object.freeze({
    heightCm: null,
    weightKg: null,
    waistCm: null,
    chestCm: null,
    hipsCm: null,
    recordedAt: null,
  });
  const composition = Object.freeze({
    bodyFatPercent: null,
    leanMassKg: null,
    fatMassKg: null,
    recordedAt: null,
  });

  return freezeState({
    id: input.id,
    athleteId: input.athleteId,
    version: INITIAL_STATE_VERSION,
    identity,
    profile: Object.freeze({
      identity,
      status,
      sex: null,
      birthYear: null,
      experienceLevel: null,
      metadata: EMPTY_ATHLETE_METADATA,
    }),
    metrics: Object.freeze({
      measurements,
      composition,
      restingHeartRate: null,
      vo2Max: null,
      notes: emptyNotes,
    }),
    status,
    bodyComposition: composition,
    bodyMeasurements: measurements,
    training: Object.freeze({
      phase: null,
      focus: null,
      sessionsPerWeek: null,
      lastSessionId: null,
      lastSessionAt: null,
      programId: null,
      notes: emptyNotes,
      sourceAgentIds: emptyAgents,
    }),
    recovery: Object.freeze({
      status: null,
      lastRecoverySessionId: null,
      lastAssessedAt: null,
      modalities: emptyNotes,
      notes: emptyNotes,
      sourceAgentIds: emptyAgents,
    }),
    nutrition: Object.freeze({
      planId: null,
      dietaryPattern: null,
      lastLoggedAt: null,
      targetsPresent: false,
      notes: emptyNotes,
      sourceAgentIds: emptyAgents,
    }),
    performance: Object.freeze({
      lastSnapshotId: null,
      trendLabel: null,
      highlights: emptyNotes,
      notes: emptyNotes,
      sourceAgentIds: emptyAgents,
    }),
    lifestyle: Object.freeze({
      activityLevel: null,
      occupationLoad: null,
      notes: emptyNotes,
    }),
    health: Object.freeze({
      flags: emptyNotes,
      clearanceStatus: null,
      notes: emptyNotes,
    }),
    readiness: Object.freeze({
      label: null,
      reportedAt: null,
      notes: emptyNotes,
    }),
    fatigue: Object.freeze({
      label: null,
      reportedAt: null,
      notes: emptyNotes,
    }),
    sleep: Object.freeze({
      lastNightHours: null,
      qualityLabel: null,
      reportedAt: null,
      notes: emptyNotes,
    }),
    stress: Object.freeze({
      label: null,
      reportedAt: null,
      notes: emptyNotes,
    }),
    hydration: Object.freeze({
      status: null,
      reportedAt: null,
      notes: emptyNotes,
    }),
    energyAvailability: Object.freeze({
      label: null,
      reportedAt: null,
      notes: emptyNotes,
    }),
    goals: Object.freeze({
      primaryGoalId: null,
      items: Object.freeze([] as never[]),
      sourceAgentIds: emptyAgents,
    }),
    preferences: Object.freeze({
      preferredTrainingTimes: emptyNotes,
      preferredModalities: emptyNotes,
      dietaryPreferences: emptyNotes,
      communicationTone: null,
      notes: emptyNotes,
    }),
    constraints: Object.freeze({
      injuries: emptyNotes,
      equipmentLimits: emptyNotes,
      scheduleLimits: emptyNotes,
      medicalFlags: emptyNotes,
      notes: emptyNotes,
    }),
    progress: Object.freeze({
      milestones: emptyNotes,
      recentWins: emptyNotes,
      blockers: emptyNotes,
      notes: emptyNotes,
      sourceAgentIds: emptyAgents,
    }),
    coaching: Object.freeze({
      activeSessionId: null,
      lastSessionId: null,
      lastIntent: null,
      focusAreas: emptyNotes,
      notes: emptyNotes,
      sourceSessionIds: emptyNotes,
    }),
    history: Object.freeze({
      athleteId: input.athleteId,
      entries: Object.freeze([] as never[]),
      metadata: EMPTY_ATHLETE_METADATA,
    }),
    timeline: Object.freeze({
      athleteId: input.athleteId,
      items: Object.freeze([] as never[]),
      metadata: EMPTY_ATHLETE_METADATA,
    }),
    statistics: Object.freeze({
      updateCount: 0,
      snapshotCount: 0,
      historyEntryCount: 0,
      timelineItemCount: 0,
      goalCount: 0,
      sourceAgentCount: 0,
    }),
    decisionHistory: Object.freeze({
      athleteId: input.athleteId,
      entries: Object.freeze([] as never[]),
    }),
    diagnostics: Object.freeze({
      warnings: emptyNotes,
      notes: emptyNotes,
      metadata: EMPTY_ATHLETE_METADATA,
    }),
    summary: null,
    metadata: EMPTY_ATHLETE_METADATA,
    createdAt: input.at,
    updatedAt: input.at,
    frozenAt: input.at,
  });
}

export function buildAthleteStateDescriptor(input: {
  readonly id: string;
  readonly createdAt: string;
}): AthleteStateDescriptor {
  return freezeDescriptor({
    id: input.id,
    name: "Athlete State Engine",
    version: "1.0.0",
    capabilities: Object.freeze([
      AthleteStateCapabilityKinds.BUILD,
      AthleteStateCapabilityKinds.UPDATE,
      AthleteStateCapabilityKinds.SNAPSHOT,
      AthleteStateCapabilityKinds.DESCRIBE,
      AthleteStateCapabilityKinds.VALIDATE,
    ]),
    metadata: EMPTY_ATHLETE_METADATA,
    createdAt: input.createdAt,
  });
}
