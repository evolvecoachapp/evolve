import { CURRENT_CONVERSATION_PERSISTENCE_VERSION } from "../models/ConversationPersistenceVersion";
import type { ConversationMigrationResult } from "../models/ConversationMigrationResult";
import type { ConversationMessage } from "../models/ConversationMessage";
import type { ConversationMetadata } from "../models/ConversationMetadata";
import type { ConversationSession } from "../models/ConversationSession";
import type { ConversationSnapshot } from "../models/ConversationSnapshot";
import type { ConversationStatus } from "../models/ConversationStatus";
import type { ConversationStreamStatus } from "../models/ConversationStreamStatus";
import { CONVERSATION_STATUSES } from "../models/ConversationStatus";
import { CONVERSATION_STREAM_STATUSES } from "../models/ConversationStreamStatus";
import { validateConversationSnapshot } from "../utils/validateConversationSnapshot";

/**
 * Migrates durable conversation payloads across schema versions.
 *
 * Expected failures return a result object — never throws.
 */
export class ConversationMigrationService {
  readonly currentVersion = CURRENT_CONVERSATION_PERSISTENCE_VERSION;

  migrate(data: unknown): ConversationMigrationResult {
    if (!isRecord(data)) {
      return this.fail(null, "invalid_payload");
    }

    const fromVersion = readVersion(data.schemaVersion);
    if (fromVersion === null) {
      return this.fail(null, "missing_schema_version");
    }

    if (fromVersion > this.currentVersion) {
      // Forward compatibility: accept payloads that still satisfy v1 shape.
      const snapshot = this.coerceSnapshot(data, this.currentVersion);
      if (!snapshot) {
        return this.fail(fromVersion, "unsupported_future_version");
      }

      const issues = validateConversationSnapshot(snapshot);
      if (issues.length > 0) {
        return this.fail(fromVersion, `invalid_snapshot:${issues.join(",")}`);
      }

      return Object.freeze({
        success: true,
        fromVersion,
        toVersion: this.currentVersion,
        snapshot,
        reason: null,
      });
    }

    if (fromVersion < 1) {
      return this.fail(fromVersion, "unsupported_legacy_version");
    }

    let working: Record<string, unknown> = { ...data };

    // Placeholder for future stepwise migrations (1 → 2 → …).
    for (let version = fromVersion; version < this.currentVersion; version += 1) {
      const next = this.migrateStep(working, version);
      if (!next) {
        return this.fail(fromVersion, `migration_failed_at_v${version}`);
      }
      working = next;
    }

    const snapshot = this.coerceSnapshot(working, this.currentVersion);
    if (!snapshot) {
      return this.fail(fromVersion, "invalid_snapshot_shape");
    }

    const issues = validateConversationSnapshot(snapshot);
    if (issues.length > 0) {
      return this.fail(fromVersion, `invalid_snapshot:${issues.join(",")}`);
    }

    return Object.freeze({
      success: true,
      fromVersion,
      toVersion: this.currentVersion,
      snapshot,
      reason: null,
    });
  }

  private migrateStep(
    data: Record<string, unknown>,
    fromVersion: number,
  ): Record<string, unknown> | null {
    // No intermediate versions yet — identity keep for completeness.
    if (fromVersion >= this.currentVersion) {
      return null;
    }

    return {
      ...data,
      schemaVersion: fromVersion + 1,
    };
  }

  private coerceSnapshot(
    data: Record<string, unknown>,
    schemaVersion: number,
  ): ConversationSnapshot | null {
    const id = typeof data.id === "string" ? data.id : null;
    const status = readStatus(data.status);
    const streamStatus = readStreamStatus(data.streamStatus);
    const createdAt = typeof data.createdAt === "string" ? data.createdAt : null;
    const updatedAt = typeof data.updatedAt === "string" ? data.updatedAt : null;
    const metadata = readMetadata(data.metadata);
    const session = readSession(data.session, id);
    const messages = readMessages(data.messages);

    if (
      !id ||
      !status ||
      !streamStatus ||
      !createdAt ||
      !updatedAt ||
      !metadata ||
      !session ||
      !messages
    ) {
      return null;
    }

    return Object.freeze({
      id,
      status,
      messages: Object.freeze(messages),
      metadata: Object.freeze(metadata),
      session: Object.freeze(session),
      streamStatus,
      createdAt,
      updatedAt,
      schemaVersion,
    });
  }

  private fail(
    fromVersion: number | null,
    reason: string,
  ): ConversationMigrationResult {
    return Object.freeze({
      success: false,
      fromVersion,
      toVersion: this.currentVersion,
      snapshot: null,
      reason,
    });
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readVersion(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readStatus(value: unknown): ConversationStatus | null {
  return typeof value === "string" &&
    (CONVERSATION_STATUSES as readonly string[]).includes(value)
    ? (value as ConversationStatus)
    : null;
}

function readStreamStatus(value: unknown): ConversationStreamStatus | null {
  return typeof value === "string" &&
    (CONVERSATION_STREAM_STATUSES as readonly string[]).includes(value)
    ? (value as ConversationStreamStatus)
    : null;
}

function readMetadata(value: unknown): ConversationMetadata | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.title !== "string" ||
    typeof value.messageCount !== "number" ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string"
  ) {
    return null;
  }

  const lastMessageAt =
    value.lastMessageAt === null
      ? null
      : typeof value.lastMessageAt === "string"
        ? value.lastMessageAt
        : undefined;

  if (lastMessageAt === undefined) {
    return null;
  }

  return Object.freeze({
    title: value.title,
    messageCount: value.messageCount,
    lastMessageAt,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  });
}

function readSession(
  value: unknown,
  conversationId: string | null,
): ConversationSession | null {
  if (!isRecord(value) || !conversationId) {
    return null;
  }

  if (
    typeof value.id !== "string" ||
    typeof value.conversationId !== "string" ||
    typeof value.startedAt !== "string"
  ) {
    return null;
  }

  const endedAt =
    value.endedAt === null
      ? null
      : typeof value.endedAt === "string"
        ? value.endedAt
        : undefined;

  if (endedAt === undefined) {
    return null;
  }

  return Object.freeze({
    id: value.id,
    conversationId: value.conversationId,
    startedAt: value.startedAt,
    endedAt,
  });
}

function readMessages(value: unknown): ConversationMessage[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const messages: ConversationMessage[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) {
      return null;
    }

    if (
      typeof entry.id !== "string" ||
      typeof entry.conversationId !== "string" ||
      typeof entry.role !== "string" ||
      typeof entry.content !== "string" ||
      typeof entry.status !== "string" ||
      typeof entry.createdAt !== "string" ||
      typeof entry.updatedAt !== "string"
    ) {
      return null;
    }

    const message: ConversationMessage = Object.freeze({
      id: entry.id,
      conversationId: entry.conversationId,
      role: entry.role as ConversationMessage["role"],
      content: entry.content,
      status: entry.status as ConversationMessage["status"],
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      ...(typeof entry.errorCode === "string"
        ? { errorCode: entry.errorCode }
        : {}),
    });

    messages.push(message);
  }

  return messages;
}
