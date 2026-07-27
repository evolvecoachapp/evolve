import type { PlanChangeReason } from "../../plan-history/models/PlanChangeReason";
import { PlanChangeReasons } from "../../plan-history/models/PlanChangeReason";
import type { PlanType } from "../../plan-history/models/PlanType";
import { PlanTypes } from "../../plan-history/models/PlanType";
import {
  EMPTY_RESTORE_METADATA,
  type PlanRestoreRequest,
} from "../models/PlanRestoreRequest";
import {
  PlanRestoreTargetKinds,
  type PlanRestoreTarget,
  type PlanRestoreTargetKind,
} from "../models/PlanRestoreTarget";

const RESTORE_PATTERNS: readonly RegExp[] = Object.freeze([
  /\b(undo|revert|restore|roll\s*back|bring\s+back)\b/i,
  /\b(previous|prior|original|earlier|yesterday'?s?)\s+(version|workout|plan|diet|nutrition)\b/i,
  /\bi liked the previous\b/i,
  /\boriginal (diet|nutrition|workout|plan)\b/i,
]);

/**
 * Deterministic detection of plan restore conversation messages.
 */
export function isPlanRestoreMessage(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) return false;
  return RESTORE_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function inferPlanTypeFromMessage(message: string): PlanType {
  if (/\b(diet|nutrition|meal|calorie|macro)\b/i.test(message)) {
    return PlanTypes.NUTRITION;
  }
  return PlanTypes.WORKOUT;
}

export function inferRestoreTargetKind(message: string): PlanRestoreTargetKind {
  const lower = message.toLowerCase();
  if (/\b(original|initial|first)\b/.test(lower)) {
    return PlanRestoreTargetKinds.INITIAL_VERSION;
  }
  if (/\bversion\s*#?\s*(\d+)\b/.test(lower)) {
    return PlanRestoreTargetKinds.VERSION_NUMBER;
  }
  if (/\byesterday\b|\b(\d{4}-\d{2}-\d{2})\b/.test(lower)) {
    return PlanRestoreTargetKinds.TIMESTAMP;
  }
  if (
    /\b(generated|modified|adapted|restored|initial|manual)\b/.test(lower) &&
    /\b(reason|because|when it was)\b/.test(lower)
  ) {
    return PlanRestoreTargetKinds.CHANGE_REASON;
  }
  if (/\b(undo|last change|previous|prior|liked the previous)\b/.test(lower)) {
    return PlanRestoreTargetKinds.PREVIOUS_VERSION;
  }
  if (/\blast version\b/.test(lower)) {
    return PlanRestoreTargetKinds.LAST_VERSION;
  }
  return PlanRestoreTargetKinds.PREVIOUS_VERSION;
}

function extractVersionNumber(message: string): number | null {
  const match = message.match(/\bversion\s*#?\s*(\d+)\b/i);
  if (!match) return null;
  return Number(match[1]);
}

function extractTimestamp(message: string, fallbackClock: () => string): string | null {
  const iso = message.match(/\b(\d{4}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?)?)\b/);
  if (iso?.[1]) {
    const raw = iso[1].includes("T") ? iso[1] : `${iso[1]}T23:59:59.000Z`;
    return raw.endsWith("Z") ? raw : `${raw}Z`;
  }
  if (/\byesterday\b/i.test(message)) {
    const now = Date.parse(fallbackClock());
    if (Number.isNaN(now)) return null;
    return new Date(now - 24 * 60 * 60 * 1000).toISOString();
  }
  return null;
}

function extractChangeReason(message: string): PlanChangeReason | null {
  const lower = message.toLowerCase();
  for (const reason of Object.values(PlanChangeReasons)) {
    if (lower.includes(reason)) return reason;
  }
  return null;
}

/**
 * Build an immutable restore target from a coaching message.
 */
export function buildRestoreTargetFromMessage(input: {
  readonly message: string;
  readonly lineageId: string;
  readonly planType?: PlanType;
  readonly clock?: () => string;
}): PlanRestoreTarget {
  const clock = input.clock ?? (() => new Date().toISOString());
  const kind = inferRestoreTargetKind(input.message);
  const planType = input.planType ?? inferPlanTypeFromMessage(input.message);

  return Object.freeze({
    kind,
    planType,
    lineageId: input.lineageId,
    versionNumber:
      kind === PlanRestoreTargetKinds.VERSION_NUMBER
        ? extractVersionNumber(input.message)
        : null,
    timestamp:
      kind === PlanRestoreTargetKinds.TIMESTAMP
        ? extractTimestamp(input.message, clock)
        : null,
    changeReason:
      kind === PlanRestoreTargetKinds.CHANGE_REASON
        ? extractChangeReason(input.message)
        : null,
    snapshotId: null,
  });
}

export function buildPlanRestoreRequest(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly conversationId: string | null;
  readonly sessionId: string | null;
  readonly message: string;
  readonly lineageId: string;
  readonly planType?: PlanType;
  readonly target?: PlanRestoreTarget;
  readonly createdAt: string;
  readonly clock?: () => string;
}): PlanRestoreRequest {
  const target =
    input.target ??
    buildRestoreTargetFromMessage({
      message: input.message,
      lineageId: input.lineageId,
      planType: input.planType,
      clock: input.clock,
    });

  return Object.freeze({
    id: input.id,
    athleteId: input.athleteId,
    conversationId: input.conversationId,
    sessionId: input.sessionId,
    message: input.message,
    target,
    metadata: EMPTY_RESTORE_METADATA,
    createdAt: input.createdAt,
  });
}
